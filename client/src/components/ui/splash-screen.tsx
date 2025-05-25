import { useBrand } from "@/hooks/use-brand";
import { useAppBranding } from "@/hooks/use-app-branding";
import BrandLogo from "@/components/ui/brand-logo";
import { BookOpen, Car, Gamepad2, Wallet, Heart } from "lucide-react";
import { CSSProperties } from "react";

interface SplashScreenProps {
  style?: CSSProperties;
  brandName?: string;
}

export default function SplashScreen({ style, brandName }: SplashScreenProps) {
  const { brand } = useBrand();
  const { branding, appType } = useAppBranding();
  
  // Get the appropriate icon based on app type
  const IconComponent = () => {
    const iconSize = 64;
    const iconColor = appType ? branding.primaryColor : '#6366f1';
    
    if (appType === 'blue') {
      return <Car size={iconSize} color={iconColor} />;
    } else if (appType === 'purple') {
      return <BookOpen size={iconSize} color={iconColor} />;
    } else if (appType === 'red') {
      return <Gamepad2 size={iconSize} color={iconColor} />;
    } else {
      return <Wallet size={iconSize} color={iconColor} />;
    }
  };
  
  const backgroundColor = appType && branding.theme === 'dark' ? '#1f2937' : 'white';
  const textColor = appType && branding.theme === 'dark' ? 'white' : 'text-gray-900';
  const subtextColor = appType && branding.theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const spinnerColor = appType ? branding.primaryColor : '#6366f1';
  
  // Use custom style if provided, otherwise use default styling
  const customStyle = style || { backgroundColor };
  const displayBrandName = brandName || (appType ? branding.name : (brand?.name || "Paysafe Embedded Wallet Platform"));
  
  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={customStyle}
    >
      {appType ? (
        <div className="mb-8">
          <IconComponent />
        </div>
      ) : brand?.globalBrandLogo ? (
        <div className="mb-8 w-32 h-32 flex items-center justify-center">
          <img 
            src={brand.globalBrandLogo} 
            alt="Global Brand Logo" 
            className="max-w-full max-h-full object-contain"
            onError={() => {
              // Fallback to regular brand logo if image fails to load
              document.getElementById('global-brand-logo')?.classList.add('hidden');
              document.getElementById('fallback-brand-logo')?.classList.remove('hidden');
            }}
            id="global-brand-logo"
          />
          <div id="fallback-brand-logo" className="hidden">
            <BrandLogo className="w-32" />
          </div>
        </div>
      ) : (
        <BrandLogo className="w-32 mb-8" />
      )}
      
      <div className="text-center mb-6 fade-in">
        <h1 className={`text-2xl font-bold ${textColor}`}>
          {displayBrandName}
        </h1>
        <p className={`mt-2 ${subtextColor}`}>
          {appType ? branding.tagline : (brand?.tagline || "Your Digital Wallet Solution")}
        </p>
      </div>
      
      <div 
        className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: spinnerColor, borderTopColor: 'transparent' }}
      ></div>
      
      <p className={`text-sm absolute bottom-6 ${subtextColor}`}>
        {appType 
          ? `${branding.name} — powered by ${brand?.globalBrandName || 'Paysafe'}` 
          : `Paysafe GenAI Showcase — powered by Paysafe`}
      </p>
    </div>
  );
}
