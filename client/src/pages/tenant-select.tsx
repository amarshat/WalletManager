import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function TenantSelectPage() {
  const [, setLocation] = useLocation();
  const [tenantId, setTenantId] = useState<string>("");
  const { toast } = useToast();

  // Handle tenant selection form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tenantId.trim()) {
      toast({
        title: "Please enter a tenant ID",
        variant: "destructive"
      });
      return;
    }
    
    // Store the tenant ID and redirect to auth page
    localStorage.setItem('selectedTenantId', tenantId);
    setLocation(`/auth?tenantId=${tenantId}`);
  };

  // Effect to check for previously selected tenant
  useEffect(() => {
    const storedTenantId = localStorage.getItem('selectedTenantId');
    if (storedTenantId) {
      setTenantId(storedTenantId);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-md">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-center text-2xl">PaySage Wallet</CardTitle>
            <p className="text-center text-muted-foreground">
              Enter your organization ID to continue
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tenantId">Organization ID</Label>
                  <Input
                    id="tenantId"
                    placeholder="Enter your organization ID"
                    value={tenantId}
                    onChange={(e) => setTenantId(e.target.value)}
                    required
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleSubmit}
            >
              Continue
            </Button>
          </CardFooter>
        </Card>
        
        <p className="text-sm text-center text-muted-foreground mt-8">
          Contact your administrator if you don't know your organization ID
        </p>
      </div>
    </div>
  );
}