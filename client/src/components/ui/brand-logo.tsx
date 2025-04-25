import { useBrand } from "@/hooks/use-brand";

interface BrandLogoProps {
  className?: string;
}

export default function BrandLogo({ className = "h-8" }: BrandLogoProps) {
  const { brand } = useBrand();
  
  // If the brand has a custom logo, use it
  if (brand?.logo) {
    return <img src={brand.logo} alt={brand.name || "Brand Logo"} className={className} />;
  }
  
  // Otherwise use the default Paysafe logo
  return (
    <img 
      src="https://www.paysafe.com/fileadmin/templates/img/layout/ps-logo.svg" 
      alt={brand?.name || "PaySage"} 
      className={className} 
    />
  );
}
