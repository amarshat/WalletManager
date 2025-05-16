import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useDynamicTheme } from "@/hooks/use-dynamic-theme";
import { ThemeConfig, themePresets } from "@shared/theme-config";
import CustomerEmbeddedWallet from "./customer/embedded-wallet-page";
import { Loader2, LogIn, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

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
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  
  useEffect(() => {
    // Simulate initial load time for theme application
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);
  
  // If user is authenticated, we could redirect to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      // Uncomment to auto-redirect authenticated users
      // navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

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

  // Get content based on theme preset
  const getPresetContent = () => {
    const presetKey = activeTheme?.preset || 'charity';
    
    switch (presetKey) {
      case 'gaming':
        return {
          title: 'Gaming Wallet',
          overview: 'Game Credits',
          metric1: 'Available Credits',
          metric1Value: '1,500',
          metric2: 'XP Collected',
          metric2Value: '3,275',
          itemsTitle: 'Recent Transactions',
          items: [
            { name: "Premium Battle Pass", date: "May 14, 2025", amount: 950 },
            { name: "Character Skin", date: "May 8, 2025", amount: 320 },
            { name: "Weapon Bundle", date: "May 1, 2025", amount: 540 }
          ],
          actionText: 'Add Credits',
          options: ['Battle Pass', 'Credits Pack - Small', 'Credits Pack - Large', 'Season Pass']
        };
      case 'parking':
        return {
          title: 'Parking Wallet',
          overview: 'Parking Credits',
          metric1: 'Available Credits',
          metric1Value: '$45.75',
          metric2: 'Saved This Month',
          metric2Value: '$12.50',
          itemsTitle: 'Recent Parking Sessions',
          items: [
            { name: "Downtown Garage", date: "May 15, 2025", amount: 8.50 },
            { name: "Main Street Lot", date: "May 12, 2025", amount: 4.25 },
            { name: "City Center Parking", date: "May 9, 2025", amount: 6.00 }
          ],
          actionText: 'Add Parking Credits',
          options: ['$5 Credit', '$10 Credit', '$25 Credit', '$50 Credit']
        };
      case 'gambling':
        return {
          title: 'Betting Wallet',
          overview: 'Account Summary',
          metric1: 'Available Balance',
          metric1Value: '$215.50',
          metric2: 'Winnings (30d)',
          metric2Value: '$75.25',
          itemsTitle: 'Recent Bets',
          items: [
            { name: "Football - Manchester vs. Liverpool", date: "May 15, 2025", amount: 25.00 },
            { name: "Horse Racing - Daily Double", date: "May 13, 2025", amount: 15.00 },
            { name: "Poker Tournament", date: "May 10, 2025", amount: 50.00 }
          ],
          actionText: 'Add Funds',
          options: ['Sports Bet', 'Casino Games', 'Poker Tables', 'Horse Racing']
        };
      case 'charity':
      default:
        return {
          title: 'Donation Wallet',
          overview: 'Donation Overview',
          metric1: 'Total Donated',
          metric1Value: '$1,245.00',
          metric2: 'Impact Generated',
          metric2Value: '17 Lives',
          itemsTitle: 'Recent Donations',
          items: [
            { name: "World Mission Fund", date: "May 12, 2025", amount: 50 },
            { name: "Disaster Relief", date: "May 5, 2025", amount: 100 },
            { name: "Kingdom Hall Construction", date: "April 28, 2025", amount: 75 }
          ],
          actionText: 'Make a Donation',
          options: ['World Mission Fund', 'Disaster Relief', 'Kingdom Hall Construction', 'Assembly Hall Maintenance']
        };
    }
  };
  
  const content = getPresetContent();
  
  // Check if user is logged in
  if (!authLoading && user) {
    // Render a full authenticated themed wallet experience
    return (
      <div className="p-6" style={{ 
        backgroundColor: isCustomTheme && activeTheme ? activeTheme.colors.background : '#f9fafb',
        color: isCustomTheme && activeTheme ? activeTheme.colors.text : '#111827',
        minHeight: '100vh'
      }}>
        <div className="max-w-7xl mx-auto">
          {/* Themed wallet header for authenticated users */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{activeTheme?.brand.name || "PaySage Wallet"}</h1>
              <p className="text-muted-foreground">{activeTheme?.brand.tagline || "Your Digital Wallet Solution"}</p>
            </div>
            
            {/* User info */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-medium">{user.fullName || user.username}</p>
                <Link href="/dashboard" className="text-sm inline-flex items-center" style={{ color: activeTheme?.colors.primary }}>
                  Dashboard <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                {user.fullName ? user.fullName.charAt(0) : user.username.charAt(0)}
              </div>
            </div>
          </div>
          
          {/* Dynamic themed content */}
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
                }}>{content.overview}</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{content.metric1}</p>
                    <p className="text-2xl font-bold">{content.metric1Value}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{content.metric2}</p>
                    <p className="text-2xl font-bold">{content.metric2Value}</p>
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
                }}>{content.itemsTitle}</h2>
                
                <div className="space-y-4">
                  {content.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-3 border-b">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.date}</p>
                      </div>
                      <p className="font-bold" style={{ color: activeTheme?.colors.primary }}>
                        ${item.amount.toFixed(2)}
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
                }}>{content.actionText}</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select 
                      className="w-full p-2 border rounded" 
                      style={{
                        borderColor: activeTheme?.components.input.borderColor || '#e2e8f0',
                        borderRadius: activeTheme?.components.input.borderRadius || '0.375rem',
                        backgroundColor: activeTheme?.components.input.backgroundColor || '#ffffff'
                      }}
                    >
                      {content.options.map((option, i) => (
                        <option key={i}>{option}</option>
                      ))}
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
                    Proceed
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center p-4 text-sm text-muted-foreground">
            <p>© 2025 PaySage Wallet — All rights reserved</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Render a simplified wallet view for non-authenticated users
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
          
          {/* Authentication buttons */}
          <div className="flex items-center space-x-2">
            <Link href="/auth" className="flex items-center px-4 py-2 text-sm rounded-md border hover:bg-gray-50" style={{
              borderRadius: activeTheme?.components.button.borderRadius || '0.375rem',
              borderColor: activeTheme?.components.input.borderColor || '#e2e8f0',
            }}>
              <LogIn className="mr-2 h-4 w-4" />
              Sign in
            </Link>
            
            {/* Theme badge */}
            {isCustomTheme && activeTheme && (
              <div className="px-3 py-1 rounded-full text-sm" style={{
                backgroundColor: `${activeTheme.colors.primary}20`,
                color: activeTheme.colors.primary
              }}>
                {activeTheme.preset && activeTheme.preset.charAt(0).toUpperCase() + activeTheme.preset.slice(1)} Theme
              </div>
            )}
          </div>
        </div>
        
        {/* Preview themed wallet content */}
        <div className="grid md:grid-cols-1 gap-6 mb-6" style={{
          fontFamily: activeTheme?.typography.fontFamily
        }}>
          <div className="rounded-lg p-8 text-center" style={{
            backgroundColor: activeTheme?.colors.cardBackground || '#ffffff',
            boxShadow: activeTheme?.effects.useShadows ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
            borderRadius: activeTheme?.components.card.borderRadius || '0.5rem'
          }}>
            <div className="max-w-md mx-auto">
              <h2 className="text-xl md:text-2xl font-bold mb-4" style={{
                fontFamily: activeTheme?.typography.headingFontFamily || activeTheme?.typography.fontFamily
              }}>Experience the {activeTheme?.brand.name}</h2>
              
              <p className="text-muted-foreground mb-8">
                Sign in to access the full {content.title.toLowerCase()} experience and manage your funds securely.
              </p>
              
              {/* Features preview */}
              <div className="grid grid-cols-2 gap-6 mb-8 text-left">
                <div>
                  <h3 className="font-medium mb-1">Secure Transactions</h3>
                  <p className="text-sm text-muted-foreground">Manage your funds with enterprise-grade security</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Easy Transfers</h3>
                  <p className="text-sm text-muted-foreground">Send and receive funds with just a few clicks</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Budget Management</h3>
                  <p className="text-sm text-muted-foreground">Track spending and set savings goals</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Carbon Tracking</h3>
                  <p className="text-sm text-muted-foreground">Monitor your environmental impact</p>
                </div>
              </div>
              
              <Link 
                href="/auth" 
                className="inline-flex items-center justify-center w-full py-3 px-4 text-white font-medium rounded" 
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
                Sign in to continue <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
        
        <div className="text-center p-4 text-sm text-muted-foreground">
          <p>This is a themed demo wallet. Sign in to access all features.</p>
          <p className="mt-1">© 2025 PaySage Wallet — All rights reserved</p>
        </div>
      </div>
    </div>
  );
}