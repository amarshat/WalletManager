import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PlusCircle, Trash2, Building2, Edit, UsersRound } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface Tenant {
  id: number;
  tenantId: string;
  name: string;
  createdAt: string;
  logo?: string;
  tagline?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  isAdmin: boolean;
}

// Form schema for creating/editing tenants
const tenantFormSchema = z.object({
  tenantId: z.string().min(3, "Tenant ID must be at least 3 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  logo: z.string().optional(),
  tagline: z.string().optional(),
  primaryColor: z.string().default("#4F46E5"),
  secondaryColor: z.string().default("#818CF8"),
  // Admin credentials section
  adminUsername: z.string().min(3, "Admin username must be at least 3 characters"),
  adminPassword: z.string().min(8, "Admin password must be at least 8 characters"),
  adminFullName: z.string().min(2, "Admin full name must be at least 2 characters"),
  adminEmail: z.string().email("Please enter a valid email").optional(),
});

type TenantFormValues = z.infer<typeof tenantFormSchema>;

export default function SuperAdminDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("tenants");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  
  // Fetch all tenants
  const { data: tenants, isLoading: isLoadingTenants } = useQuery<Tenant[]>({
    queryKey: ['/api/superadmin/tenants'],
    staleTime: 1000 * 60, // 1 minute
  });
  
  // Fetch all users across tenants
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/superadmin/users'],
    staleTime: 1000 * 60, // 1 minute
  });
  
  // Create tenant mutation with admin account
  const createTenantMutation = useMutation({
    mutationFn: async ({ 
      tenant, 
      adminInfo 
    }: { 
      tenant: Omit<TenantFormValues, 'adminUsername' | 'adminPassword' | 'adminFullName' | 'adminEmail'>, 
      adminInfo: { 
        username: string, 
        password: string, 
        fullName: string, 
        email: string | null,
        isAdmin: boolean 
      } 
    }) => {
      const res = await apiRequest("POST", "/api/superadmin/tenants", { tenant, adminInfo });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Tenant created",
        description: "The tenant and admin account have been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/superadmin/tenants'] });
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create tenant",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update tenant mutation with optional admin account update
  const updateTenantMutation = useMutation({
    mutationFn: async ({ 
      id, 
      tenant, 
      adminInfo 
    }: { 
      id: number, 
      tenant: Omit<TenantFormValues, 'adminUsername' | 'adminPassword' | 'adminFullName' | 'adminEmail'>,
      adminInfo?: { 
        username: string, 
        password: string, 
        fullName: string, 
        email: string | null,
        isAdmin: boolean 
      }
    }) => {
      const res = await apiRequest("PATCH", `/api/superadmin/tenants/${id}`, { tenant, adminInfo });
      return await res.json();
    },
    onSuccess: (data) => {
      const adminUpdated = data.adminUpdated;
      
      toast({
        title: "Tenant updated",
        description: adminUpdated 
          ? "The tenant and admin account have been updated." 
          : "The tenant branding has been updated successfully.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/superadmin/tenants'] });
      setIsDialogOpen(false);
      setEditingTenant(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update tenant",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete tenant mutation
  const deleteTenantMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/superadmin/tenants/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Tenant deleted",
        description: "The tenant has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/superadmin/tenants'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete tenant",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Form for creating/editing tenants
  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      tenantId: "",
      name: "",
      logo: "",
    },
  });
  
  // Reset form when dialog is opened for creating a new tenant
  useEffect(() => {
    if (!isDialogOpen && !editingTenant) {
      form.reset({
        tenantId: "",
        name: "",
        logo: "",
        tagline: "",
        primaryColor: "#4F46E5",
        secondaryColor: "#818CF8",
        adminUsername: "",
        adminPassword: "",
        adminFullName: "",
        adminEmail: "",
      });
    }
  }, [isDialogOpen, editingTenant, form]);
  
  // Set form values when editing a tenant
  useEffect(() => {
    if (editingTenant) {
      form.reset({
        tenantId: editingTenant.tenantId,
        name: editingTenant.name,
        logo: editingTenant.logo || "",
        tagline: editingTenant.tagline || "",
        primaryColor: editingTenant.primaryColor || "#4F46E5",
        secondaryColor: editingTenant.secondaryColor || "#818CF8",
        // When editing, we don't prefill admin credentials
        adminUsername: "",
        adminPassword: "",
        adminFullName: "",
        adminEmail: "",
      });
      setIsDialogOpen(true);
    }
  }, [editingTenant, form]);
  
  // Handle form submission
  const onSubmit = (values: TenantFormValues) => {
    // Extract admin credentials 
    const { 
      adminUsername, 
      adminPassword, 
      adminFullName, 
      adminEmail, 
      ...tenantData 
    } = values;
    
    // When editing an existing tenant
    if (editingTenant) {
      // Update tenant with the new branding info
      updateTenantMutation.mutate({ 
        id: editingTenant.id, 
        tenant: tenantData,
        // Only include admin info if provided (all fields must be filled)
        adminInfo: (adminUsername && adminPassword && adminFullName) ? {
          username: adminUsername,
          password: adminPassword,
          fullName: adminFullName,
          email: adminEmail || null,
          isAdmin: true
        } : undefined
      });
    } 
    // When creating a new tenant
    else {
      // Require admin credentials for new tenants
      if (!adminUsername || !adminPassword || !adminFullName) {
        toast({
          title: "Admin credentials required",
          description: "Please provide admin credentials for the new tenant",
          variant: "destructive"
        });
        return;
      }
      
      // Create tenant with admin credentials
      createTenantMutation.mutate({
        tenant: tenantData,
        adminInfo: {
          username: adminUsername,
          password: adminPassword,
          fullName: adminFullName,
          email: adminEmail || null,
          isAdmin: true
        }
      });
    }
  };
  
  // Handle tenant deletion
  const handleDeleteTenant = (id: number) => {
    if (window.confirm("Are you sure you want to delete this tenant? This action cannot be undone.")) {
      deleteTenantMutation.mutate(id);
    }
  };
  
  return (
    <AdminLayout title="SuperAdmin Dashboard" description="Manage all tenants and users across the system">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tenants" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Organization Management</CardTitle>
                <CardDescription>
                  Manage all organizations in the multi-tenant system
                </CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingTenant(null)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Organization
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingTenant ? "Edit Organization" : "Add Organization"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingTenant 
                        ? "Update the organization details below." 
                        : "Fill in the details to create a new organization."}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Organization Details</h3>
                        <FormField
                          control={form.control}
                          name="tenantId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Organization ID</FormLabel>
                              <FormControl>
                                <Input placeholder="unique-org-id" {...field} />
                              </FormControl>
                              <FormDescription>
                                A unique identifier for the organization, used in URLs
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Organization Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Acme Corporation" {...field} />
                              </FormControl>
                              <FormDescription>
                                The display name for the organization
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="space-y-4 pt-2 border-t">
                        <h3 className="text-lg font-medium">Branding</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="logo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Logo URL</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://example.com/logo.svg" {...field} />
                                </FormControl>
                                <FormDescription>
                                  URL to the organization's logo
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="tagline"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tagline</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your Digital Wallet Solution" {...field} />
                                </FormControl>
                                <FormDescription>
                                  A short slogan for the organization
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="primaryColor"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Primary Color</FormLabel>
                                <div className="flex gap-2">
                                  <div 
                                    className="h-9 w-9 rounded-md border"
                                    style={{ backgroundColor: field.value }}
                                  />
                                  <FormControl>
                                    <Input placeholder="#4F46E5" {...field} />
                                  </FormControl>
                                </div>
                                <FormDescription>
                                  Main brand color (HEX format: #RRGGBB)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="secondaryColor"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Secondary Color</FormLabel>
                                <div className="flex gap-2">
                                  <div 
                                    className="h-9 w-9 rounded-md border"
                                    style={{ backgroundColor: field.value }}
                                  />
                                  <FormControl>
                                    <Input placeholder="#7E57C2" {...field} />
                                  </FormControl>
                                </div>
                                <FormDescription>
                                  Used for gradients and accents (HEX format)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="secondaryColor"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Secondary Color</FormLabel>
                                <div className="flex gap-2">
                                  <div 
                                    className="h-9 w-9 rounded-md border"
                                    style={{ backgroundColor: field.value }}
                                  />
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4 pt-2 border-t">
                        <h3 className="text-lg font-medium">Default Admin Account</h3>
                        <p className="text-sm text-muted-foreground -mt-2">
                          {editingTenant 
                            ? "Leave blank if you don't want to modify the admin account" 
                            : "Create an administrator account for this organization"}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="adminUsername"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Admin Username</FormLabel>
                                <FormControl>
                                  <Input placeholder="admin" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="adminPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Admin Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="adminFullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Admin Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="adminEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Admin Email (optional)</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="admin@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <div className="flex items-center justify-between w-full">
                          <p className="text-xs text-muted-foreground">
                            All tenants are co-branded with "Powered by PaySage AI"
                          </p>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setIsDialogOpen(false);
                                setEditingTenant(null);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button 
                              type="submit"
                              disabled={createTenantMutation.isPending || updateTenantMutation.isPending}
                            >
                              {createTenantMutation.isPending || updateTenantMutation.isPending 
                                ? "Saving..." 
                                : editingTenant ? "Update" : "Create"}
                            </Button>
                          </div>
                        </div>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isLoadingTenants ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : tenants && tenants.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenants.map((tenant) => (
                      <TableRow key={tenant.id}>
                        <TableCell className="font-medium">{tenant.id}</TableCell>
                        <TableCell className="flex items-center gap-2">
                          {tenant.logo ? (
                            <img src={tenant.logo} alt={tenant.name} className="h-6 w-6" />
                          ) : (
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                          )}
                          {tenant.name}
                        </TableCell>
                        <TableCell>{tenant.tenantId}</TableCell>
                        <TableCell>
                          {new Date(tenant.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingTenant(tenant)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteTenant(tenant.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No organizations found</h3>
                  <p className="text-muted-foreground mt-1">
                    Create your first organization to get started.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage all users across organizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingUsers ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : users && users.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.id}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.fullName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.isAdmin ? "Yes" : "No"}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              // Edit user functionality would go here
                              toast({
                                title: "Not implemented",
                                description: "User editing is not yet implemented.",
                                variant: "default",
                              });
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center">
                  <UsersRound className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No users found</h3>
                  <p className="text-muted-foreground mt-1">
                    There are no users in the system yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}