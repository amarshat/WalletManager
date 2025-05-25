import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  ChevronDown, 
  Menu, 
  LogOut, 
  Bell, 
  Settings, 
  Users, 
  ScrollText, 
  LayoutDashboard,
  Wrench,
  AlertCircle,
  Wallet,
  ExternalLink,
  Code
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useBrand } from "@/hooks/use-brand";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import BrandLogo from "@/components/ui/brand-logo";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  subtitle?: string;
}

export default function AdminLayout({ 
  children, 
  title = "Dashboard", 
  description = "Manage your digital wallet platform",
  subtitle
}: AdminLayoutProps) {
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
  
  const navItems = [
    { 
      href: "/admin/dashboard", 
      label: "Dashboard", 
      icon: <LayoutDashboard className="w-5 h-5 mr-3" /> 
    },
    { 
      href: "/admin/brand-settings", 
      label: "Brand Settings", 
      icon: <Settings className="w-5 h-5 mr-3" /> 
    },
    { 
      href: "/admin/wallet-config", 
      label: "Wallet Configuration", 
      icon: <Wallet className="w-5 h-5 mr-3" /> 
    },
    { 
      href: "/admin/manage-customers", 
      label: "Manage Customers", 
      icon: <Users className="w-5 h-5 mr-3" /> 
    },
    { 
      href: "/admin/embedded-wallet", 
      label: "Embedded Wallet", 
      icon: <ExternalLink className="w-5 h-5 mr-3" /> 
    },
    { 
      href: "/admin/embedded-widgets", 
      label: "Embedded Widgets", 
      icon: <Code className="w-5 h-5 mr-3" /> 
    },
    { 
      href: "/admin/system-logs", 
      label: "System Logs", 
      icon: <ScrollText className="w-5 h-5 mr-3" /> 
    },
    { 
      href: "/admin/troubleshooting", 
      label: "Troubleshooting", 
      icon: <AlertCircle className="w-5 h-5 mr-3" /> 
    },
    { 
      href: "/admin/dev-center", 
      label: "Developer Testing", 
      icon: <Wrench className="w-5 h-5 mr-3" /> 
    },
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="flex items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center">
            <button
              className="mr-2 md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="text-neutral-700" />
            </button>
            <BrandLogo className="h-8" />
            <span className="ml-2 text-lg font-semibold text-gray-800">
              {brand?.name || "PaySage Wallet"} Admin
            </span>
          </div>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="mr-4">
              <Bell className="w-5 h-5 text-neutral-600" />
            </Button>
            <div className="relative">
              <div className="flex items-center">
                <Avatar>
                  <AvatarFallback className="bg-neutral-300 text-neutral-700">
                    {user?.fullName?.charAt(0) || "A"}
                  </AvatarFallback>
                </Avatar>
                <span className="ml-2 text-sm font-medium text-neutral-700 hidden md:block">
                  Administrator
                </span>
                <ChevronDown className="ml-1 w-4 h-4 text-neutral-500 hidden md:block" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`w-64 bg-gray-800 text-white fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out z-20 md:z-0 md:relative md:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-700">
            <span className="font-semibold text-white">{brand?.name || "Admin Dashboard"}</span>
          </div>
          <nav className="py-4 overflow-y-auto h-[calc(100%-4rem)]">
            <ul>
              {navItems.map((item) => (
                <li key={item.href} className="px-2 py-1">
                  <div className="w-full">
                    <Link href={item.href}>
                      <div
                        className={`flex items-center px-4 py-2 rounded cursor-pointer ${
                          location === item.href
                            ? "bg-blue-600 text-white font-medium"
                            : "text-gray-100 hover:bg-gray-700"
                        }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  </div>
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

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-neutral-100 p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            {subtitle ? (
              <p className="text-neutral-600">{subtitle}</p>
            ) : (
              <p className="text-neutral-600">{description}</p>
            )}
          </div>
          
          {children}
        </main>
      </div>
      
      <footer className="bg-white border-t border-neutral-200 py-4 px-6 text-center text-sm text-neutral-500">
        {brand?.name || "Digital Wallet"} — <span className="font-semibold" style={{ color: brand?.globalBrandColor || '#7C3AED' }}>Powered by {brand?.globalBrandName || 'PaySage AI'}</span>
      </footer>
    </div>
  );
}
