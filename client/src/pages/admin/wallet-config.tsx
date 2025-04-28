import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useBrand } from "@/hooks/use-brand";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AlertTriangle, Lock, Save, Upload, Download, Check, Wallet, Share2 } from "lucide-react";
import { supportedCurrencies } from "@shared/schema";

// Define the wallet configuration schema
const walletConfigSchema = z.object({
  transactionDisplayCount: z.number().min(1).max(100),
  allowedCurrencies: z.array(z.string()),
  maxNegativeBalance: z.number().min(0),
  enableAnalytics: z.boolean(),
  enableBulkTransfers: z.boolean(),
  enableTestCards: z.boolean(),
  maxTestCards: z.number().min(0).max(20),
  maxTransferAmount: z.number().min(0),
  defaultCommissionRate: z.number().min(0).max(20),
  retentionPeriodDays: z.number().min(1).max(90),
  maxPrepaidCards: z.number().min(0).max(10).default(3)
});

type WalletConfig = z.infer<typeof walletConfigSchema>;

export default function WalletConfigPage() {
  const { toast } = useToast();
  const { brand, isLoadingBrand, refetchBrand } = useBrand();
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [jsonConfig, setJsonConfig] = useState("");
  const [activeTab, setActiveTab] = useState("general");
  
  // Current wallet configuration from brand settings
  const walletConfig = brand?.walletConfig || {
    transactionDisplayCount: 10,
    allowedCurrencies: ["USD", "EUR", "GBP"],
    maxNegativeBalance: 0,
    enableAnalytics: true,
    enableBulkTransfers: true,
    enableTestCards: true,
    maxTestCards: 5,
    maxTransferAmount: 1000000, // 10,000 in cents
    defaultCommissionRate: 0.5,
    retentionPeriodDays: 7,
    maxPrepaidCards: 3
  };
  
  // Setup form with wallet configuration
  const form = useForm<WalletConfig>({
    resolver: zodResolver(walletConfigSchema),
    defaultValues: walletConfig
  });
  
  // Update form values when brand data loads
  useEffect(() => {
    if (brand?.walletConfig) {
      form.reset(brand.walletConfig);
    }
  }, [brand, form]);
  
  // Update wallet configuration
  const updateConfigMutation = useMutation({
    mutationFn: async (data: WalletConfig) => {
      const response = await apiRequest("PATCH", "/api/brand", {
        walletConfig: data
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brand"] });
      toast({
        title: "Configuration updated",
        description: "Wallet configuration has been saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle form submission
  const onSubmit = (data: WalletConfig) => {
    updateConfigMutation.mutate(data);
  };
  
  // Import configuration from JSON
  const handleImportConfig = () => {
    try {
      const config = JSON.parse(jsonConfig);
      form.reset(config);
      setConfigDialogOpen(false);
      toast({
        title: "Configuration imported",
        description: "JSON configuration has been applied to the form. Click Save to apply changes.",
      });
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "The provided JSON is not valid. Please check the format and try again.",
        variant: "destructive",
      });
    }
  };
  
  // Export configuration as JSON
  const handleExportConfig = () => {
    const configData = form.getValues();
    setJsonConfig(JSON.stringify(configData, null, 2));
    setConfigDialogOpen(true);
  };
  
  return (
    <AdminLayout 
      title="Wallet Configuration" 
      description="Configure the wallet features and behavior"
    >
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wallet className="mr-2 h-5 w-5" />
            Wallet Features Configuration
          </CardTitle>
          <CardDescription>
            Manage the wallet features and options available to your customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="currencies">Currencies</TabsTrigger>
              <TabsTrigger value="limits">Limits & Fees</TabsTrigger>
              <TabsTrigger value="testing">Testing</TabsTrigger>
            </TabsList>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <TabsContent value="general">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="enableAnalytics"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Analytics</FormLabel>
                            <FormDescription>
                              Enable transaction analytics for customers
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="retentionPeriodDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>System Log Retention (Days)</FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-4">
                              <Slider
                                min={1}
                                max={90}
                                step={1}
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                                className="flex-1"
                              />
                              <span className="w-12 text-center font-medium">{field.value}</span>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Number of days to retain system logs
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="transactions">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="transactionDisplayCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transactions Display Count</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={100}
                              value={field.value}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Number of transactions to display in the transaction list
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="enableBulkTransfers"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Bulk Transfers</FormLabel>
                            <FormDescription>
                              Allow customers to perform bulk transfers using CSV uploads
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="currencies">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="allowedCurrencies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Allowed Currencies</FormLabel>
                          <FormControl>
                            <div className="flex flex-wrap gap-2">
                              {supportedCurrencies.map((currency) => (
                                <div 
                                  key={currency.code} 
                                  className="flex items-center space-x-2 border rounded p-2"
                                >
                                  <Checkbox
                                    id={currency.code}
                                    checked={field.value.includes(currency.code)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        field.onChange([...field.value, currency.code]);
                                      } else {
                                        field.onChange(field.value.filter(c => c !== currency.code));
                                      }
                                    }}
                                  />
                                  <label htmlFor={currency.code} className="text-sm font-medium leading-none cursor-pointer">
                                    {currency.name} ({currency.symbol})
                                  </label>
                                </div>
                              ))}
                            </div>
                          </FormControl>
                          <FormDescription>
                            Select the currencies that customers can use
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="limits">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="maxNegativeBalance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Negative Balance ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              value={field.value / 100} // Convert from cents to dollars for display
                              onChange={(e) => field.onChange(Math.round(parseFloat(e.target.value) * 100))} // Store as cents
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum amount of negative balance allowed (0 means no negative balance)
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="maxTransferAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Transfer Amount ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              value={field.value / 100} // Convert from cents to dollars for display
                              onChange={(e) => field.onChange(Math.round(parseFloat(e.target.value) * 100))} // Store as cents
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum amount for a single transfer operation
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="defaultCommissionRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Commission Rate (%)</FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-4">
                              <Slider
                                min={0}
                                max={10}
                                step={0.1}
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                                className="flex-1"
                              />
                              <span className="w-16 text-center font-medium">{field.value}%</span>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Default commission percentage for transfers and exchanges
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="maxPrepaidCards"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Prepaid Cards per User</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              max={10}
                              value={field.value}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum number of prepaid cards a user can add to their wallet (0 to disable prepaid cards)
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="testing">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="enableTestCards"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Test Cards</FormLabel>
                            <FormDescription>
                              Enable test cards for payment testing
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="maxTestCards"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Test Cards per User</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              max={20}
                              value={field.value}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              disabled={!form.getValues().enableTestCards}
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum number of test cards a user can create
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                
                <div className="mt-6 flex justify-between">
                  <div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleExportConfig}
                      className="mr-2"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setConfigDialogOpen(true)}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Import
                    </Button>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={updateConfigMutation.isPending}
                  >
                    {updateConfigMutation.isPending ? (
                      <span className="flex items-center">
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Save className="mr-2 h-4 w-4" />
                        Save Configuration
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Configuration Sharing Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Share2 className="mr-2 h-5 w-5" />
            Configuration Sharing
          </CardTitle>
          <CardDescription>
            Export and share your wallet configuration with others
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="rounded-md bg-muted p-4">
              <h3 className="mb-2 text-sm font-medium">How to Share Your Configuration</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold">Option 1: URL Parameter (Recommended)</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Go to the Brand Settings page and use the 'Share Configuration' button to generate a shareable URL.
                    This URL contains your complete configuration encoded in the <code className="bg-primary-foreground px-1 rounded">config</code> parameter.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold">Option 2: JSON Import</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Either:
                  </p>
                  <ul className="list-disc ml-5 mt-1 text-sm text-muted-foreground">
                    <li>Use the 'Export Configuration' button below to get your JSON configuration</li>
                    <li>Download the configuration from the Brand Settings page</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold">URL Format</h4>
                  <p className="text-sm text-muted-foreground mt-1 mb-2">
                    The configuration URL format is:
                  </p>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="bg-slate-50 p-3 rounded-md border text-sm font-mono overflow-x-auto whitespace-nowrap cursor-help">
                          https://your-domain.com/?config=<span className="text-blue-500">base64encodedConfiguration</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-md p-4">
                        <h4 className="font-medium mb-1">URL Parameter Tutorial</h4>
                        <p className="text-sm mb-2">The configuration is automatically imported when a user visits a URL with the config parameter.</p>
                        <ol className="text-xs space-y-1 list-decimal pl-4">
                          <li>Go to Brand Settings page</li>
                          <li>Click "Generate Shareable URL"</li>
                          <li>Copy and share the generated URL</li>
                          <li>When users visit the URL, all settings will be automatically imported</li>
                        </ol>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <p className="text-sm text-muted-foreground mt-2">
                    The <code className="bg-primary-foreground px-1 rounded">config</code> parameter contains all brand settings and wallet configuration in base64 encoded format.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  window.location.href = "/admin/brand-settings";
                }}
              >
                Go to Brand Settings
              </Button>
              <Button 
                variant="secondary" 
                className="flex-1"
                onClick={handleExportConfig}
              >
                <Download className="mr-2 h-4 w-4" />
                Export Configuration
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* JSON Configuration Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Wallet Configuration JSON</DialogTitle>
            <DialogDescription>
              View, edit, or import wallet configuration in JSON format. This includes wallet settings only.
              For a complete configuration including branding settings, use the Brand Settings page.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              className="font-mono h-[400px]"
              value={jsonConfig}
              onChange={(e) => setJsonConfig(e.target.value)}
              placeholder="Paste JSON configuration here..."
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfigDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleImportConfig}>
              <Check className="mr-2 h-4 w-4" />
              Apply Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}