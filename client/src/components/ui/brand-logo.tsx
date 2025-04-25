import { useBrand } from "@/hooks/use-brand";
import defaultLogo from "@/assets/default-logo.svg";

interface BrandLogoProps {
  className?: string;
}

export default function BrandLogo({ className = "h-8" }: BrandLogoProps) {
  const { brand } = useBrand();
  
  // If the brand has a custom logo, use it
  if (brand?.logo) {
    return <img src={brand.logo} alt={brand.name || "Brand Logo"} className={className} />;
  }
  
  // Otherwise use our custom AI Sage themed logo
  return (
    <img 
      src={defaultLogo} 
      alt={brand?.name || "PaySage"} 
      className={className} 
    />
  );
}
