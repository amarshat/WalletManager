import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useBrand } from "@/hooks/use-brand";
import { useToast } from "@/hooks/use-toast";
import { ImageIcon, UploadCloud, AlertCircle, Save } from "lucide-react";
import { insertBrandSettingsSchema, BrandSettings } from "@shared/schema";

// Brand settings form schema
const formSchema = insertBrandSettingsSchema.extend({
  logoFile: z.any().optional(),
}).partial();

type FormData = z.infer<typeof formSchema>;

export default function BrandSettingsPage() {
  const { brand, isLoading, updateBrand } = useBrand();
  const { toast } = useToast();
  const [logo, setLogo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form with current brand settings
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      tagline: "",
      walletAuthKey: "",
      logoFile: undefined,
    },
  });
  
  // Update form when brand data is loaded
  useEffect(() => {
    if (brand) {
      form.reset({
        name: brand.name,
        tagline: brand.tagline,
        walletAuthKey: brand.walletAuthKey,
      });
      
      if (brand.logo) {
        setLogo(brand.logo);
      }
    }
  }, [brand, form]);
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setLogo(event.target.result as string);
        form.setValue("logoFile", event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };
  
  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      
      // Prepare data for API
      const updateData: Partial<BrandSettings> = {
        name: data.name,
        tagline: data.tagline,
        walletAuthKey: data.walletAuthKey,
      };
      
      // If a new logo was uploaded
      if (data.logoFile && typeof data.logoFile === 'string') {
        updateData.logo = data.logoFile;
      }
      
      await updateBrand(updateData);
      toast({
        title: "Brand settings updated",
        description: "Your changes have been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <AdminLayout 
        title="Brand Settings" 
        description="Customize your wallet branding"
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout 
      title="Brand Settings" 
      description="Customize your wallet branding"
    >
      <Card>
        <CardHeader>
          <CardTitle>Brand Configuration</CardTitle>
          <CardDescription>
            Configure how your wallet platform appears to customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter brand name" {...field} />
                        </FormControl>
                        <FormDescription>
                          This name will be displayed throughout the platform
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
                        <FormLabel>Brand Tagline</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter brand tagline" 
                            className="resize-none"
                            value={field.value || ''}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormDescription>
                          A short phrase describing your platform
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="walletAuthKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wallet Auth Key</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter wallet auth key" 
                            type="password"
                            value={field.value || ''}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormDescription>
                          Authentication key for external wallet services
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div>
                  <FormField
                    control={form.control}
                    name="logoFile"
                    render={() => (
                      <FormItem>
                        <FormLabel>Brand Logo</FormLabel>
                        <FormControl>
                          <div className="mt-2">
                            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                              <input
                                id="logo-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleLogoChange}
                              />
                              
                              {logo ? (
                                <div className="flex flex-col items-center">
                                  <img 
                                    src={logo} 
                                    alt="Brand Logo" 
                                    className="max-h-32 mb-4"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => document.getElementById('logo-upload')?.click()}
                                  >
                                    Change Logo
                                  </Button>
                                </div>
                              ) : (
                                <div 
                                  className="flex flex-col items-center cursor-pointer"
                                  onClick={() => document.getElementById('logo-upload')?.click()}
                                >
                                  <UploadCloud className="mx-auto h-12 w-12 text-neutral-400 mb-2" />
                                  <p className="text-sm text-neutral-600 mb-2">
                                    Drag and drop your logo here
                                  </p>
                                  <p className="text-xs text-neutral-500">or</p>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      document.getElementById('logo-upload')?.click();
                                    }}
                                  >
                                    Browse Files
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Recommended size: 300x100 pixels, PNG or SVG format
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-800">Important</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          All branding changes will be immediately visible to all users of the platform.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <CardFooter className="px-0 pt-6 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex items-center"
                >
                  {isSubmitting ? (
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
    </AdminLayout>
  );
}
