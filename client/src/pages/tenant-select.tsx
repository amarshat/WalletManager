import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

interface Tenant {
  id: number;
  tenantId: string;
  name: string;
  tagline?: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
}

export default function TenantSelectPage() {
  const [, setLocation] = useLocation();
  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);

  // Fetch available tenants
  const { data: tenants, isLoading, error } = useQuery<Tenant[]>({
    queryKey: ["/api/tenants"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Handle tenant selection
  const handleSelectTenant = (tenantId: number) => {
    setSelectedTenantId(tenantId);
    localStorage.setItem('selectedTenantId', tenantId.toString());
    
    // Redirect to auth page with tenant param
    setLocation(`/auth?tenantId=${tenantId}`);
  };

  // Effect to check for previously selected tenant
  useEffect(() => {
    const storedTenantId = localStorage.getItem('selectedTenantId');
    if (storedTenantId) {
      setSelectedTenantId(parseInt(storedTenantId));
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading tenants...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-destructive mb-2">Error Loading Tenants</h1>
        <p className="text-muted-foreground mb-4">
          We couldn't load the available organizations. Please try again later.
        </p>
        <Button onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!tenants || tenants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-2">No Organizations Available</h1>
        <p className="text-muted-foreground mb-4">
          There are no organizations available at this time. Please contact support.
        </p>
      </div>
    );
  }

  // If there's only one tenant, auto-select it
  if (tenants.length === 1 && !selectedTenantId) {
    handleSelectTenant(tenants[0].id);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Redirecting to login...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6">Select Your Organization</h1>
        <p className="text-center text-muted-foreground mb-8">
          Choose the organization you want to access
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tenants.map((tenant) => (
            <Card 
              key={tenant.id} 
              className={`overflow-hidden hover:shadow-md transition-all cursor-pointer ${
                selectedTenantId === tenant.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleSelectTenant(tenant.id)}
              style={{
                borderColor: selectedTenantId === tenant.id ? tenant.primaryColor : undefined
              }}
            >
              <div 
                className="h-2" 
                style={{ backgroundColor: tenant.primaryColor }}
              />
              <CardHeader>
                {tenant.logo && (
                  <div className="flex justify-center mb-4">
                    <img 
                      src={tenant.logo} 
                      alt={`${tenant.name} logo`} 
                      className="h-12 w-auto object-contain"
                    />
                  </div>
                )}
                <CardTitle>{tenant.name}</CardTitle>
                {tenant.tagline && (
                  <CardDescription>{tenant.tagline}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="h-16 flex items-center justify-center">
                  <p className="text-center text-sm">
                    Click to access the {tenant.name} wallet
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  className="w-full"
                  style={{
                    backgroundColor: tenant.primaryColor,
                    borderColor: tenant.primaryColor
                  }}
                >
                  Select
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}