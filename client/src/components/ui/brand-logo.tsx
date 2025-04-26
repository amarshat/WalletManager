import { useBrand } from "@/hooks/use-brand";
import defaultLogo from "@/assets/default-logo.svg";

interface BrandLogoProps {
  className?: string;
  useIcon?: boolean;
}

export default function BrandLogo({ className = "h-8", useIcon = false }: BrandLogoProps) {
  const { brand } = useBrand();
  
  // If useIcon is true and we have an icon URL, use it
  if (useIcon && brand?.iconUrl) {
    return <img src={brand.iconUrl} alt={brand.name || "Brand Icon"} className={className} />;
  }
  
  // If using regular logo and the brand has a custom logo, use it
  if (!useIcon && brand?.logo) {
    return <img src={brand.logo} alt={brand.name || "Brand Logo"} className={className} />;
  }
  
  // Otherwise use our custom AI Sage themed logo
  return (
    <img 
      src={defaultLogo} 
      alt={brand?.name || "PaySage Wallet"} 
      className={className} 
    />
  );
}
