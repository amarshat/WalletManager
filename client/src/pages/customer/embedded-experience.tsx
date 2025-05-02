import CustomerLayout from "@/components/layouts/CustomerLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Gamepad2, Car, ShoppingBag, Globe, Layout, Component, LayoutGrid } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EmbeddedExperience() {
  const demoUrl = window.location.origin;
  
  // Demo applications that integrate with PaySage Wallet
  const integrations = [
    {
      id: "gaming",
      name: "PixelRacer Gaming",
      description: "Experience adrenaline-pumping racing games with integrated wallet for in-game purchases.",
      icon: <Gamepad2 className="h-12 w-12 text-primary" />,
      url: `${demoUrl}/demo/gaming`,
      features: ["Balance display", "In-game purchases", "Easy transfers", "Credits history"],
      category: "gaming"
    },
    {
      id: "parking",
      name: "SmartPark",
      description: "Manage parking payments and view your parking history with an integrated wallet.",
      icon: <Car className="h-12 w-12 text-primary" />,
      url: `${demoUrl}/demo/parking`,
      features: ["Parking payment", "Transaction history", "Carbon offsetting", "Profile management"],
      category: "transportation"
    }
  ];
  
  // Available external integration categories
  const categories = [
    { id: "all", label: "All Integrations" },
    { id: "gaming", label: "Gaming" },
    { id: "transportation", label: "Transportation" }
  ];
  
  return (
    <CustomerLayout 
      title="Partner App Integrations" 
      description="Explore different ways to integrate PaySage Wallet with partner applications"
    >
      <Tabs defaultValue="micro-widgets" className="mb-8">
        <TabsList className="mb-8">
          <TabsTrigger value="micro-widgets">
            <Component className="h-4 w-4 mr-2" />
            Micro Widgets
          </TabsTrigger>
          <TabsTrigger value="iframe">
            <Layout className="h-4 w-4 mr-2" />
            Full iFrame Embed
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="micro-widgets">
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-2">Micro-Widget Integration</h3>
              <p className="text-muted-foreground">
                Partners can integrate specific wallet functionality directly into their applications 
                using micro-widgets. These lightweight components provide focused functionality like 
                balance display, transfers, or payment methods.
              </p>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="all">
            <TabsList>
              {categories.map(category => (
                <TabsTrigger key={category.id} value={category.id}>{category.label}</TabsTrigger>
              ))}
            </TabsList>
            
            {categories.map(category => (
              <TabsContent key={category.id} value={category.id}>
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  {integrations
                    .filter(app => category.id === "all" || app.category === category.id)
                    .map(app => (
                      <Card key={app.id} className="overflow-hidden transition-all hover:shadow-md">
                        <CardHeader className="pb-4">
                          <div className="flex justify-between items-start">
                            <div className="p-3 bg-primary/10 rounded-lg">{app.icon}</div>
                            <Badge variant="outline" className="ml-2">
                              PaySage Integrated
                            </Badge>
                          </div>
                          <CardTitle className="mt-4">{app.name}</CardTitle>
                          <CardDescription>{app.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-2">
                            {app.features.map((feature, i) => (
                              <div key={i} className="flex items-center text-sm text-muted-foreground">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></div>
                                {feature}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t pt-4">
                          <Button 
                            variant="default" 
                            asChild
                          >
                            <a href={app.url} target="_blank" rel="noopener noreferrer">
                              <Globe className="mr-2 h-4 w-4" />
                              Open App
                            </a>
                          </Button>
                          <Button variant="outline" asChild>
                            <a href={`/embedded-widgets?demoSite=${app.id}`}>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Configure Widgets
                            </a>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
                
                {category.id !== "all" && 
                  integrations.filter(app => app.category === category.id).length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <ShoppingBag className="mx-auto h-12 w-12 mb-4 opacity-30" />
                    <h3 className="text-lg font-medium mb-1">No integrations available</h3>
                    <p>There are currently no {category.label.toLowerCase()} integrations available.</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>
        
        <TabsContent value="iframe">
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-2">Full iFrame Integration</h3>
              <p className="text-muted-foreground">
                Partners can embed the complete PaySage Wallet experience directly into their applications 
                using an iframe. This provides access to all wallet functionality without leaving the partner app.
              </p>
            </CardContent>
          </Card>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="pb-4">
                <div className="p-3 bg-indigo-100 text-indigo-700 rounded-lg">
                  <Gamepad2 className="h-8 w-8" />
                </div>
                <CardTitle className="mt-4">Gaming Integration</CardTitle>
                <CardDescription>Full wallet access within gaming platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Provide gamers with complete wallet functionality for managing in-game purchases, 
                  earnings, and transactions without switching applications.
                </p>
              </CardContent>
              <CardFooter className="flex justify-end border-t pt-4">
                <Button variant="default" asChild>
                  <a href="/embedded-wallet">
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    View Demos
                  </a>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="pb-4">
                <div className="p-3 bg-blue-100 text-blue-700 rounded-lg">
                  <Car className="h-8 w-8" />
                </div>
                <CardTitle className="mt-4">Transportation Apps</CardTitle>
                <CardDescription>Seamless payments for transport services</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Integrate full wallet functionality into transportation and parking applications, 
                  enabling seamless payments and transaction history.
                </p>
              </CardContent>
              <CardFooter className="flex justify-end border-t pt-4">
                <Button variant="default" asChild>
                  <a href="/embedded-wallet">
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    View Demos
                  </a>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="pb-4">
                <div className="p-3 bg-purple-100 text-purple-700 rounded-lg">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <CardTitle className="mt-4">E-Commerce Integration</CardTitle>
                <CardDescription>Complete wallet for online shopping</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Embed the full wallet experience into e-commerce platforms, allowing users to 
                  manage payments, view transaction history, and track spending.
                </p>
              </CardContent>
              <CardFooter className="flex justify-end border-t pt-4">
                <Button variant="default" asChild>
                  <a href="/embedded-wallet">
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    View Demos
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">About Partner App Integrations</h2>
        <p className="text-muted-foreground mb-4">
          PaySage Wallet offers flexible integration options for partner applications. 
          Choose between micro-widgets for targeted functionality or full iframe embedding 
          for complete wallet access within partner apps.
        </p>
        <p className="text-muted-foreground">
          All integration options maintain the same security standards as the main 
          PaySage Wallet application, ensuring financial information remains protected
          through shared authentication.
        </p>
      </div>
    </CustomerLayout>
  );
}