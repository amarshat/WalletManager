import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import CustomerLayout from "@/components/layouts/CustomerLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { supportedCurrencies } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, User, Building2, LogOut } from "lucide-react";

// Profile update schema
const profileFormSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  country: z.string().optional(),
  defaultCurrency: z.string(),
  profilePhoto: z.any().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function Profile() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  
  // Initialize form with user data
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      country: "",
      defaultCurrency: "USD",
    },
  });
  
  // Update form when user data is loaded
  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.fullName,
        email: user.email || "",
        country: user.country || "",
        defaultCurrency: user.defaultCurrency,
      });
      
      if (user.profilePhoto) {
        setProfileImage(user.profilePhoto);
      }
    }
  }, [user, form]);
  
  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<ProfileFormValues>) => {
      const res = await apiRequest("PUT", `/api/users/${user!.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      setIsUpdating(false);
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
      setIsUpdating(false);
    }
  });
  
  // Handle form submission
  const onSubmit = (data: ProfileFormValues) => {
    setIsUpdating(true);
    
    // Prepare data for API
    const updateData: Partial<ProfileFormValues> = {
      fullName: data.fullName,
      email: data.email || null,
      country: data.country || null,
      defaultCurrency: data.defaultCurrency,
    };
    
    // If a new profile photo was uploaded
    if (data.profilePhoto && typeof data.profilePhoto === 'string') {
      updateData.profilePhoto = data.profilePhoto;
    }
    
    updateProfileMutation.mutate(updateData);
  };
  
  // Handle profile image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }
    
    // Convert to base64 for preview and storage
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setProfileImage(event.target.result as string);
        form.setValue("profilePhoto", event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };
  
  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };
  
  if (!user) {
    return (
      <CustomerLayout title="Profile" description="Manage your account information">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </CustomerLayout>
    );
  }
  
  return (
    <CustomerLayout title="Profile" description="Manage your account information">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your account details and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Your email address" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="Your country" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="defaultCurrency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Currency</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {supportedCurrencies.map((currency) => (
                              <SelectItem key={currency.code} value={currency.code}>
                                {currency.code} - {currency.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          This will be your primary currency for the wallet
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div>
                  <FormField
                    control={form.control}
                    name="profilePhoto"
                    render={() => (
                      <FormItem>
                        <FormLabel>Profile Photo</FormLabel>
                        <FormControl>
                          <div className="flex flex-col items-center space-y-4">
                            <Avatar className="w-32 h-32">
                              {profileImage ? (
                                <img src={profileImage} alt="Profile" />
                              ) : (
                                <AvatarFallback className="text-2xl bg-primary text-white">
                                  {user.fullName ? getInitials(user.fullName) : <User className="h-12 w-12" />}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            
                            <div>
                              <input
                                id="profile-photo-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById('profile-photo-upload')?.click()}
                              >
                                Change Photo
                              </Button>
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription className="text-center mt-2">
                          Upload a square image for best results
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="mt-6 p-4 bg-neutral-100 rounded-md">
                    <h3 className="font-medium text-sm mb-2">Account Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Username</span>
                        <span className="font-medium">{user.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Member Since</span>
                        <span className="font-medium">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <CardFooter className="px-0 pt-6 flex justify-end">
                <Button 
                  type="submit" 
                  className="flex items-center"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {/* Tenant/Organization Management Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Organization Settings</CardTitle>
          <CardDescription>
            Change or switch between organizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Current Organization</h3>
              <div className="flex items-center p-3 border rounded-md bg-muted/20">
                <Building2 className="h-5 w-5 mr-3 text-primary" />
                <span className="font-medium">
                  {localStorage.getItem('selectedTenantId') || 'Default Organization'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => {
              // Switch organization (keep user logged in)
              setLocation('/tenant-select');
              
              toast({
                title: "Organization Selection",
                description: "Please select your organization"
              });
            }}
          >
            <Building2 className="w-4 h-4 mr-2" />
            Switch Organization
          </Button>
          
          <Button
            variant="destructive"
            onClick={() => {
              // Log out user completely
              logoutMutation.mutate(undefined, {
                onSuccess: () => {
                  // Clear tenant selection too
                  localStorage.removeItem('selectedTenantId');
                  setLocation('/tenant-select');
                  
                  toast({
                    title: "Logged Out",
                    description: "You have been logged out successfully"
                  });
                }
              });
            }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log Out & Switch
          </Button>
        </CardFooter>
      </Card>
    </CustomerLayout>
  );
}
