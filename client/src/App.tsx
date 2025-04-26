import { AuthProvider } from "./hooks/use-auth";
import { BrandProvider } from "./hooks/use-brand";
import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";

import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";

// Admin Pages
import AdminDashboard from "@/pages/admin/dashboard";
import BrandSettings from "@/pages/admin/brand-settings";
import ManageCustomers from "@/pages/admin/manage-customers";
import SystemLogs from "@/pages/admin/system-logs";
import DevCenter from "@/pages/admin/dev-center";

// Customer Pages
import CustomerDashboard from "@/pages/customer/dashboard";
import Transactions from "@/pages/customer/transactions";
import Cards from "@/pages/customer/cards";
import Profile from "@/pages/customer/profile";

import SplashScreen from "@/components/ui/splash-screen";
import { useState, useEffect } from "react";

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
              <Toaster />
              {loading ? <SplashScreen /> : <Router />}
            </BrandProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
