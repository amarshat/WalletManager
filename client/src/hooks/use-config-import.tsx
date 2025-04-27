import { useEffect, useState, useRef } from 'react';
import { useBrand } from './use-brand';
import { useToast } from './use-toast';
import { useLocation } from 'wouter';

type WalletConfig = {
  name?: string;
  tagline?: string | null;  // Allow null to match the database type
  iconUrl?: string | null;  // Allow null to match the database type
  logo?: string | null;     // Allow null to match the database type
  walletConfig?: {
    transactionDisplayCount?: number;
    allowedCurrencies?: string[];
    maxNegativeBalance?: number;
    enableAnalytics?: boolean;
    enableBulkTransfers?: boolean;
    enableTestCards?: boolean;
    maxTestCards?: number;
    maxTransferAmount?: number;
    defaultCommissionRate?: number;
    retentionPeriodDays?: number;
  }
};

/**
 * Hook that checks for base64 encoded configuration in URL parameters
 * and imports it if present
 */
export function useConfigImport() {
  const { updateBrand } = useBrand();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [hasChecked, setHasChecked] = useState(false);
  
  // Check for configuration parameter on initial load
  useEffect(() => {
    // Only run once on mount
    const initialUrl = window.location.href;
    const isFirstRender = !hasChecked;
    
    const importConfig = async () => {
      if (!isFirstRender) return;  // Skip if not first render
      
      try {
        // Parse the URL to get the config parameter
        const url = new URL(initialUrl);
        const configParam = url.searchParams.get('config');
        
        if (!configParam) {
          setHasChecked(true);
          return;
        }
        
        // Decode the base64 config
        const decodedConfig = atob(configParam);
        const config: WalletConfig = JSON.parse(decodedConfig);
        
        // Validate config (basic check)
        if (!config || typeof config !== 'object') {
          throw new Error('Invalid configuration format');
        }
        
        // Apply the configuration
        await updateBrand(config);
        
        // Show success message
        toast({
          title: 'Configuration Imported',
          description: 'The wallet configuration has been successfully imported.',
        });
        
        // Remove the configuration parameter from the URL to prevent reloading
        // Navigate to the same page without the parameter
        const cleanUrl = window.location.pathname;
        setLocation(cleanUrl, { replace: true });
      } catch (error) {
        console.error('Error importing configuration:', error);
        toast({
          title: 'Import Failed',
          description: error instanceof Error ? error.message : 'Failed to import configuration',
          variant: 'destructive',
        });
      } finally {
        setHasChecked(true);
      }
    };
    
    importConfig();
    // Empty dependency array with eslint disable ensures this only runs once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  /**
   * Generate a shareable configuration URL from the current settings
   */
  const generateConfigUrl = (config: WalletConfig): string => {
    try {
      // Convert config to base64
      const configString = JSON.stringify(config);
      const base64Config = btoa(configString);
      
      // Create URL with config parameter
      const url = new URL(window.location.href);
      const baseUrl = `${url.protocol}//${url.host}${url.pathname}`;
      return `${baseUrl}?config=${base64Config}`;
    } catch (error) {
      console.error('Error generating configuration URL:', error);
      toast({
        title: 'URL Generation Failed',
        description: 'Failed to generate configuration URL',
        variant: 'destructive',
      });
      return '';
    }
  };
  
  return { generateConfigUrl };
}