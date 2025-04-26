import { useBrand } from "@/hooks/use-brand";
import BrandLogo from "@/components/ui/brand-logo";

export default function SplashScreen() {
  const { brand } = useBrand();
  
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
      <BrandLogo className="w-32 mb-8" />
      <div className="text-center mb-6 fade-in">
        <h1 className="text-2xl font-bold text-gray-900">
          {brand?.name || "PaySage Wallet"}
        </h1>
        <p className="text-gray-700 mt-2">
          {brand?.tagline || "Your Digital Wallet Solution"}
        </p>
      </div>
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm text-gray-700 absolute bottom-6">
        Paysafe GenAI Showcase — powered by PaySage
      </p>
    </div>
  );
}
