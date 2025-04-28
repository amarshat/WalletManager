import { useBrand } from "@/hooks/use-brand";
import { useAppBranding } from "@/hooks/use-app-branding";
import BrandLogo from "@/components/ui/brand-logo";
import { BookOpen, Car, Gamepad2, Wallet } from "lucide-react";

export default function SplashScreen() {
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
  
  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ backgroundColor }}
    >
      {appType ? (
        <div className="mb-8">
          <IconComponent />
        </div>
      ) : (
        <BrandLogo className="w-32 mb-8" />
      )}
      
      <div className="text-center mb-6 fade-in">
        <h1 className={`text-2xl font-bold ${textColor}`}>
          {appType ? branding.name : (brand?.name || "PaySage Wallet")}
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
          ? `${branding.name} — powered by PaySage Wallet` 
          : "Paysafe GenAI Showcase — powered by PaySage"}
      </p>
    </div>
  );
}
