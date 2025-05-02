import CustomerLayout from "@/components/layouts/CustomerLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Gamepad2, Car, ShoppingBag, Globe } from "lucide-react";
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
    { id: "transportation", label: "Transportation" },
    { id: "shopping", label: "Shopping" }
  ];
  
  return (
    <CustomerLayout 
      title="Embedded Wallet Experiences" 
      description="Explore apps where your PaySage Wallet is embedded for seamless payments"
    >
      <Tabs defaultValue="all" className="mb-8">
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
      
      <div className="border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">About Embedded Wallet Experiences</h2>
        <p className="text-muted-foreground mb-4">
          PaySage Wallet can be seamlessly integrated into third-party applications, 
          allowing you to use your wallet without leaving those apps. This provides a 
          convenient and secure way to make payments and manage your finances across 
          different services.
        </p>
        <p className="text-muted-foreground">
          All embedded experiences maintain the same security standards as the main 
          PaySage Wallet application, ensuring your financial information remains 
          protected.
        </p>
      </div>
    </CustomerLayout>
  );
}