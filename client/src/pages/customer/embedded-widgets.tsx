import { useState, useEffect } from "react";
import CustomerLayout from "@/components/layouts/CustomerLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Gamepad2, Car, CreditCard, Wallet, History, BadgeDollarSign, User, BarChart3, Banknote, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Define the widget options
const widgetOptions = [
  { 
    id: "balance", 
    name: "Balance Widget", 
    description: "Shows your current wallet balance",
    icon: <Wallet className="h-5 w-5" />,
    categories: ["essential", "account"],
    demoSites: ["gaming", "parking"]
  },
  { 
    id: "prepaid-cards", 
    name: "Prepaid Cards", 
    description: "Displays your prepaid cards with balances",
    icon: <CreditCard className="h-5 w-5" />,
    categories: ["cards", "payments"],
    demoSites: ["gaming", "parking"]
  },
  { 
    id: "recent-transactions", 
    name: "Recent Transactions", 
    description: "Shows your most recent transactions",
    icon: <History className="h-5 w-5" />,
    categories: ["history", "account"],
    demoSites: ["gaming", "parking"]
  },
  { 
    id: "quick-deposit", 
    name: "Quick Deposit", 
    description: "Easy deposit functionality",
    icon: <BadgeDollarSign className="h-5 w-5" />,
    categories: ["payments", "essential"],
    demoSites: ["gaming"]
  },
  { 
    id: "transfer", 
    name: "Transfer Money", 
    description: "Transfer money between accounts",
    icon: <Banknote className="h-5 w-5" />,
    categories: ["payments"],
    demoSites: ["gaming", "parking"]
  },
  { 
    id: "profile", 
    name: "Profile Summary", 
    description: "Shows your profile information",
    icon: <User className="h-5 w-5" />,
    categories: ["account"],
    demoSites: ["parking"]
  },
  { 
    id: "spending-insights", 
    name: "Spending Insights", 
    description: "Simple chart of spending patterns",
    icon: <BarChart3 className="h-5 w-5" />,
    categories: ["analytics"],
    demoSites: ["parking"]
  }
];

// Define the demo sites
const demoSites = [
  {
    id: "gaming",
    name: "PixelRacer Gaming",
    description: "Racing game with in-game purchases",
    icon: <Gamepad2 className="h-6 w-6" />
  },
  {
    id: "parking",
    name: "SmartPark",
    description: "Parking payment system",
    icon: <Car className="h-6 w-6" />
  }
];

