import { AuthProvider } from "./hooks/use-auth";
import { BrandProvider } from "./hooks/use-brand";
import { BudgetProvider } from "./hooks/use-budget";
import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { useConfigImport } from "./hooks/use-config-import";

import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";

// Admin Pages
import AdminDashboard from "@/pages/admin/dashboard";
import BrandSettings from "@/pages/admin/brand-settings";
import WalletConfig from "@/pages/admin/wallet-config";
import ManageCustomers from "@/pages/admin/manage-customers";
import SystemLogs from "@/pages/admin/system-logs";
import DevCenter from "@/pages/admin/dev-center";
import TroubleshootingDashboard from "@/pages/admin/troubleshooting";
import EmbeddedWalletPage from "@/pages/embedded-wallet-page";

// Customer Pages
import CustomerDashboard from "@/pages/customer/dashboard";
import Transactions from "@/pages/customer/transactions";
import Cards from "@/pages/customer/cards";
import Profile from "@/pages/customer/profile";
import PaymentMethodsPage from "@/pages/customer/payment-methods-page";
import BudgetPage from "@/pages/customer/budget";

import SplashScreen from "@/components/ui/splash-screen";
import { useState, useEffect } from "react";

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
      {/* Auth */}
      <Route path="/auth" component={AuthPage} />
      
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
        path="/embedded-experience" 
        component={() => {
          const CustomerEmbeddedWallet = require('@/pages/customer/embedded-wallet-page').default;
          return <CustomerEmbeddedWallet />;
        }}
        redirectTo="/auth" 
      />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial load time for splash screen
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <TooltipProvider>
          <AuthProvider>
            <BrandProvider>
              <ConfigImportWrapper>
                <BudgetProvider>
                  <Toaster />
                  {loading ? <SplashScreen /> : <Router />}
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
