import { useBrand } from "@/hooks/use-brand";
import defaultLogo from "@/assets/default-logo.svg";
import { useState, useEffect } from "react";

interface BrandLogoProps {
  className?: string;
  useIcon?: boolean;
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

export default function BrandLogo({ className = "h-8", useIcon = false }: BrandLogoProps) {
  const { brand } = useBrand();
  const [imageError, setImageError] = useState(false);
  
  // Reset error state when brand or useIcon changes
  useEffect(() => {
    setImageError(false);
  }, [brand, useIcon]);
  
  // Handle image loading errors
  const handleImageError = () => {
    setImageError(true);
  };
  
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
