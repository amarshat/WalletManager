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

  // Render a simplified wallet view with applied theme
  return (
    <div className="p-6" style={{ 
      backgroundColor: isCustomTheme && activeTheme ? activeTheme.colors.background : '#f9fafb',
      color: isCustomTheme && activeTheme ? activeTheme.colors.text : '#111827',
      minHeight: '100vh'
    }}>
      <div className="max-w-7xl mx-auto">
        {/* Themed wallet header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{activeTheme?.brand.name || "PaySage Wallet"}</h1>
            <p className="text-muted-foreground">{activeTheme?.brand.tagline || "Your Digital Wallet Solution"}</p>
          </div>
          
          {/* Theme indicator badge */}
          {isCustomTheme && activeTheme && (
            <div className="px-3 py-1 rounded-full text-sm" style={{
              backgroundColor: `${activeTheme.colors.primary}20`,
              color: activeTheme.colors.primary
            }}>
              {activeTheme.brand.name} Theme
            </div>
          )}
        </div>
        
        {/* Simplified themed wallet content */}
        <div className="grid md:grid-cols-3 gap-6 mb-6" style={{
          fontFamily: activeTheme?.typography.fontFamily
        }}>
          <div className="col-span-3 md:col-span-2">
            <div className="rounded-lg p-6 mb-6" style={{
              backgroundColor: activeTheme?.colors.cardBackground || '#ffffff',
              boxShadow: activeTheme?.effects.useShadows ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              borderRadius: activeTheme?.components.card.borderRadius || '0.5rem'
            }}>
              <h2 className="text-xl font-bold mb-4" style={{
                fontFamily: activeTheme?.typography.headingFontFamily || activeTheme?.typography.fontFamily
              }}>Donation Overview</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Donated</p>
                  <p className="text-2xl font-bold">$1,245.00</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Impact Generated</p>
                  <p className="text-2xl font-bold">17 Lives</p>
                </div>
              </div>
            </div>
            
            <div className="rounded-lg p-6" style={{
              backgroundColor: activeTheme?.colors.cardBackground || '#ffffff',
              boxShadow: activeTheme?.effects.useShadows ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              borderRadius: activeTheme?.components.card.borderRadius || '0.5rem'
            }}>
              <h2 className="text-xl font-bold mb-4" style={{
                fontFamily: activeTheme?.typography.headingFontFamily || activeTheme?.typography.fontFamily
              }}>Recent Donations</h2>
              
              <div className="space-y-4">
                {[
                  { name: "World Mission Fund", date: "May 12, 2025", amount: 50 },
                  { name: "Disaster Relief", date: "May 5, 2025", amount: 100 },
                  { name: "Kingdom Hall Construction", date: "April 28, 2025", amount: 75 }
                ].map((donation, i) => (
                  <div key={i} className="flex justify-between items-center p-3 border-b">
                    <div>
                      <p className="font-medium">{donation.name}</p>
                      <p className="text-sm text-muted-foreground">{donation.date}</p>
                    </div>
                    <p className="font-bold" style={{ color: activeTheme?.colors.primary }}>
                      ${donation.amount.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="col-span-3 md:col-span-1">
            <div className="rounded-lg p-6" style={{
              backgroundColor: activeTheme?.colors.cardBackground || '#ffffff',
              boxShadow: activeTheme?.effects.useShadows ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              borderRadius: activeTheme?.components.card.borderRadius || '0.5rem'
            }}>
              <h2 className="text-xl font-bold mb-4" style={{
                fontFamily: activeTheme?.typography.headingFontFamily || activeTheme?.typography.fontFamily
              }}>Make a Donation</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Donation Type</label>
                  <select 
                    className="w-full p-2 border rounded" 
                    style={{
                      borderColor: activeTheme?.components.input.borderColor || '#e2e8f0',
                      borderRadius: activeTheme?.components.input.borderRadius || '0.375rem',
                      backgroundColor: activeTheme?.components.input.backgroundColor || '#ffffff'
                    }}
                  >
                    <option>World Mission Fund</option>
                    <option>Disaster Relief</option>
                    <option>Kingdom Hall Construction</option>
                    <option>Assembly Hall Maintenance</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Amount</label>
                  <div className="flex">
                    <span 
                      className="inline-flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50" 
                      style={{
                        borderColor: activeTheme?.components.input.borderColor || '#e2e8f0',
                        borderRadius: activeTheme?.components.input.borderRadius + ' 0 0 ' + activeTheme?.components.input.borderRadius,
                      }}
                    >
                      $
                    </span>
                    <input 
                      type="text" 
                      className="w-full p-2 border rounded-r-md" 
                      placeholder="0.00"
                      style={{
                        borderColor: activeTheme?.components.input.borderColor || '#e2e8f0',
                        borderRadius: '0 ' + activeTheme?.components.input.borderRadius + ' ' + activeTheme?.components.input.borderRadius + ' 0',
                        backgroundColor: activeTheme?.components.input.backgroundColor || '#ffffff'
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="border p-3 rounded flex items-center space-x-2 cursor-pointer" style={{
                      borderColor: activeTheme?.colors.primary,
                      backgroundColor: `${activeTheme?.colors.primary}10`,
                      borderRadius: activeTheme?.components.card.borderRadius || '0.5rem'
                    }}>
                      <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: activeTheme?.colors.primary }}></div>
                      <span>Wallet Balance</span>
                    </div>
                    <div className="border p-3 rounded flex items-center space-x-2 cursor-pointer" style={{
                      borderColor: activeTheme?.components.input.borderColor || '#e2e8f0',
                      borderRadius: activeTheme?.components.card.borderRadius || '0.5rem'
                    }}>
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                      <span>Credit Card</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  className="w-full py-2 px-4 mt-4 text-white font-medium rounded" 
                  style={{
                    backgroundColor: activeTheme?.colors.primary,
                    background: activeTheme?.effects.useGradients 
                      ? `linear-gradient(to right, ${activeTheme.colors.primary}, ${activeTheme.colors.secondary})`
                      : activeTheme?.colors.primary,
                    borderRadius: activeTheme?.components.button.borderRadius || '0.375rem',
                    fontWeight: activeTheme?.components.button.boldText ? 'bold' : 'normal',
                    textTransform: activeTheme?.components.button.textTransform as any || 'none'
                  }}
                >
                  Donate Now
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center p-4 text-sm text-muted-foreground">
          <p>This is a themed demo wallet. Actual donation functionality is not enabled.</p>
          <p className="mt-1">© 2025 PaySage Wallet — All rights reserved</p>
        </div>
      </div>
    </div>
  );
}