export default function EmbeddedWidgets() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("gaming");
  const [activeCategory, setActiveCategory] = useState("all");
  const [enabledWidgets, setEnabledWidgets] = useState<Record<string, string[]>>({
    gaming: ["balance", "prepaid-cards", "recent-transactions", "quick-deposit"],
    parking: ["balance", "prepaid-cards", "recent-transactions", "profile"]
  });
  const [widgetSettings, setWidgetSettings] = useState<Record<string, Record<string, any>>>({
    gaming: {
      balance: { showCurrency: true, currencyCode: "USD" },
      "prepaid-cards": { showAllCards: true },
      "recent-transactions": { limit: 5 }
    },
    parking: {
      balance: { showCurrency: true, currencyCode: "USD" },
      "prepaid-cards": { showAllCards: true },
      "recent-transactions": { limit: 3 }
    }
  });

  // Get the demo site from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const demoSite = params.get('demoSite');
    if (demoSite && demoSites.some(site => site.id === demoSite)) {
      setActiveTab(demoSite);
    }
  }, []);

  // Handle toggling widgets on and off
  const toggleWidget = (widgetId: string) => {
    setEnabledWidgets(prev => {
      const current = [...prev[activeTab]];
      const index = current.indexOf(widgetId);
      
      if (index === -1) {
        return { ...prev, [activeTab]: [...current, widgetId] };
      } else {
        current.splice(index, 1);
        return { ...prev, [activeTab]: current };
      }
    });
  };

  // Handle changing widget settings
  const updateWidgetSetting = (widgetId: string, setting: string, value: any) => {
    setWidgetSettings(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [widgetId]: {
          ...prev[activeTab][widgetId],
          [setting]: value
        }
      }
    }));
  };

  // Save widget configuration
  const saveWidgetConfig = async () => {
    try {
      // In a real app, we would save this to the server
      // For now, we'll simulate a successful save
      toast({
        title: "Widget configuration saved",
        description: `Saved configuration for ${demoSites.find(site => site.id === activeTab)?.name}`,
      });
      
      // Redirect to the embedded experience page
      setTimeout(() => setLocation("/customer/embedded-experience"), 1500);
    } catch (error) {
      toast({
        title: "Error saving configuration",
        description: "There was an error saving your widget configuration",
        variant: "destructive"
      });
    }
  };

  // Categories for filters
  const categories = [
    { id: "all", name: "All Widgets" },
    { id: "essential", name: "Essential" },
    { id: "account", name: "Account" },
    { id: "payments", name: "Payments" },
    { id: "cards", name: "Cards" },
    { id: "history", name: "History" },
    { id: "analytics", name: "Analytics" }
  ];

  // Filter widgets based on currently selected category and demo site
  const filteredWidgets = widgetOptions.filter(widget => 
    (activeCategory === "all" || widget.categories.includes(activeCategory)) &&
    widget.demoSites.includes(activeTab)
  );

  return (
    <CustomerLayout 
      title="Customize Embedded Widgets" 
      description="Customize which widgets appear in third-party applications"
    >
      <div className="mb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            {demoSites.map(site => (
              <TabsTrigger key={site.id} value={site.id} className="flex items-center gap-2">
                {site.icon}
                {site.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {demoSites.map(site => (
            <TabsContent key={site.id} value={site.id}>
              <Card>
                <CardHeader>
                  <CardTitle>Configure Widgets for {site.name}</CardTitle>
                  <CardDescription>
                    Select which widgets to display and customize their settings.
                    These widgets will appear when you use {site.name}.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <p className="text-sm font-medium mb-2">Filter widgets by category:</p>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(category => (
                        <Button 
                          key={category.id}
                          variant={activeCategory === category.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setActiveCategory(category.id)}
                        >
                          {category.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {filteredWidgets.map(widget => {
                      const isEnabled = enabledWidgets[activeTab].includes(widget.id);
                      return (
                        <Card key={widget.id} className={`border ${isEnabled ? 'border-primary/50' : 'border-border'}`}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-md ${isEnabled ? 'bg-primary/10' : 'bg-muted'}`}>
                                  {widget.icon}
                                </div>
                                <div>
                                  <h3 className="font-medium">{widget.name}</h3>
                                  <p className="text-sm text-muted-foreground">{widget.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Label htmlFor={`enable-${widget.id}`} className="text-sm">
                                  {isEnabled ? 'Enabled' : 'Disabled'}
                                </Label>
                                <Switch 
                                  id={`enable-${widget.id}`}
                                  checked={isEnabled}
                                  onCheckedChange={() => toggleWidget(widget.id)}
                                />
                              </div>
                            </div>

                            {isEnabled && (
                              <div className="mt-4 pt-4 border-t">
                                <h4 className="text-sm font-medium mb-3">Widget Settings</h4>
                                {widget.id === "balance" && (
                                  <div className="grid gap-3">
                                    <div className="flex items-center space-x-2">
                                      <Switch 
                                        id="show-currency"
                                        checked={widgetSettings[activeTab]?.balance?.showCurrency}
                                        onCheckedChange={(value) => updateWidgetSetting("balance", "showCurrency", value)}
                                      />
                                      <Label htmlFor="show-currency">Show currency code</Label>
                                    </div>
                                    <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
                                      <Label htmlFor="currency-code">Currency:</Label>
                                      <Input 
                                        id="currency-code"
                                        value={widgetSettings[activeTab]?.balance?.currencyCode || "USD"}
                                        onChange={(e) => updateWidgetSetting("balance", "currencyCode", e.target.value)}
                                        className="max-w-[100px]"
                                      />
                                    </div>
                                  </div>
                                )}

                                {widget.id === "prepaid-cards" && (
                                  <div className="flex items-center space-x-2">
                                    <Switch 
                                      id="show-all-cards"
                                      checked={widgetSettings[activeTab]?.["prepaid-cards"]?.showAllCards}
                                      onCheckedChange={(value) => updateWidgetSetting("prepaid-cards", "showAllCards", value)}
                                    />
                                    <Label htmlFor="show-all-cards">Show all cards</Label>
                                  </div>
                                )}

                                {widget.id === "recent-transactions" && (
                                  <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
                                    <Label htmlFor="tx-limit">Show limit:</Label>
                                    <Input 
                                      id="tx-limit"
                                      type="number"
                                      min={1}
                                      max={10}
                                      value={widgetSettings[activeTab]?.["recent-transactions"]?.limit || 5}
                                      onChange={(e) => updateWidgetSetting("recent-transactions", "limit", parseInt(e.target.value))}
                                      className="max-w-[80px]"
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex justify-end">
          <Button onClick={saveWidgetConfig} className="gap-2">
            <Save className="h-4 w-4" />
            Save Configuration
          </Button>
        </div>
      </div>

      <div className="border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">About Widget Customization</h2>
        <p className="text-muted-foreground mb-4">
          Customize which wallet widgets appear in third-party applications that integrate with
          PaySage Wallet. This allows you to control what financial information is displayed
          and which features are available when using integrated applications.
        </p>
        <p className="text-muted-foreground">
          Changes made here will be applied the next time you visit the integrated application.
          Different applications can have different widget configurations based on your preferences.
        </p>
      </div>
    </CustomerLayout>
  );
}