import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Building2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface PublicTenant {
  id: number;
  tenantId: string;
  name: string;
  logo?: string;
}

export default function TenantSelectPage() {
  const [, setLocation] = useLocation();
  const [tenantId, setTenantId] = useState<string>("");
  const [customTenantId, setCustomTenantId] = useState<string>("");
  const [useCustomTenant, setUseCustomTenant] = useState<boolean>(false);
  const { toast } = useToast();

  // Fetch available tenants
  const { data: tenants, isLoading } = useQuery<PublicTenant[]>({
    queryKey: ['/api/tenants/public'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Handle tenant selection from dropdown
  const handleTenantSelect = (value: string) => {
    setTenantId(value);
    setUseCustomTenant(false);
  };

  // Handle switching to custom tenant ID input
  const handleUseCustomTenant = () => {
    setUseCustomTenant(true);
    setTenantId("");
  };

  // Handle tenant selection form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const effectiveTenantId = useCustomTenant ? customTenantId : tenantId;
    
    if (!effectiveTenantId.trim()) {
      toast({
        title: "Please enter a tenant ID",
        variant: "destructive"
      });
      return;
    }
    
    // Store the tenant ID and redirect to auth page
    localStorage.setItem('selectedTenantId', effectiveTenantId);
    setLocation(`/auth?tenantId=${effectiveTenantId}`);
  };

  // Effect to check for previously selected tenant
  useEffect(() => {
    const storedTenantId = localStorage.getItem('selectedTenantId');
    if (storedTenantId) {
      // Check if stored ID matches any of the loaded tenants
      if (tenants && tenants.some(t => t.tenantId === storedTenantId)) {
        setTenantId(storedTenantId);
        setUseCustomTenant(false);
      } else {
        setCustomTenantId(storedTenantId);
        setUseCustomTenant(true);
      }
    }
  }, [tenants]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              PaySage
            </h1>
          </div>
        </div>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Select Organization</CardTitle>
            <p className="text-center text-muted-foreground">
              Choose your organization to access your wallet
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : tenants && tenants.length > 0 ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tenantSelect">Select your organization</Label>
                    <Select value={tenantId} onValueChange={handleTenantSelect}>
                      <SelectTrigger id="tenantSelect" className="w-full">
                        <SelectValue placeholder="Select an organization" />
                      </SelectTrigger>
                      <SelectContent>
                        {tenants.map((tenant) => (
                          <SelectItem key={tenant.tenantId} value={tenant.tenantId}>
                            {tenant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-card px-2 text-xs text-muted-foreground">
                        OR
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={handleUseCustomTenant}
                  >
                    Enter a custom organization ID
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="customTenantId">Organization ID</Label>
                  <Input
                    id="customTenantId"
                    placeholder="Enter your organization ID"
                    value={customTenantId}
                    onChange={(e) => setCustomTenantId(e.target.value)}
                    required
                  />
                </div>
              )}
              
              {useCustomTenant && (
                <div className="space-y-2">
                  <Label htmlFor="customTenantId">Custom Organization ID</Label>
                  <Input
                    id="customTenantId"
                    placeholder="Enter your organization ID"
                    value={customTenantId}
                    onChange={(e) => setCustomTenantId(e.target.value)}
                    required
                  />
                </div>
              )}
            </form>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleSubmit}
              disabled={isLoading || (!tenantId && !customTenantId)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : "Continue"}
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