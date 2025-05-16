import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useDynamicTheme } from "@/hooks/use-dynamic-theme";
import { ThemeConfig, themePresets } from "@shared/theme-config";
import CustomerEmbeddedWallet from "./customer/embedded-wallet-page";
import { Loader2 } from "lucide-react";

/**
 * Theme-based wallet that applies themes based on URL query parameter
 * Access with: /themed-wallet?_hidden_brand_experience=<base64 config or preset name>
 * 
 * This page doesn't require authentication, allowing public access to themed wallet
 * experiences that can be embedded in external sites.
 */
export default function ThemedWalletPage() {
  const { activeTheme, isCustomTheme } = useDynamicTheme();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate initial load time for theme application
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Show loading indicator while theme is being applied
  if (loading) {
    const spinnerColor = isCustomTheme && activeTheme ? activeTheme.colors.primary : '#4f46e5';
    const textColor = isCustomTheme && activeTheme ? activeTheme.colors.text : '#111827';
    const bgColor = isCustomTheme && activeTheme ? activeTheme.colors.background : '#f9fafb';
    
    return (
      <div className="flex flex-col items-center justify-center min-h-screen" style={{ backgroundColor: bgColor, color: textColor }}>
        <Loader2 className="h-8 w-8 animate-spin mb-4" style={{ color: spinnerColor }} />
        <p className="text-lg font-medium">Applying theme...</p>
        {isCustomTheme && activeTheme && (
          <p className="text-sm mt-2">{activeTheme.brand.name}</p>
        )}
      </div>
    );
  }

  // Render wallet with applied theme
  return <CustomerEmbeddedWallet skipAuth={true} />;
}