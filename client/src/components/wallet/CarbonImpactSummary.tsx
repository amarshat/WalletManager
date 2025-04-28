import { useCarbon } from "@/hooks/use-carbon";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Leaf, 
  ArrowUpRight, 
  ArrowDownRight, 
  Droplets, 
  ShoppingBag, 
  Utensils, 
  Home, 
  Car, 
  Plane, 
  Lightbulb,
  Settings
} from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Helper function to get an icon for a category
const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'shopping':
      return <ShoppingBag className="h-4 w-4" />;
    case 'food':
      return <Utensils className="h-4 w-4" />;
    case 'housing':
      return <Home className="h-4 w-4" />;
    case 'transportation':
      return <Car className="h-4 w-4" />;
    case 'travel':
      return <Plane className="h-4 w-4" />;
    case 'utilities':
      return <Lightbulb className="h-4 w-4" />;
    case 'water':
      return <Droplets className="h-4 w-4" />;
    default:
      return <Leaf className="h-4 w-4" />;
  }
};

// Format a number as kg of CO2
const formatCO2 = (amount: number) => {
  if (amount < 1) {
    return `${(amount * 1000).toFixed(0)}g CO₂`;
  }
  return `${amount.toFixed(2)}kg CO₂`;
};

export function CarbonImpactSummary() {
  const { 
    summary, 
    impacts, 
    categories, 
    preferences,
    isLoading, 
    updatePreferencesMutation 
  } = useCarbon();
  
  const [tabValue, setTabValue] = useState("summary");

  const handleToggleTracking = () => {
    if (preferences) {
      updatePreferencesMutation.mutate({
        trackingEnabled: !preferences.trackingEnabled
      });
    }
  };

  const handleToggleOffset = () => {
    if (preferences) {
      updatePreferencesMutation.mutate({
        offsetEnabled: !preferences.offsetEnabled
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[180px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // If carbon tracking is not enabled, show simplified card
  if (!preferences?.trackingEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-500" />
            Carbon Footprint Tracking
          </CardTitle>
          <CardDescription>
            Monitor and reduce your carbon footprint from financial transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-center">
            <p className="text-sm">Carbon impact tracking is currently disabled</p>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="carbon-tracking"
              checked={preferences?.trackingEnabled || false}
              onCheckedChange={handleToggleTracking}
            />
            <Label htmlFor="carbon-tracking">Enable carbon impact tracking</Label>
          </div>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          Your financial activities have environmental impacts. Track them to make better choices.
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-green-500" />
          Carbon Footprint
        </CardTitle>
        <CardDescription>
          Your environmental impact from financial activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={tabValue} onValueChange={setTabValue}>
          <TabsList className="w-full">
            <TabsTrigger value="summary" className="flex-1">Summary</TabsTrigger>
            <TabsTrigger value="impacts" className="flex-1">Transactions</TabsTrigger>
            <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="space-y-4 pt-4">
            {summary && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-muted p-4">
                    <div className="text-sm text-muted-foreground mb-1">Total Impact</div>
                    <div className="text-xl font-semibold flex items-center gap-1">
                      <ArrowUpRight className="text-red-500 h-4 w-4" />
                      {formatCO2(summary.totalImpact)}
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <div className="text-sm text-muted-foreground mb-1">Total Offset</div>
                    <div className="text-xl font-semibold flex items-center gap-1">
                      <ArrowDownRight className="text-green-500 h-4 w-4" />
                      {formatCO2(summary.totalOffset)}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">Net Carbon Impact</div>
                    <div className={`text-sm font-medium ${summary.netImpact > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {formatCO2(summary.netImpact)}
                    </div>
                  </div>
                  <Progress value={summary.totalOffset / (summary.totalImpact || 1) * 100} className="h-2" />
                  <div className="text-xs text-muted-foreground text-right">
                    {Math.round(summary.totalOffset / (summary.totalImpact || 1) * 100)}% offset
                  </div>
                </div>
                
                {summary.impactByCategory && Object.keys(summary.impactByCategory).length > 0 && (
                  <div className="space-y-2 mt-4">
                    <div className="text-sm font-medium">Impact by Category</div>
                    <div className="space-y-2">
                      {Object.entries(summary.impactByCategory)
                        .sort(([, a], [, b]) => b - a)
                        .map(([category, amount]) => (
                          <div key={category} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(category)}
                              <span className="text-sm">{category}</span>
                            </div>
                            <Badge variant="outline">{formatCO2(amount)}</Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                
                <div className="text-sm text-muted-foreground text-center mt-4">
                  Monthly average: {formatCO2(summary.monthlyAverage)}
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="impacts" className="pt-4">
            <div className="space-y-4">
              <div className="text-sm font-medium">Recent Transactions</div>
              {impacts && impacts.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {impacts.map((impact) => (
                    <div key={impact.id} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(impact.category)}
                        <div>
                          <div className="text-sm font-medium">{impact.description}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(impact.transactionDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">{formatCO2(Number(impact.carbonFootprint))}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No carbon impact data recorded yet
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="tracking-toggle" className="font-medium">Carbon Tracking</Label>
                <p className="text-xs text-muted-foreground">
                  Track the carbon footprint of your transactions
                </p>
              </div>
              <Switch
                id="tracking-toggle"
                checked={preferences?.trackingEnabled || false}
                onCheckedChange={handleToggleTracking}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="offset-toggle" className="font-medium">Automatic Offsets</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically contribute to carbon offset programs
                </p>
              </div>
              <Switch
                id="offset-toggle"
                checked={preferences?.offsetEnabled || false}
                onCheckedChange={handleToggleOffset}
              />
            </div>
            
            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="font-medium mb-2">How it works</p>
              <p className="text-xs text-muted-foreground">
                The carbon footprint of your transactions is calculated based on the category and amount.
                Enable automatic offsets to contribute to verified carbon offset programs to reduce your 
                environmental impact.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}