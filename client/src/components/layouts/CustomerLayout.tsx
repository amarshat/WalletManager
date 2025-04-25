import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Menu, 
  LogOut, 
  Bell, 
  User, 
  CreditCard, 
  LayoutDashboard, 
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useBrand } from "@/hooks/use-brand";
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
}

export default function CustomerLayout({ 
  children, 
  title, 
  description, 
  onRefresh,
  showRefreshButton = false
}: CustomerLayoutProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { brand } = useBrand();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
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
      href: "/cards", 
      label: "Cards", 
      icon: <CreditCard className="w-5 h-5 mr-3" /> 
    },
    { 
      href: "/profile", 
      label: "Profile", 
      icon: <User className="w-5 h-5 mr-3" /> 
    },
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
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

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`w-64 bg-secondary text-white fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out z-20 md:z-0 md:relative md:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-16 flex items-center justify-center border-b border-secondary-light">
            <span className="font-semibold">{brand?.name || "PaySage"}</span>
          </div>
          <div className="p-4 border-b border-secondary-light">
            <div className="flex items-center">
              <Avatar className="w-10 h-10 mr-3">
                <AvatarFallback className="bg-primary text-white">
                  {user?.fullName ? getInitials(user.fullName) : "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-white">{user?.fullName}</div>
                <div className="text-xs text-neutral-400">@{user?.username}</div>
              </div>
            </div>
          </div>
          <nav className="py-4 overflow-y-auto h-[calc(100%-9rem)]">
            <ul>
              {navItems.map((item) => (
                <li key={item.href} className="px-2 py-1">
                  <Link href={item.href}>
                    <a
                      className={`flex items-center px-4 py-2 rounded ${
                        location === item.href
                          ? "text-white bg-primary bg-opacity-20"
                          : "text-neutral-300 hover:bg-primary hover:bg-opacity-10"
                      }`}
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
                  className="w-full flex items-center px-4 py-2 text-neutral-300 hover:bg-primary hover:bg-opacity-10 rounded"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-neutral-100 p-4 md:p-6">
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-secondary">
                {title || `Welcome back, ${user?.fullName?.split(' ')[0] || 'User'}!`}
              </h1>
              <p className="text-neutral-600">
                {description || "Here's your wallet overview"}
              </p>
            </div>
            {showRefreshButton && onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            )}
          </div>
          
          {children}
        </main>
      </div>
      
      <footer className="bg-white border-t border-neutral-200 py-4 px-6 text-center text-sm text-neutral-500">
        Paysafe GenAI Showcase — powered by PaySage
      </footer>
    </div>
  );
}
