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
  
  // Create tenant mutation
  const createTenantMutation = useMutation({
    mutationFn: async (tenant: TenantFormValues) => {
      const res = await apiRequest("POST", "/api/superadmin/tenants", tenant);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Tenant created",
        description: "The tenant has been created successfully.",
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
  
  // Update tenant mutation
  const updateTenantMutation = useMutation({
    mutationFn: async ({ id, tenant }: { id: number, tenant: TenantFormValues }) => {
      const res = await apiRequest("PATCH", `/api/superadmin/tenants/${id}`, tenant);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Tenant updated",
        description: "The tenant has been updated successfully.",
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
      });
      setIsDialogOpen(true);
    }
  }, [editingTenant, form]);
  
  // Handle form submission
  const onSubmit = (values: TenantFormValues) => {
    if (editingTenant) {
      updateTenantMutation.mutate({ id: editingTenant.id, tenant: values });
    } else {
      createTenantMutation.mutate(values);
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
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                              URL to the organization's logo (optional)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
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