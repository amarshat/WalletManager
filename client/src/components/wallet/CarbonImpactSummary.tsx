import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Leaf, 
  TrendingUp, 
  TrendingDown, 
  Settings, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle 
} from "lucide-react";
import { useCarbonContext } from "@/hooks/use-carbon-provider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { formatAmount } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function CarbonImpactSummary() {
  const { 
    carbonSummary,
    carbonPreferences,
    updateCarbonPreferences,
    isLoadingSummary,
    isLoadingPreferences,
  } = useCarbonContext();
  
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // Collapsed by default
  
  if (isLoadingSummary || isLoadingPreferences) {
    return (
      <div className="flex flex-col items-center justify-center p-4 space-y-2">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-muted-foreground">Loading carbon impact data...</p>
      </div>
    );
  }

  // Show a placeholder or simplified view if tracking is not enabled
  if (!carbonPreferences?.trackingEnabled) {
    return (
      <div className="flex items-center justify-between p-4 border border-dashed rounded-lg border-muted-foreground/50">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Carbon impact tracking is currently disabled</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            updateCarbonPreferences({
              trackingEnabled: true
            });
          }}
        >
          Enable
        </Button>
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
    <Collapsible
      open={isExpanded}
      onOpenChange={setIsExpanded}
      className="w-full rounded-md border border-border"
    >
      {/* Collapsed Summary View */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Leaf className={`h-5 w-5 ${netImpact > 0 ? 'text-red-500' : 'text-green-500'}`} />
          <div>
            <h3 className="text-sm font-medium">Carbon Impact</h3>
            <p className="text-xs text-muted-foreground">
              {netImpact > 0 ? 'Net Emitter' : netImpact < 0 ? 'Net Reducer' : 'Carbon Neutral'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-sm font-medium">{formatAmount(Math.abs(netImpact))} kg CO₂</span>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">{offsetPercentage}% offset</span>
              <Progress value={offsetPercentage} className="h-1 w-16" />
            </div>
          </div>
          
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle carbon impact details</span>
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>
      
      {/* Expanded Details View */}
      <CollapsibleContent>
        <Separator />
        <div className="p-4 space-y-4">
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
        </div>
      </CollapsibleContent>
      
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
    </Collapsible>
  );
}