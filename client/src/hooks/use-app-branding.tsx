import { useEffect, useState } from 'react';

export type AppType = 'blue' | 'purple' | 'red' | null;

export interface AppBranding {
  name: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoIcon: string;
  theme: 'light' | 'dark';
}

const defaultBranding: AppBranding = {
  name: 'PaySage Wallet',
  tagline: 'Seamless digital payment solutions',
  primaryColor: '#6366f1', // Indigo-500
  secondaryColor: '#4f46e5', // Indigo-600
  accentColor: '#3730a3', // Indigo-800
  logoIcon: 'Wallet',
  theme: 'light',
};

const blueBranding: AppBranding = {
  name: 'BingGo Parking',
  tagline: 'Smart parking solutions at your fingertips',
  primaryColor: '#2563eb', // Blue-600
  secondaryColor: '#1d4ed8', // Blue-700
  accentColor: '#1e40af', // Blue-800
  logoIcon: 'Car',
  theme: 'light',
};

const purpleBranding: AppBranding = {
  name: 'Jehovah\'s Witnesses Portal',
  tagline: 'The worldwide work of spiritual education',
  primaryColor: '#9333ea', // Purple-600
  secondaryColor: '#7e22ce', // Purple-700
  accentColor: '#6b21a8', // Purple-800
  logoIcon: 'BookOpen',
  theme: 'light',
};

const redBranding: AppBranding = {
  name: 'FusionForge Gaming',
  tagline: 'Next-level gaming experiences',
  primaryColor: '#dc2626', // Red-600
  secondaryColor: '#b91c1c', // Red-700
  accentColor: '#991b1b', // Red-800
  logoIcon: 'Gamepad2',
  theme: 'dark',
};

export function useAppBranding(): {
  branding: AppBranding;
  appType: AppType;
  isEmbedded: boolean;
} {
  const [appType, setAppType] = useState<AppType>(null);
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [branding, setBranding] = useState<AppBranding>(defaultBranding);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const appTypeParam = urlParams.get('appType') as AppType;
    const hideSidebar = urlParams.get('hideSidebar') === 'true';
    const embedMode = urlParams.get('embedMode') === 'true';
    
    if (appTypeParam) {
      setAppType(appTypeParam);
      
      // Set branding based on appType
      switch (appTypeParam) {
        case 'blue':
          setBranding(blueBranding);
          break;
        case 'purple':
          setBranding(purpleBranding);
          break;
        case 'red':
          setBranding(redBranding);
          break;
        default:
          setBranding(defaultBranding);
      }
    }
    
    setIsEmbedded(hideSidebar || embedMode);
  }, []);

  return { branding, appType, isEmbedded };
}