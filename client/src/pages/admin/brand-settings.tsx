import { useState, useEffect, useRef } from "react";
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
import { ImageIcon, UploadCloud, AlertCircle, Save, Share2, Copy, Download, Palette, CheckCircle, Wand2 } from "lucide-react";
import { insertBrandSettingsSchema, BrandSettings } from "@shared/schema";
import imageCompression from "browser-image-compression";
import BrandLogo from "@/components/ui/brand-logo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConfigImport } from "@/hooks/use-config-import";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose 
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define WalletConfig type to match the schema
type WalletConfig = {
  name?: string;
  tagline?: string | null;
  iconUrl?: string | null;
  logo?: string | null;
  transactionDisplayCount?: number;
  allowedCurrencies?: string[];
  maxNegativeBalance?: number;
  enableAnalytics?: boolean;
  enableBulkTransfers?: boolean;
  enableTestCards?: boolean;
  maxTestCards?: number;
  maxTransferAmount?: number;
  defaultCommissionRate?: number;
  retentionPeriodDays?: number;
};

// Brand settings form schema
const formSchema = insertBrandSettingsSchema.extend({
  logoFile: z.any().optional(),
  iconUrlFile: z.any().optional(),
}).partial();

type FormData = z.infer<typeof formSchema>;

export default function BrandSettingsPage() {
  const { brand, isLoading, updateBrand } = useBrand();
  const { toast } = useToast();
  const [logo, setLogo] = useState<string | null>(null);
  const [icon, setIcon] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form with current brand settings
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      tagline: "",
      walletAuthKey: "",
      iconUrl: "",
      logoFile: undefined,
      iconUrlFile: undefined,
    },
  });
  
  // Update form when brand data is loaded
  useEffect(() => {
    if (brand) {
      form.reset({
        name: brand.name,
        tagline: brand.tagline,
        walletAuthKey: brand.walletAuthKey,
        iconUrl: brand.iconUrl,
      });
      
      if (brand.logo) {
        setLogo(brand.logo);
      }
      
      if (brand.iconUrl) {
        setIcon(brand.iconUrl);
      }
    }
  }, [brand, form]);
  
  // Helper function to check if a string is a URL
  const isValidUrl = (str: string): boolean => {
    try {
      // Check if it starts with http:// or https://
      if (str.startsWith('http://') || str.startsWith('https://')) {
        new URL(str);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Helper function to check if a string is a base64 image
  const isBase64Image = (str: string): boolean => {
    return str.startsWith('data:image/');
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, setImageState: (url: string) => void, formField: "logoFile" | "iconUrlFile") => {
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
    
    try {
      // Show loading toast
      toast({
        title: "Processing image",
        description: "Optimizing image size...",
      });
      
      // Compress the image before uploading
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: formField === "iconUrlFile" ? 128 : 800, // Different sizes for icon vs logo
        useWebWorker: true
      };
      
      const compressedFile = await imageCompression(file, options);
      
      // Convert to base64 for preview and storage
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageState(event.target.result as string);
          form.setValue(formField, event.target.result);
          
          // Update the corresponding URL field if this is an icon
          if (formField === "iconUrlFile") {
            form.setValue("iconUrl", event.target.result as string);
          }
          
          // Success toast
          toast({
            title: "Image ready",
            description: `Image optimized: ${(compressedFile.size / 1024).toFixed(2)}KB`,
          });
        }
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      toast({
        title: "Image processing failed",
        description: "Failed to optimize image. Please try a smaller file.",
        variant: "destructive",
      });
      console.error("Error compressing image:", error);
    }
  };
  
  // Validate and handle URL input changes
  const validateImageUrl = (url: string): boolean => {
    if (!url) return true;
    
    if (isValidUrl(url) || isBase64Image(url)) {
      return true;
    }
    
    toast({
      title: "Invalid URL format",
      description: "Please enter a valid URL starting with http:// or https://",
      variant: "destructive",
    });
    return false;
  };
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageChange(e, setLogo, "logoFile");
  };
  
  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageChange(e, setIcon, "iconUrlFile");
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
      
      // Handle logo - prioritize direct logoFile field input if present
      if (data.logoFile && typeof data.logoFile === 'string') {
        // Check if it's a valid image URL or base64
        if (isValidUrl(data.logoFile) || isBase64Image(data.logoFile)) {
          updateData.logo = data.logoFile;
        } else {
          toast({
            title: "Invalid logo format",
            description: "The logo URL or base64 data is invalid",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }
      
      // Handle icon - prioritize direct iconUrl field input
      if (data.iconUrl && typeof data.iconUrl === 'string') {
        // Check if it's a valid image URL or base64
        if (isValidUrl(data.iconUrl) || isBase64Image(data.iconUrl)) {
          updateData.iconUrl = data.iconUrl;
        } else {
          toast({
            title: "Invalid icon format",
            description: "The icon URL or base64 data is invalid",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }
      // Fallback to iconUrlFile if iconUrl is not present but iconUrlFile is
      else if (data.iconUrlFile && typeof data.iconUrlFile === 'string') {
        if (isValidUrl(data.iconUrlFile) || isBase64Image(data.iconUrlFile)) {
          updateData.iconUrl = data.iconUrlFile;
        }
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
                    name="logoFile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL or Base64</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter logo URL or paste base64 data" 
                            value={field.value || ''}
                            onChange={(e) => {
                              field.onChange(e);
                              // If the input is a valid URL or base64, update the preview
                              if (validateImageUrl(e.target.value)) {
                                setLogo(e.target.value);
                              }
                            }}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormDescription>
                          URL to a logo or base64 image data. You can also upload a logo below.
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
                  
                  <FormField
                    control={form.control}
                    name="iconUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Icon URL or Base64</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter icon URL or paste base64 data" 
                            value={field.value || ''}
                            onChange={(e) => {
                              field.onChange(e);
                              // If the input is a valid URL or base64, update the preview
                              if (validateImageUrl(e.target.value)) {
                                setIcon(e.target.value);
                                form.setValue("iconUrlFile", e.target.value);
                              }
                            }}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormDescription>
                          URL to an icon or base64 image data. You can also upload an icon below.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div>
                  <Tabs defaultValue="logo" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="logo">Logo</TabsTrigger>
                      <TabsTrigger value="icon">Icon</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="logo">
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
                              Recommended size: 300x100 pixels, PNG or SVG format. 
                              Larger images will be automatically optimized.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                    
                    <TabsContent value="icon">
                      <FormField
                        control={form.control}
                        name="iconUrlFile"
                        render={() => (
                          <FormItem>
                            <FormLabel>Brand Icon</FormLabel>
                            <FormControl>
                              <div className="mt-2">
                                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                                  <input
                                    id="icon-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleIconChange}
                                  />
                                  
                                  {icon ? (
                                    <div className="flex flex-col items-center">
                                      <img 
                                        src={icon} 
                                        alt="Brand Icon" 
                                        className="h-24 w-24 mb-4 object-contain"
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => document.getElementById('icon-upload')?.click()}
                                      >
                                        Change Icon
                                      </Button>
                                    </div>
                                  ) : (
                                    <div 
                                      className="flex flex-col items-center cursor-pointer"
                                      onClick={() => document.getElementById('icon-upload')?.click()}
                                    >
                                      <UploadCloud className="mx-auto h-12 w-12 text-neutral-400 mb-2" />
                                      <p className="text-sm text-neutral-600 mb-2">
                                        Drag and drop your icon here
                                      </p>
                                      <p className="text-xs text-neutral-500">or</p>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="mt-2"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          document.getElementById('icon-upload')?.click();
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
                              Recommended size: 128x128 pixels, square format. 
                              This icon will be used for favicons and mobile bookmarks.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </Tabs>
                  
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
              
              <CardFooter className="px-0 pt-6 flex justify-between">
                <div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex items-center mr-2">
                        <Share2 className="mr-2 h-4 w-4" />
                        Share Configuration
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Share Configuration</DialogTitle>
                        <DialogDescription>
                          You can share your wallet configuration with other instances by using this URL.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex items-center space-x-2 mt-4">
                        <div className="grid flex-1 gap-2">
                          <ShareConfigSection brand={brand} />
                        </div>
                      </div>
                      <DialogFooter className="sm:justify-end mt-4">
                        <DialogClose asChild>
                          <Button type="button" variant="secondary">Close</Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                
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
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Branding Preview Sandbox</CardTitle>
          <CardDescription>
            Preview how your brand will appear across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border rounded-lg">
              <h3 className="text-sm font-medium mb-2">Logo</h3>
              <div className="flex items-center justify-center bg-slate-50 rounded-lg p-4 h-20">
                <BrandLogo className="h-12" />
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="text-sm font-medium mb-2">Icon</h3>
              <div className="flex items-center justify-center bg-slate-50 rounded-lg p-4 h-20">
                <BrandLogo className="h-12 w-12" useIcon={true} />
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="text-sm font-medium mb-2">Brand Name</h3>
              <div className="flex items-center justify-center bg-slate-50 rounded-lg p-4 h-20">
                <span className="text-xl font-semibold">{brand?.name || "PaySage Wallet"}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="mr-2 h-5 w-5" />
            Personalized Wallet Theme Generator
          </CardTitle>
          <CardDescription>
            Generate a custom theme for your wallet based on your branding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="rounded-md bg-muted p-4">
              <h3 className="text-sm font-medium mb-3">Theme Generation Features</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                  <span>Automatic color palette generation based on your logo</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                  <span>Custom card backgrounds and UI elements</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                  <span>Multiple theme options (light/dark/custom)</span>
                </li>
              </ul>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-24 flex items-center justify-center">
                  <BrandLogo className="h-12 text-white" />
                </div>
                <div className="p-4">
                  <h4 className="font-medium mb-1">Modern Gradient</h4>
                  <p className="text-sm text-muted-foreground">Vibrant color gradients with smooth transitions</p>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-slate-800 h-24 flex items-center justify-center">
                  <BrandLogo className="h-12 text-amber-400" />
                </div>
                <div className="p-4">
                  <h4 className="font-medium mb-1">Dark Professional</h4>
                  <p className="text-sm text-muted-foreground">High-contrast dark theme for clarity</p>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-green-50 h-24 flex items-center justify-center">
                  <BrandLogo className="h-12 text-emerald-600" />
                </div>
                <div className="p-4">
                  <h4 className="font-medium mb-1">Eco Finance</h4>
                  <p className="text-sm text-muted-foreground">Light, sustainable-looking theme</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-4">
              <Button variant="outline" disabled className="flex items-center">
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Theme
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <Button variant="secondary" disabled className="w-full sm:w-auto">
                        <Save className="mr-2 h-4 w-4" />
                        Apply Theme
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Coming in a future update</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}

interface ShareConfigSectionProps {
  brand: BrandSettings | null;
}

function ShareConfigSection({ brand }: ShareConfigSectionProps) {
  const { generateConfigUrl } = useConfigImport();
  const { toast } = useToast();
  const [configUrl, setConfigUrl] = useState<string>("");
  const [exporting, setExporting] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Generate a sharable configuration URL
  const handleGenerateUrl = () => {
    if (!brand) return;
    
    try {
      setExporting(true);
      
      // Create a configuration object with all brand settings
      const config: WalletConfig = {
        name: brand.name,
        tagline: brand.tagline,
        iconUrl: brand.iconUrl,
        logo: brand.logo
      };
      
      // Add wallet configuration properties if they exist
      if (brand.walletConfig) {
        // Parse the JSON if it's a string
        const walletConfig = typeof brand.walletConfig === 'string' 
          ? JSON.parse(brand.walletConfig) 
          : brand.walletConfig;
          
        // Add each property to the config object
        if (walletConfig.transactionDisplayCount !== undefined) 
          config.transactionDisplayCount = walletConfig.transactionDisplayCount;
        if (walletConfig.allowedCurrencies !== undefined) 
          config.allowedCurrencies = walletConfig.allowedCurrencies;
        if (walletConfig.maxNegativeBalance !== undefined) 
          config.maxNegativeBalance = walletConfig.maxNegativeBalance;
        if (walletConfig.enableAnalytics !== undefined) 
          config.enableAnalytics = walletConfig.enableAnalytics;
        if (walletConfig.enableBulkTransfers !== undefined) 
          config.enableBulkTransfers = walletConfig.enableBulkTransfers;
        if (walletConfig.enableTestCards !== undefined) 
          config.enableTestCards = walletConfig.enableTestCards;
        if (walletConfig.maxTestCards !== undefined) 
          config.maxTestCards = walletConfig.maxTestCards;
        if (walletConfig.maxTransferAmount !== undefined) 
          config.maxTransferAmount = walletConfig.maxTransferAmount;
        if (walletConfig.defaultCommissionRate !== undefined) 
          config.defaultCommissionRate = walletConfig.defaultCommissionRate;
        if (walletConfig.retentionPeriodDays !== undefined) 
          config.retentionPeriodDays = walletConfig.retentionPeriodDays;
      }
      
      // Generate the URL with the configuration
      const url = generateConfigUrl(config);
      setConfigUrl(url);
      
      toast({
        title: "Configuration URL Generated",
        description: "The URL has been created. Copy it to share your configuration.",
      });
    } catch (error) {
      toast({
        title: "Failed to Generate URL",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };
  
  // Copy the URL to clipboard
  const handleCopyUrl = () => {
    if (!configUrl) return;
    
    navigator.clipboard.writeText(configUrl)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "The configuration URL has been copied to your clipboard.",
        });
      })
      .catch((error) => {
        toast({
          title: "Failed to copy",
          description: error.message || "An error occurred while copying to clipboard.",
          variant: "destructive",
        });
      });
  };
  
  // Download configuration as JSON file
  const handleDownloadConfig = () => {
    if (!brand) return;
    
    try {
      // Create a complete configuration object including all settings
      const config: WalletConfig = {
        name: brand.name,
        tagline: brand.tagline,
        iconUrl: brand.iconUrl,
        logo: brand.logo
      };
      
      // Add wallet configuration properties if they exist
      if (brand.walletConfig) {
        // Parse the JSON if it's a string
        const walletConfig = typeof brand.walletConfig === 'string' 
          ? JSON.parse(brand.walletConfig) 
          : brand.walletConfig;
          
        // Add each property to the config object
        if (walletConfig.transactionDisplayCount !== undefined) 
          config.transactionDisplayCount = walletConfig.transactionDisplayCount;
        if (walletConfig.allowedCurrencies !== undefined) 
          config.allowedCurrencies = walletConfig.allowedCurrencies;
        if (walletConfig.maxNegativeBalance !== undefined) 
          config.maxNegativeBalance = walletConfig.maxNegativeBalance;
        if (walletConfig.enableAnalytics !== undefined) 
          config.enableAnalytics = walletConfig.enableAnalytics;
        if (walletConfig.enableBulkTransfers !== undefined) 
          config.enableBulkTransfers = walletConfig.enableBulkTransfers;
        if (walletConfig.enableTestCards !== undefined) 
          config.enableTestCards = walletConfig.enableTestCards;
        if (walletConfig.maxTestCards !== undefined) 
          config.maxTestCards = walletConfig.maxTestCards;
        if (walletConfig.maxTransferAmount !== undefined) 
          config.maxTransferAmount = walletConfig.maxTransferAmount;
        if (walletConfig.defaultCommissionRate !== undefined) 
          config.defaultCommissionRate = walletConfig.defaultCommissionRate;
        if (walletConfig.retentionPeriodDays !== undefined) 
          config.retentionPeriodDays = walletConfig.retentionPeriodDays;
      }
      
      // Convert to JSON
      const configJson = JSON.stringify(config, null, 2);
      const blob = new Blob([configJson], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      // Create a download link
      const link = document.createElement("a");
      link.href = url;
      link.download = `wallet-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Configuration Downloaded",
        description: "The configuration has been downloaded as a JSON file.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          You can share your wallet configuration with others by generating a URL 
          or downloading it as a JSON file.
        </p>
        
        <div className="flex flex-col space-y-2">
          <Button 
            variant="outline" 
            onClick={handleGenerateUrl}
            disabled={exporting || !brand}
            className="w-full"
          >
            {exporting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                Generating...
              </>
            ) : (
              <>
                <Share2 className="mr-2 h-4 w-4" /> 
                Generate Shareable URL
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleDownloadConfig}
            disabled={!brand}
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" /> 
            Download Configuration
          </Button>
        </div>
      </div>
      
      {configUrl && (
        <div className="flex items-center space-x-2 mt-4">
          <div className="grid flex-1 gap-2">
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                readOnly
                value={configUrl}
                className="flex-1"
              />
              <Button 
                size="icon" 
                variant="outline" 
                type="button" 
                onClick={handleCopyUrl}
                className="px-3"
              >
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy</span>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Share this URL with others who want to use your configuration.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
