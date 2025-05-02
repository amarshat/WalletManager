import { useEffect, useState } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Code, CopyIcon, ExternalLink, Globe, Monitor } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

type WidgetType = "balance" | "transactions" | "prepaid-cards" | "profile" | "carbon-impact" | "quick-actions";
type WidgetTheme = "light" | "dark";

interface WidgetConfig {
  type: WidgetType;
  title?: string;
  theme: WidgetTheme;
  width?: string;
  height?: string;
  currency?: string;
}

export default function EmbeddedWidgets() {
  const [config, setConfig] = useState<WidgetConfig>({
    type: "balance",
    theme: "light"
  });
  
  const [scriptTag, setScriptTag] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const { toast } = useToast();
  
  // Update script tag when config changes
  useEffect(() => {
    const attributes = [
      `data-widget="${config.type}"`,
      `data-theme="${config.theme}"`,
    ];
    
    if (config.title) {
      attributes.push(`data-title="${config.title}"`);
    }
    
    if (config.width) {
      attributes.push(`data-width="${config.width}"`);
    }
    
    if (config.height) {
      attributes.push(`data-height="${config.height}"`);
    }
    
    if (config.currency) {
      attributes.push(`data-currency="${config.currency}"`);
    }
    
    setScriptTag(`<script src="https://wallet.amar.im/widget.js" ${attributes.join(" ")}></script>`);
  }, [config]);
  
  // Set demo URLs
  useEffect(() => {
    const url = window.location.origin;
    setDemoUrl(`${url}/demo/${config.type === "balance" || config.type === "quick-actions" ? "gaming" : "parking"}`);
  }, [config.type]);
  
  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(scriptTag);
    toast({
      title: "Copied to clipboard",
      description: "Widget code has been copied to your clipboard"
    });
  };
  
  return (
    <div className="container max-w-6xl mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Embedded Widgets</h1>
          <p className="text-muted-foreground mt-1">
            Integrate PaySage Wallet into any website with our embeddable widgets
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Widget Configuration</CardTitle>
              <CardDescription>
                Customize your widget appearance and behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="widget-type">Widget Type</Label>
                <Select
                  value={config.type}
                  onValueChange={(value) => setConfig({...config, type: value as WidgetType})}
                >
                  <SelectTrigger id="widget-type">
                    <SelectValue placeholder="Select widget type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="balance">Balance Widget</SelectItem>
                    <SelectItem value="transactions">Transactions Widget</SelectItem>
                    <SelectItem value="prepaid-cards">Prepaid Cards Widget</SelectItem>
                    <SelectItem value="profile">User Profile Widget</SelectItem>
                    <SelectItem value="carbon-impact">Carbon Impact Widget</SelectItem>
                    <SelectItem value="quick-actions">Quick Actions Widget</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="widget-theme">Theme</Label>
                <Select
                  value={config.theme}
                  onValueChange={(value) => setConfig({...config, theme: value as WidgetTheme})}
                >
                  <SelectTrigger id="widget-theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="widget-title">Custom Title (Optional)</Label>
                <Input 
                  id="widget-title" 
                  placeholder="My Wallet" 
                  value={config.title || ''} 
                  onChange={(e) => setConfig({...config, title: e.target.value})}
                />
              </div>
              
              {config.type === 'balance' && (
                <div className="space-y-2">
                  <Label htmlFor="widget-currency">Currency Filter (Optional)</Label>
                  <Select
                    value={config.currency || ''}
                    onValueChange={(value) => setConfig({...config, currency: value || undefined})}
                  >
                    <SelectTrigger id="widget-currency">
                      <SelectValue placeholder="All currencies" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Currencies</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Show balance for a specific currency only
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="widget-width">Width (Optional)</Label>
                  <Input 
                    id="widget-width" 
                    placeholder="300px" 
                    value={config.width || ''} 
                    onChange={(e) => setConfig({...config, width: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="widget-height">Height (Optional)</Label>
                  <Input 
                    id="widget-height" 
                    placeholder="200px" 
                    value={config.height || ''} 
                    onChange={(e) => setConfig({...config, height: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Implementation</CardTitle>
              <CardDescription>
                Copy and paste this code into your website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{scriptTag}</code>
                </pre>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="absolute top-3 right-3"
                  onClick={handleCopy}
                >
                  <CopyIcon className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-2">View demo implementations:</p>
                <div className="flex flex-wrap gap-2">
                  <a href="/demo/gaming" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Globe className="h-4 w-4" />
                      Gaming Demo
                    </Button>
                  </a>
                  <a href="/demo/parking" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Globe className="h-4 w-4" />
                      Parking Demo
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Widget Preview</CardTitle>
              <CardDescription>
                See how your widget will appear on your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="preview" className="h-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="preview">
                    <Monitor className="h-4 w-4 mr-2" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="code">
                    <Code className="h-4 w-4 mr-2" />
                    HTML
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="preview" className="h-full">
                  <div className={`p-8 rounded-lg ${config.theme === 'dark' ? 'bg-slate-900' : 'bg-white border'} flex items-center justify-center`}>
                    <div dangerouslySetInnerHTML={{ __html: scriptTag.replace('wallet.amar.im', window.location.host) }} />
                  </div>
                  
                  <div className="mt-8">
                    <Separator className="my-4" />
                    <h3 className="text-lg font-medium mb-2">Live Demo</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      See this widget in a real-world implementation:
                    </p>
                    
                    <a href={demoUrl} target="_blank" rel="noopener noreferrer">
                      <Button className="gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Open Demo Site
                      </Button>
                    </a>
                  </div>
                </TabsContent>
                <TabsContent value="code" className="h-full">
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto h-[300px]">
                    <code>{`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PaySage Widget Example</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .widget-container {
      margin: 40px 0;
    }
  </style>
</head>
<body>
  <h1>PaySage Wallet Integration Example</h1>
  
  <div class="widget-container">
    <!-- PaySage Widget -->
    ${scriptTag}
  </div>
  
  <p>
    This widget communicates securely with PaySage servers
    using cookies for authentication.
  </p>
</body>
</html>`}</code>
                  </pre>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Integration Guidelines</CardTitle>
            <CardDescription>
              Best practices for embedding PaySage Wallet widgets in your website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  Widgets use first-party cookies for authentication. Users need to be logged in to 
                  PaySage Wallet to view their data. A login prompt will appear if they're not authenticated.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Customization</h3>
                <p className="text-sm text-muted-foreground">
                  Customize widgets using the data attributes. You can change the theme, dimensions, 
                  and title to match your website's design.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Security</h3>
                <p className="text-sm text-muted-foreground">
                  All widget communication is secured with HTTPS. Sensitive financial data is never 
                  exposed to the host page. Widgets can only be embedded on approved domains.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}