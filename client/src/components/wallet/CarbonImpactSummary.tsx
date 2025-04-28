import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Leaf, TrendingUp, TrendingDown, Settings } from "lucide-react";
import { useCarbonContext } from "@/hooks/use-carbon-provider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatAmount } from "@/lib/utils";

export function CarbonImpactSummary() {
  const { 
    carbonSummary,
    carbonPreferences,
    updateCarbonPreferences,
    isLoadingSummary,
    isLoadingPreferences,
    carbonCategories,
  } = useCarbonContext();
  
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  
  if (isLoadingSummary || isLoadingPreferences) {
    return (
      <div className="flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-muted-foreground">Loading carbon impact data...</p>
      </div>
    );
  }

  const netImpact = carbonSummary?.netImpact || 0;
  const totalImpact = carbonSummary?.totalImpact || 0;
  const totalOffset = carbonSummary?.totalOffset || 0;
  
  // Calculate offset percentage (capped at 100%)
  const offsetPercentage = totalImpact > 0 
    ? Math.min(Math.round((totalOffset / totalImpact) * 100), 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Main Summary */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Leaf className={`h-6 w-6 ${netImpact > 0 ? 'text-red-500' : 'text-green-500'}`} />
              <h3 className="text-lg font-medium">Net Carbon Impact</h3>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => setIsPreferencesOpen(true)}
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-3xl font-bold">
                  {formatAmount(Math.abs(netImpact))} 
                </span>
                <span className="text-sm ml-1">kg CO₂</span>
              </div>
              <Badge variant={netImpact > 0 ? "destructive" : "outline"} className="mb-1">
                {netImpact > 0 ? 'Net Emitter' : netImpact < 0 ? 'Net Reducer' : 'Neutral'}
              </Badge>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Offset Progress</span>
                <span className="font-medium">{offsetPercentage}%</span>
              </div>
              <Progress value={offsetPercentage} className="h-2" />
            </div>
          </div>
        </div>
        
        <Separator orientation="vertical" className="hidden md:block" />
        
        <div className="flex-1 grid grid-cols-2 gap-4">
          <Card className="bg-muted/30 border-none">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-red-500" />
                <span className="text-sm font-medium">Impact</span>
              </div>
              <div>
                <span className="text-2xl font-bold">{formatAmount(totalImpact)}</span>
                <span className="text-xs ml-1">kg CO₂</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-muted/30 border-none">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Offset</span>
              </div>
              <div>
                <span className="text-2xl font-bold">{formatAmount(totalOffset)}</span>
                <span className="text-xs ml-1">kg CO₂</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Carbon Settings Dialog */}
      <Dialog open={isPreferencesOpen} onOpenChange={setIsPreferencesOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Carbon Impact Preferences</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="tracking">Carbon Impact Tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Track the carbon footprint of your transactions
                  </p>
                </div>
                <Switch 
                  id="tracking" 
                  checked={carbonPreferences?.trackingEnabled || false}
                  onCheckedChange={(checked) => {
                    updateCarbonPreferences({
                      trackingEnabled: checked
                    });
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="offset">Automatic Offsetting</Label>
                  <p className="text-sm text-muted-foreground">
                    Contribute to carbon offset projects automatically
                  </p>
                </div>
                <Switch 
                  id="offset" 
                  disabled={!carbonPreferences?.trackingEnabled}
                  checked={carbonPreferences?.offsetEnabled || false}
                  onCheckedChange={(checked) => {
                    updateCarbonPreferences({
                      offsetEnabled: checked
                    });
                  }}
                />
              </div>
              
              {carbonPreferences?.offsetEnabled && (
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="percentage">Offset Percentage</Label>
                    <p className="text-sm text-muted-foreground">
                      Percentage of impact to offset automatically
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{carbonPreferences?.offsetPercentage || 100}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}