import { AuthProvider } from "./hooks/use-auth";
import { BrandProvider } from "./hooks/use-brand";
import { BudgetProvider } from "./hooks/use-budget";
import { CarbonProvider } from "./hooks/use-carbon-provider";
import { Route, Switch, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { useConfigImport } from "./hooks/use-config-import";
import { useDynamicTheme } from "./hooks/use-dynamic-theme";

import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import ThemedWalletPage from "@/pages/themed-wallet-page";
import TenantSelectPage from "@/pages/tenant-select";
import { ProtectedRoute } from "./lib/protected-route";

// Admin Pages
import AdminDashboard from "@/pages/admin/dashboard";
import BrandSettings from "@/pages/admin/brand-settings";
import WalletConfig from "@/pages/admin/wallet-config";
import ThemeCustomizer from "@/pages/admin/theme-customizer";
import ManageCustomers from "@/pages/admin/manage-customers";
import SystemLogs from "@/pages/admin/system-logs";
import DevCenter from "@/pages/admin/dev-center";
import TroubleshootingDashboard from "@/pages/admin/troubleshooting";
import SuperAdminDashboard from "@/pages/admin/superadmin-dashboard";
import EmbeddedWalletPage from "@/pages/embedded-wallet-page";
import CustomerEmbeddedWallet from "@/pages/customer/embedded-wallet-page";
import EmbeddedWidgets from "@/pages/embedded-widgets";

// Customer Pages
import CustomerDashboard from "@/pages/customer/dashboard";
import Transactions from "@/pages/customer/transactions";
import Cards from "@/pages/customer/cards";
import Profile from "@/pages/customer/profile";
import PaymentMethodsPage from "@/pages/customer/payment-methods-page";
import BudgetPage from "@/pages/customer/budget";
import CarbonImpactPage from "@/pages/customer/carbon-impact";
import EmbeddedExperience from "@/pages/customer/embedded-experience";
import CustomerEmbeddedWidgets from "@/pages/customer/embedded-widgets";

import SplashScreen from "@/components/ui/splash-screen";
import React, { useState, useEffect, Suspense } from "react";

// Component to handle redirect from root to tenant selection
function RedirectToTenantSelect() {
  const [, navigate] = useLocation();
  
  useEffect(() => {
    navigate('/select-tenant');
  }, [navigate]);
  
  return <div className="min-h-screen flex items-center justify-center">Redirecting...</div>;
}

// This component wraps the application to handle config import
function ConfigImportWrapper({ children }: { children: React.ReactNode }) {
  // Using the hook will automatically check for config parameters in URL
  const { ConfigConfirmDialog } = useConfigImport();
  
  return (
    <>
      {children}
      <ConfigConfirmDialog />
    </>
  );
}

function Router() {
  return (
    <Switch>
      {/* Root route - redirect to tenant selection */}
      <Route path="/">
        {() => {
          // Check if tenant is already selected
          const selectedTenant = localStorage.getItem('selectedTenantId');
          if (selectedTenant) {
            // If user is already logged in, go to dashboard, otherwise auth
            const storedUser = localStorage.getItem('lastLoggedInUser');
            window.location.href = storedUser ? '/dashboard' : '/auth';
          } else {
            window.location.href = '/tenant-select';
          }
          return <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              <p className="text-lg text-muted-foreground">Redirecting to your organization</p>
            </div>
          </div>;
        }}
      </Route>
    
      {/* Tenant Selection - Entry point for multi-tenant app */}
      <Route path="/tenant-select" component={TenantSelectPage} />
      <Route path="/select-tenant" component={TenantSelectPage} />
      
      {/* Auth */}
      <Route path="/auth" component={AuthPage} />
      
      {/* Themed Wallet - No authentication required */}
      <Route path="/themed-wallet" component={ThemedWalletPage} />
      
      {/* SuperAdmin Route */}
      <ProtectedRoute 
        path="/superadmin" 
        component={SuperAdminDashboard} 
        requireSuperAdmin={true} 
        redirectTo="/auth" 
      />
      
      {/* Admin Routes */}
      <ProtectedRoute 
        path="/admin" 
        component={AdminDashboard} 
        requireAdmin={true} 
        redirectTo="/auth" 
      />
      <ProtectedRoute 
        path="/admin/dashboard" 
        component={AdminDashboard} 
        requireAdmin={true} 
        redirectTo="/auth" 
      />
      <ProtectedRoute 
        path="/admin/brand-settings" 
        component={BrandSettings} 
        requireAdmin={true} 
        redirectTo="/auth" 
      />
      <ProtectedRoute 
        path="/admin/wallet-config" 
        component={WalletConfig} 
        requireAdmin={true} 
        redirectTo="/auth" 
      />
      <ProtectedRoute 
        path="/admin/theme-customizer" 
        component={ThemeCustomizer} 
        requireAdmin={true} 
        redirectTo="/auth" 
      />
      <ProtectedRoute 
        path="/admin/manage-customers" 
        component={ManageCustomers} 
        requireAdmin={true} 
        redirectTo="/auth" 
      />
      <ProtectedRoute 
        path="/admin/system-logs" 
        component={SystemLogs} 
        requireAdmin={true} 
        redirectTo="/auth" 
      />
      <ProtectedRoute 
        path="/admin/dev-center" 
        component={DevCenter} 
        requireAdmin={true} 
        redirectTo="/auth" 
      />
      <ProtectedRoute 
        path="/admin/troubleshooting" 
        component={TroubleshootingDashboard} 
        requireAdmin={true} 
        redirectTo="/auth" 
      />
      <ProtectedRoute 
        path="/admin/embedded-wallet" 
        component={EmbeddedWalletPage} 
        requireAdmin={true} 
        redirectTo="/auth" 
      />
      <ProtectedRoute 
        path="/admin/embedded-widgets" 
        component={EmbeddedWidgets} 
        requireAdmin={true} 
        redirectTo="/auth" 
      />
      
      {/* Customer Routes */}
      <ProtectedRoute 
        path="/" 
        component={CustomerDashboard} 
        redirectTo="/auth" 
      />
      <ProtectedRoute 
        path="/dashboard" 
        component={CustomerDashboard} 
        redirectTo="/auth" 
      />
      <ProtectedRoute 
        path="/transactions" 
        component={Transactions} 
        redirectTo="/auth" 
      />
      <ProtectedRoute 
        path="/cards" 
        component={Cards} 
        redirectTo="/auth" 
      />
      <ProtectedRoute 
        path="/profile" 
        component={Profile} 
        redirectTo="/auth" 
      />
      <ProtectedRoute 
        path="/payment-methods" 
        component={PaymentMethodsPage} 
        redirectTo="/auth" 
      />
      <ProtectedRoute 
        path="/budget" 
        component={BudgetPage} 
        redirectTo="/auth" 
      />
      <ProtectedRoute 
        path="/carbon-impact" 
        component={CarbonImpactPage} 
        redirectTo="/auth" 
      />
      <ProtectedRoute 
        path="/embedded-experience" 
        component={EmbeddedExperience}
        redirectTo="/auth" 
      />
      <ProtectedRoute 
        path="/embedded-wallet" 
        component={CustomerEmbeddedWallet}
        redirectTo="/auth" 
      />
      <ProtectedRoute 
        path="/embedded-widgets" 
        component={CustomerEmbeddedWidgets}
        redirectTo="/auth" 
      />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [loading, setLoading] = useState(true);
  // Initialize dynamic theming
  const { activeTheme, isCustomTheme } = useDynamicTheme();

  useEffect(() => {
    // Simulate initial load time for splash screen
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Apply custom theme to splash screen if available
  const splashScreenStyle = isCustomTheme && activeTheme ? {
    backgroundColor: activeTheme.colors.background,
    color: activeTheme.colors.text
  } : undefined;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <TooltipProvider>
          <AuthProvider>
            <BrandProvider>
              <ConfigImportWrapper>
                <BudgetProvider>
                  <CarbonProvider>
                    <Toaster />
                    {loading ? (
                      <SplashScreen style={splashScreenStyle} brandName={activeTheme?.brand.name} />
                    ) : (
                      <Router />
                    )}
                  </CarbonProvider>
                </BudgetProvider>
              </ConfigImportWrapper>
            </BrandProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
