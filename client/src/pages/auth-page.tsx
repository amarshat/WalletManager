import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useBrand } from "@/hooks/use-brand";
import BrandLogo from "@/components/ui/brand-logo";
import defaultLogo from "@/assets/default-logo.svg";
import { insertUserSchema } from "@shared/schema";
import { supportedCurrencies } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Login schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Registration schema extends the insertUserSchema
const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"customer" | "admin">("customer");
  const [location, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const { brand: branding } = useBrand();
  const [tenantId, setTenantId] = useState<string | null>(null);
  
  // Parse tenantId from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tenantParam = params.get('tenantId');
    if (tenantParam) {
      // Save tenant ID to localStorage for future use and API calls
      localStorage.setItem('selectedTenantId', tenantParam);
      setTenantId(tenantParam);
    } else {
      // Check if tenantId is in localStorage
      const storedTenantId = localStorage.getItem('selectedTenantId');
      if (storedTenantId) {
        setTenantId(storedTenantId);
      }
    }
  }, []);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate(user.isAdmin ? "/admin" : "/");
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      email: "",
      country: "",
      defaultCurrency: "USD",
    },
  });

  // Handle login submission
  function onLoginSubmit(data: LoginFormValues) {
    // Store tenant ID in localStorage if it exists
    if (tenantId) {
      localStorage.setItem('selectedTenantId', tenantId);
    }
    // Proceed with login
    loginMutation.mutate(data);
  }

  // Handle registration submission
  function onRegisterSubmit(data: RegisterFormValues) {
    // Remove confirmPassword as it's not part of the API schema
    const { confirmPassword, ...registrationData } = data;
    
    // Pass tenant ID if available
    if (tenantId) {
      registerMutation.mutate(
        registrationData,
        {
          onSuccess: () => {
            // After registration is successful, store the tenant ID
            localStorage.setItem('selectedTenantId', tenantId);
          }
        }
      );
    } else {
      registerMutation.mutate(registrationData);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-0 bg-neutral-100">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-6 bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Form Side */}
        <div className="p-6 md:p-10">
          <div className="flex items-center justify-center mb-6">
            {/* Using the existing BrandLogo component */}
            <div className="flex items-center gap-3">
              {/* Main Logo */}
              <BrandLogo className="h-10" />
              
              {/* Show global branding if available */}
              {branding?.globalBrandLogo && (
                <>
                  {/* Divider */}
                  <div className="h-8 w-px bg-gray-300"></div>
                  
                  {/* Global Brand Logo */}
                  <img 
                    src={branding.globalBrandLogo} 
                    alt={branding.globalBrandName || "Global Brand"} 
                    className="h-8 object-contain"
                  />
                </>
              )}
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{branding?.name || "PaySage Wallet"}</h1>
            <p className="text-neutral-600 mt-1">{branding?.tagline || "Your Digital Wallet Solution"}</p>
          </div>

          <Tabs defaultValue="customer" value={activeTab} onValueChange={(v) => setActiveTab(v as "customer" | "admin")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="customer">Customer</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>

            {/* Customer Tab Content */}
            <TabsContent value="customer">
              <div className="mb-6 text-center">
                <h2 className="text-lg font-medium">Customer Login</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Only existing customers can login. Please contact an administrator to create a new account.
                </p>
              </div>
              
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            {/* Admin Tab Content */}
            <TabsContent value="admin">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admin Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter admin username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter admin password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Logging in..." : "Admin Login"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>

        {/* Hero Side */}
        <div 
          className="text-white p-10 flex flex-col justify-center hidden md:block"
          style={{ 
            background: branding?.primaryColor && branding?.secondaryColor 
              ? `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)`
              : "linear-gradient(135deg, #4F46E5 0%, #7E57C2 100%)"
          }}
        >
          <h2 className="text-3xl font-bold mb-4">{branding?.name || "PaySage Wallet Platform"}</h2>
          <p className="text-lg mb-6">{branding?.tagline || "Manage your finances securely with our digital wallet solution."}</p>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-white bg-opacity-20 p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Seamless Transactions</h3>
                <p className="text-sm text-white text-opacity-80">Send and receive money instantly with low fees</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white bg-opacity-20 p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Multi-Currency Support</h3>
                <p className="text-sm text-white text-opacity-80">Manage multiple currencies in one secure wallet</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-white bg-opacity-20 p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Secure & Reliable</h3>
                <p className="text-sm text-white text-opacity-80">Bank-level security protecting your financial data</p>
              </div>
            </div>
          </div>
          
          <div className="mt-auto pt-10">
            <p className="text-sm text-white text-opacity-70">
              {branding?.name || "Digital Wallet"} — <span className="font-semibold" style={{ color: branding?.globalBrandColor || '#7C3AED' }}>Powered by {branding?.globalBrandName || 'PaySage AI'}</span>
            </p>
            {tenantId && (
              <button 
                onClick={() => {
                  localStorage.removeItem('selectedTenantId');
                  window.location.href = '/tenant-select';
                }}
                className="text-xs text-white text-opacity-50 hover:text-opacity-100 mt-2 underline"
              >
                Reset tenant selection
              </button>
            )}
          </div>
        </div>
      </div>
      
      <p className="text-sm text-neutral-500 mt-8">
        Paysafe GenAI Showcase — powered by {branding?.globalBrandName || 'PaySage AI'}
      </p>
    </div>
  );
}
