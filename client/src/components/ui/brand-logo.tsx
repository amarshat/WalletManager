import { useBrand } from "@/hooks/use-brand";
import { useAppBranding } from "@/hooks/use-app-branding";
import defaultLogo from "@/assets/default-logo.svg";
import { useState, useEffect } from "react";
import { Wallet, Gamepad2, BookOpen, Car } from "lucide-react";

interface BrandLogoProps {
  className?: string;
  useIcon?: boolean;
  showGlobalBranding?: boolean;
  size?: "small" | "medium" | "large";
}

// Helper function to check if a string is a URL
const isValidUrl = (str: string): boolean => {
  try {
    // Check if it starts with http:// or https://
    if (str.startsWith('http://') || str.startsWith('https://')) {
      new URL(str);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

// Helper function to check if a string is a base64 image
const isBase64Image = (str: string): boolean => {
  return str.startsWith('data:image/');
};

export default function BrandLogo({ 
  className = "h-8", 
  useIcon = false,
  showGlobalBranding = false,
  size = "medium"
}: BrandLogoProps) {
  const { brand } = useBrand();
  const { branding, appType } = useAppBranding();
  const [imageError, setImageError] = useState(false);
  
  // Reset error state when brand or useIcon changes
  useEffect(() => {
    setImageError(false);
  }, [brand, useIcon, appType]);
  
  // Handle image loading errors
  const handleImageError = () => {
    setImageError(true);
  };
  
  // If we have an app type, render the appropriate icon
  if (appType) {
    const iconSize = className.includes('h-8') ? 28 : className.includes('h-10') ? 36 : 24;
    const iconColor = branding.primaryColor;
    
    if (appType === 'blue') {
      return <Car size={iconSize} color={iconColor} />;
    } else if (appType === 'purple') {
      return <BookOpen size={iconSize} color={iconColor} />;
    } else if (appType === 'red') {
      return <Gamepad2 size={iconSize} color={iconColor} />;
    }
  }
  
  // For co-branding display (both global and tenant logos)
  if (showGlobalBranding && brand) {
    // Determine size classes
    const containerClass = "flex items-center gap-2";
    const globalLogoClass = size === "small" ? "h-5" : size === "large" ? "h-10" : "h-7";
    const tenantLogoClass = size === "small" ? "h-6" : size === "large" ? "h-12" : "h-8";
    
    return (
      <div className={containerClass}>
        {/* Display global branding logo if available */}
        {brand.globalBrandLogo && !imageError ? (
          <img 
            src={brand.globalBrandLogo}
            alt={brand.globalBrandName || "Global Brand"}
            className={globalLogoClass}
            onError={handleImageError}
          />
        ) : (
          <img 
            src={defaultLogo}
            alt="PaySage"
            className={globalLogoClass}
          />
        )}
        
        {/* Divider */}
        <div className="h-6 w-px bg-white/30"></div>
        
        {/* Display tenant logo if available */}
        {brand.logo && !imageError ? (
          <img 
            src={brand.logo}
            alt={brand.name || "Tenant Brand"}
            className={tenantLogoClass}
            onError={handleImageError}
          />
        ) : (
          <span className="text-lg font-semibold">{brand.name || "Digital Wallet"}</span>
        )}
      </div>
    );
  }
  
  // If using icon and we have an icon URL/base64, use it
  if (useIcon && brand?.iconUrl && !imageError) {
    // The iconUrl can be either a URL or base64 data
    return (
      <img 
        src={brand.iconUrl} 
        alt={brand.name || "Brand Icon"} 
        className={className}
        onError={handleImageError}
      />
    );
  }
  
  // If using logo and we have a custom logo (URL or base64), use it
  if (!useIcon && brand?.logo && !imageError) {
    // The logo can be either a URL or base64 data
    return (
      <img 
        src={brand.logo} 
        alt={brand.name || "Brand Logo"} 
        className={className}
        onError={handleImageError}
      />
    );
  }
  
  // Otherwise use our custom AI Sage themed default logo
  return (
    <img 
      src={defaultLogo} 
      alt={brand?.name || "PaySage Wallet"} 
      className={className} 
    />
  );
}
