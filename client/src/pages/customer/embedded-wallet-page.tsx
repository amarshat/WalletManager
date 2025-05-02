import React, { useState } from 'react';
import CustomerLayout from '@/components/layouts/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Gamepad2,
  Car,
  BookOpen,
  Wallet,
  LayoutDashboard,
  RefreshCw,
  CreditCard,
  ArrowRight,
  Copy,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

export default function EmbeddedWalletPage() {
  const [selectedTab, setSelectedTab] = useState<string>("wallet");
  const [copiedCode, setCopiedCode] = useState(false);
  const [frameHeight, setFrameHeight] = useState("680px");
  const [frameWidth, setFrameWidth] = useState("100%");
  const [embedRoute, setEmbedRoute] = useState("/dashboard");
  
  // Code to embed the wallet
  const embedCode = `<iframe 
  src="${window.location.origin}${embedRoute}?embedMode=true" 
  title="PaySage Wallet" 
  style="width: ${frameWidth}; height: ${frameHeight}; border: none; border-radius: 8px;" 
  allow="clipboard-write"
></iframe>`;

  // Copy to clipboard functionality
  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <CustomerLayout
      title="Full Wallet Embedding"
      description="Integrate the complete PaySage Wallet into your applications"
    >
      <div className="space-y-6">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-1" />
              <div>
                <h3 className="font-medium text-lg mb-1">About Full Wallet Embedding</h3>
                <p className="text-muted-foreground">
                  Unlike micro-widgets that provide specific functionality, full wallet embedding allows
                  you to integrate the complete PaySage Wallet into your application. This provides users
                  with seamless access to all their wallet features without leaving your platform.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid md:grid-cols-12 gap-6">
          <div className="md:col-span-5 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Wallet Embed Configuration</CardTitle>
                <CardDescription>
                  Customize how the wallet will appear in your application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Page to Embed</label>
                  <Select value={embedRoute} onValueChange={setEmbedRoute}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select page" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="/dashboard">Dashboard</SelectItem>
                      <SelectItem value="/transactions">Transactions</SelectItem>
                      <SelectItem value="/cards">Cards</SelectItem>
                      <SelectItem value="/budget">Budget</SelectItem>
                      <SelectItem value="/profile">Profile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Frame Height</label>
                  <Input 
                    type="text" 
                    value={frameHeight} 
                    onChange={(e) => setFrameHeight(e.target.value)}
                    placeholder="e.g. 600px" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Frame Width</label>
                  <Input 
                    type="text" 
                    value={frameWidth} 
                    onChange={(e) => setFrameWidth(e.target.value)}
                    placeholder="e.g. 100%" 
                  />
                </div>
                
                <div className="pt-4 border-t">
                  <label className="block text-sm font-medium mb-2">Embed Code</label>
                  <div className="relative">
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">{embedCode}</pre>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="absolute top-2 right-2"
                      onClick={copyToClipboard}
                    >
                      {copiedCode ? <span className="text-green-500">Copied!</span> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <Alert className="mt-6 bg-amber-50 border-amber-200">
                  <AlertDescription className="text-amber-800 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5" />
                    <span>
                      Using iframes requires shared authentication. Users must be logged in to both
                      your application and PaySage Wallet for this to work properly.
                    </span>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Implementation Tips</CardTitle>
                <CardDescription>
                  Best practices for embedding PaySage Wallet
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm">Authentication</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ensure users are authenticated with PaySage Wallet before embedding the iframe.
                    We recommend implementing a "Connect Wallet" flow.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm">Responsive Design</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Set width to 100% and use a minimum height of 600px for the best user experience
                    across different screen sizes.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm">Page Selection</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Embed the most relevant page for your application context. For example, use the 
                    Cards page for payment-related features.
                  </p>
                </div>
                
                <Button variant="outline" className="w-full mt-2" asChild>
                  <a href="https://docs.paysage.app/embedded-wallet" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Full Documentation
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-7">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  This is how the embedded wallet will appear in your application
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-hidden">
                <div className="relative bg-white rounded-md overflow-hidden" style={{ height: frameHeight }}>
                  <iframe 
                    src={`${embedRoute}?embedMode=true`}
                    title="PaySage Wallet Dashboard"
                    className="absolute top-0 left-0 w-full h-full border-0" 
                    style={{ width: frameWidth, height: '100%', borderRadius: '0 0 8px 8px' }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Industry-Specific Demos</CardTitle>
            <CardDescription>
              See how PaySage Wallet can be embedded in different industry applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid grid-cols-3 w-full mb-6">
                <TabsTrigger value="parking" className="flex items-center">
                  <Car className="w-4 h-4 mr-2" />
                  Parking App
                </TabsTrigger>
                <TabsTrigger value="religious" className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Religious App
                </TabsTrigger>
                <TabsTrigger value="gaming" className="flex items-center">
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  Gaming App
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="parking" className="border rounded-md p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-lg">SmartPark Application</h3>
                    <p className="text-muted-foreground">Parking management with embedded wallet for payments</p>
                  </div>
                  <Button asChild variant="outline">
                    <a href="/demo/parking" target="_blank">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Demo
                    </a>
                  </Button>
                </div>
                <div className="bg-muted aspect-video rounded-md flex items-center justify-center">
                  <iframe 
                    src="/demo/parking"
                    title="Parking Demo"
                    className="w-full h-full border-0 rounded-md" 
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="religious" className="border rounded-md p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-lg">Jehovah's Witnesses Platform</h3>
                    <p className="text-muted-foreground">Community platform with donation management</p>
                  </div>
                  <Button asChild variant="outline">
                    <a href="#" target="_blank">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Demo
                    </a>
                  </Button>
                </div>
                <div className="bg-muted aspect-video rounded-md flex items-center justify-center">
                  <div className="text-center p-6">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium">Demo Coming Soon</h3>
                    <p className="text-muted-foreground">This demo is currently under development</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="gaming" className="border rounded-md p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-lg">FusionForge Gaming</h3>
                    <p className="text-muted-foreground">Gaming platform with in-game purchases and rewards</p>
                  </div>
                  <Button asChild variant="outline">
                    <a href="/demo/gaming" target="_blank">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Demo
                    </a>
                  </Button>
                </div>
                <div className="bg-muted aspect-video rounded-md flex items-center justify-center">
                  <iframe 
                    src="/demo/gaming"
                    title="Gaming Demo"
                    className="w-full h-full border-0 rounded-md" 
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
}