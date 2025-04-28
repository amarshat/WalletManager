import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Leaf, Droplets, ArrowDownRight } from "lucide-react";
import { useCarbon } from "@/hooks/use-carbon";

interface CarbonImpactModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionAmount: number;
  transactionCategory: string;
  transactionDescription: string;
  onComplete: () => void;
}

export function CarbonImpactModal({
  isOpen,
  onClose,
  transactionAmount,
  transactionCategory,
  transactionDescription,
  onComplete,
}: CarbonImpactModalProps) {
  const { 
    categories, 
    preferences, 
    recordImpactMutation, 
    recordOffsetMutation, 
    calculateFootprint 
  } = useCarbon();
  
  const [carbonFootprint, setCarbonFootprint] = useState(0);
  const [offsetAmount, setOffsetAmount] = useState(0);
  const [offsetPercentage, setOffsetPercentage] = useState(0);
  const [contributeToOffset, setContributeToOffset] = useState(false);
  
  useEffect(() => {
    // Calculate carbon footprint when dependencies change
    if (categories) {
      const footprint = calculateFootprint(transactionAmount, transactionCategory);
      setCarbonFootprint(footprint);
      
      // Initialize offset percentage from preferences
      if (preferences) {
        setOffsetPercentage(preferences.offsetPercentage || 0);
        setContributeToOffset(preferences.offsetEnabled || false);
      }
    }
  }, [categories, transactionAmount, transactionCategory, preferences, calculateFootprint]);
  
  // Update offset amount when percentage changes
  useEffect(() => {
    setOffsetAmount((carbonFootprint * offsetPercentage) / 100);
  }, [carbonFootprint, offsetPercentage]);
  
  const handleSliderChange = (value: number[]) => {
    setOffsetPercentage(value[0]);
  };
  
  const handleConfirm = async () => {
    // Record carbon impact
    await recordImpactMutation.mutateAsync({
      category: transactionCategory,
      description: transactionDescription,
      amount: transactionAmount,
      carbonFootprint,
      transactionDate: new Date()
    });
    
    // Record carbon offset if user chooses to contribute
    if (contributeToOffset && offsetAmount > 0) {
      await recordOffsetMutation.mutateAsync({
        offsetAmount,
        description: `Offset for ${transactionDescription}`,
        contributionDate: new Date()
      });
    }
    
    onComplete();
    onClose();
  };
  
  // Format CO2 amount
  const formatCO2 = (amount: number) => {
    if (amount < 1) {
      return `${(amount * 1000).toFixed(0)}g CO₂`;
    }
    return `${amount.toFixed(2)}kg CO₂`;
  };
  
  // Calculate suggested offset cost (example: $0.10 per kg of CO2)
  const calculateOffsetCost = (co2Amount: number) => {
    const ratePerKg = 0.10; // $0.10 per kg of CO2
    return (co2Amount * ratePerKg).toFixed(2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-500" />
            Carbon Impact
          </DialogTitle>
          <DialogDescription>
            Your transaction has an environmental footprint
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Carbon Footprint Display */}
          <div className="rounded-lg bg-muted p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">Estimated Carbon Footprint</p>
            <p className="text-2xl font-bold flex items-center justify-center gap-2">
              <Droplets className="h-5 w-5 text-blue-500" />
              {formatCO2(carbonFootprint)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              From your {transactionCategory.toLowerCase()} transaction of ${transactionAmount.toFixed(2)}
            </p>
          </div>
          
          {/* Offset Option */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="contribute" 
                checked={contributeToOffset}
                onCheckedChange={(checked) => 
                  setContributeToOffset(checked as boolean)
                }
              />
              <Label htmlFor="contribute" className="font-medium">
                Contribute to carbon offset
              </Label>
            </div>
            
            {contributeToOffset && (
              <div className="space-y-4 pl-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Offset percentage</span>
                    <span className="font-medium">{offsetPercentage}%</span>
                  </div>
                  <Slider
                    value={[offsetPercentage]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={handleSliderChange}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="offset-amount">CO₂ to offset</Label>
                    <div className="flex items-center text-sm font-medium">
                      <ArrowDownRight className="mr-1 h-4 w-4 text-green-500" />
                      {formatCO2(offsetAmount)}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="offset-cost">Contribution</Label>
                    <div className="flex items-center">
                      <span className="text-sm font-medium">
                        ${(offsetAmount * 0.10).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground bg-background p-2 rounded">
                  Your contribution helps fund verified carbon offset projects such as reforestation
                  and renewable energy initiatives.
                </div>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="flex space-x-2 sm:space-x-0">
          <Button variant="outline" onClick={onClose}>
            Skip
          </Button>
          <Button onClick={handleConfirm}>
            {contributeToOffset ? "Confirm & Offset" : "Track Impact"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}