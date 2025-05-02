import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  Menu, 
  LogOut, 
  Bell, 
  User, 
  CreditCard, 
  LayoutDashboard, 
  RefreshCw,
  PieChart,
  Layers,
  Wallet,
  Gamepad2,
  BookOpen,
  Car,
  Leaf
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useBrand } from "@/hooks/use-brand";
import { useAppBranding } from "@/hooks/use-app-branding";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import BrandLogo from "@/components/ui/brand-logo";

interface CustomerLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  onRefresh?: () => void;
  showRefreshButton?: boolean;
  hideSidebar?: boolean;
}

export default function CustomerLayout({ 
  children, 
  title, 
  description, 
  onRefresh,
  showRefreshButton = false,
  hideSidebar = false
}: CustomerLayoutProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { brand } = useBrand();
  const { branding, appType, isEmbedded } = useAppBranding();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEmbedMode, setIsEmbedMode] = useState(false);
  
  // No longer hiding sidebar in embed mode, just customizing it
  const [shouldHideSidebar, setShouldHideSidebar] = useState(hideSidebar);
  
  useEffect(() => {
    // Check URL parameters
    const params = new URLSearchParams(window.location.search);
    const hideSidebarParam = params.get('hideSidebar');
    const embedModeParam = params.get('embedMode');
    
    // If hideSidebar is true, hide the sidebar
    if (hideSidebarParam === 'true' || hideSidebarParam === '1') {
      setShouldHideSidebar(true);
    }
    
    // If embedMode is true, enable embedded mode (but don't hide sidebar)
    if (embedModeParam === 'true') {
      setIsEmbedMode(true);
    }
  }, []);
  
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: "Logged out successfully",
          description: "You have been logged out of your account",
        });
      }
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };
  
  const navItems = [
    { 
      href: "/dashboard", 
      label: "Dashboard", 
      icon: <LayoutDashboard className="w-5 h-5 mr-3" /> 
    },
    { 
      href: "/transactions", 
      label: "Transactions", 
      icon: <RefreshCw className="w-5 h-5 mr-3" /> 
    },
    { 
      href: "/budget", 
      label: "Budget", 
      icon: <PieChart className="w-5 h-5 mr-3" /> 
    },
    { 
      href: "/carbon-impact", 
      label: "Carbon Impact", 
      icon: <Leaf className="w-5 h-5 mr-3" /> 
    },
    { 
      href: "/payment-methods", 
      label: "Payment Methods", 
      icon: <CreditCard className="w-5 h-5 mr-3" /> 
    },
    {
      href: "/embedded-experience",
      label: "Partner Apps",
      icon: <Gamepad2 className="w-5 h-5 mr-3" />
    },
    { 
      href: "/profile", 
      label: "Profile", 
      icon: <User className="w-5 h-5 mr-3" /> 
    },
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - conditionally shown based on shouldHideSidebar */}
      {!shouldHideSidebar && (
        <header className="bg-white shadow">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center">
              <button
                className="mr-2 md:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="text-neutral-700" />
              </button>
              <BrandLogo className="h-8" />
            </div>
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5 text-neutral-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
              </Button>
              <div className="relative ml-2">
                <Avatar>
                  <AvatarFallback className="bg-primary text-white">
                    {user?.fullName ? getInitials(user.fullName) : "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </header>
      )}

      <div className="flex flex-1">
        {/* Sidebar - conditionally shown based on shouldHideSidebar */}
        {!shouldHideSidebar && (
          <aside
            className={`w-64 bg-gray-800 text-white fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out z-20 md:z-0 md:relative md:translate-x-0 ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="h-16 flex items-center justify-center border-b border-gray-700" 
                 style={{ 
                   background: appType ? branding.secondaryColor : undefined 
                 }}>
              <span className="font-semibold text-white">
                {appType ? branding.name : (brand?.name || "PaySage Wallet")}
              </span>
            </div>
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center">
                <Avatar className="w-10 h-10 mr-3">
                  <AvatarFallback className="bg-primary text-white">
                    {user?.fullName ? getInitials(user.fullName) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-white">{user?.fullName}</div>
                  <div className="text-xs text-gray-300">@{user?.username}</div>
                </div>
              </div>
            </div>
            <nav className="py-4 overflow-y-auto h-[calc(100%-9rem)]">
              <ul>
                {navItems
                  // Filter out "Partner Apps" when in embedded mode
                  .filter(item => !(isEmbedMode && item.href === "/embedded-experience"))
                  .map((item) => (
                    <li key={item.href} className="px-2 py-1">
                      <Link href={item.href}>
                        <a
                          className={`flex items-center px-4 py-2 rounded ${
                            location === item.href
                              ? "text-white font-medium"
                              : "text-gray-100 hover:bg-gray-700"
                          }`}
                          style={{
                            backgroundColor: location === item.href 
                              ? (appType ? branding.primaryColor : "rgb(37, 99, 235)") 
                              : undefined
                          }}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </a>
                      </Link>
                    </li>
                  ))}
                <li className="px-2 py-1 mt-auto">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-gray-100 hover:bg-gray-700 rounded"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    <span>Logout</span>
                  </button>
                </li>
              </ul>
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main 
          className={`flex-1 overflow-y-auto ${shouldHideSidebar ? 'p-0' : 'p-4 md:p-6'}`}
          style={{ 
            background: appType && branding.theme === 'dark' ? '#1f2937' : 'var(--background)',
            color: appType && branding.theme === 'dark' ? 'white' : 'inherit'
          }}
        >
          {!shouldHideSidebar && (
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h1 
                  className="text-2xl font-bold"
                  style={{ 
                    color: appType ? (branding.theme === 'dark' ? 'white' : 'var(--foreground)') : 'var(--foreground)'
                  }}
                >
                  {title || `Welcome to ${appType ? branding.name : 'PaySage Wallet'}, ${user?.fullName?.split(' ')[0] || 'User'}!`}
                </h1>
                <p 
                  className={appType && branding.theme === 'dark' ? 'text-gray-300' : 'text-neutral-600'}
                >
                  {description || (appType ? branding.tagline : "Access your financial services here")}
                </p>
                {user?.isPhantomUser && (
                  <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    PhantomPay-Sandbox
                  </div>
                )}
              </div>
              {showRefreshButton && onRefresh && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onRefresh}
                  style={{ 
                    borderColor: appType ? branding.accentColor : undefined,
                    color: appType ? branding.accentColor : undefined
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              )}
            </div>
          )}
          
          {children}
        </main>
      </div>
      
      {!shouldHideSidebar && (
        <footer 
          className="border-t py-4 px-6 text-center text-sm"
          style={{ 
            background: appType && branding.theme === 'dark' ? '#111827' : 'white',
            borderColor: appType && branding.theme === 'dark' ? '#374151' : 'var(--border)',
            color: appType && branding.theme === 'dark' ? '#9CA3AF' : 'var(--muted-foreground)'
          }}
        >
          {appType 
            ? `${branding.name} — powered by PaySage Wallet` 
            : "Paysafe GenAI Showcase — powered by PaySage Wallet"}
        </footer>
      )}
    </div>
  );
}
