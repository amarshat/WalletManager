import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface InitializeWalletCardProps {
  onSuccess: () => void;
}

export default function InitializeWalletCard({ onSuccess }: InitializeWalletCardProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleInitialize = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/wallet/initialize");
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Wallet Initialized",
          description: "Your wallet has been created successfully.",
        });
        onSuccess();
      } else {
        throw new Error(data.error || "Failed to initialize wallet");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to initialize wallet",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="text-center text-xl md:text-2xl">Wallet Not Found</CardTitle>
        <CardDescription className="text-center">
          It looks like your wallet hasn't been set up yet. Initialize your wallet to start using PaySage.
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="flex items-center justify-center">
          <Button 
            onClick={handleInitialize} 
            disabled={isLoading}
            className="w-full md:w-auto"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initializing...
              </>
            ) : (
              "Initialize My Wallet"
            )}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="text-center text-sm text-muted-foreground">
        This will create a new digital wallet linked to your account.
      </CardFooter>
    </Card>
  );
}