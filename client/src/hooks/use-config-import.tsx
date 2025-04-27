import { useEffect, useState, useRef } from 'react';
import { useBrand } from './use-brand';
import { useToast } from './use-toast';
import { useLocation } from 'wouter';
import { useAuth } from './use-auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Check } from "lucide-react";

type WalletConfig = {
  name?: string;
  tagline?: string | null;  // Allow null to match the database type
  iconUrl?: string | null;  // Allow null to match the database type
  logo?: string | null;     // Allow null to match the database type
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
};

// Global storage to persist config parameter during login flow
// This allows us to preserve the config during login redirects
const configStore = {
  pendingConfig: null as string | null,
  setPendingConfig: (config: string | null) => {
    configStore.pendingConfig = config;
  },
  getPendingConfig: () => configStore.pendingConfig,
  clearPendingConfig: () => {
    configStore.pendingConfig = null;
  }
};

/**
 * Hook that checks for base64 encoded configuration in URL parameters
 * and imports it if present
 */
export function useConfigImport() {
  const { updateBrand } = useBrand();
  const { toast } = useToast();
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [hasChecked, setHasChecked] = useState(false);
  const [pendingConfig, setPendingConfig] = useState<WalletConfig | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  // Helper function to parse configuration
  const parseConfig = (configParam: string): WalletConfig | null => {
    try {
      // Decode the base64 config
      const decodedConfig = atob(configParam);
      const config: WalletConfig = JSON.parse(decodedConfig);
      
      // Validate config (basic check)
      if (!config || typeof config !== 'object') {
        throw new Error('Invalid configuration format');
      }
      
      return config;
    } catch (error) {
      console.error('Error parsing configuration:', error);
      toast({
        title: 'Invalid Configuration',
        description: error instanceof Error ? error.message : 'Failed to parse configuration',
        variant: 'destructive',
      });
      return null;
    }
  };
  
  // Apply configuration after confirmation
  const applyConfiguration = async (config: WalletConfig) => {
    try {
      await updateBrand(config);
      
      toast({
        title: 'Configuration Imported',
        description: 'The wallet configuration has been successfully imported.',
      });
      
      // Clear pending config
      setPendingConfig(null);
      configStore.clearPendingConfig();
      
      // Remove the configuration parameter from the URL
      const cleanUrl = window.location.pathname;
      setLocation(cleanUrl, { replace: true });
    } catch (error) {
      console.error('Error applying configuration:', error);
      toast({
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'Failed to import configuration',
        variant: 'destructive',
      });
    }
  };
  
  // Check for configuration parameter on initial load
  useEffect(() => {
    // Only run once per auth state change
    if (hasChecked) return;
    
    const checkConfigParam = () => {
      // First check URL for config parameter
      const url = new URL(window.location.href);
      const configParam = url.searchParams.get('config');
      
      if (configParam) {
        // If not logged in, store config for later and wait
        if (!user) {
          configStore.setPendingConfig(configParam);
          toast({
            title: 'Configuration Detected',
            description: 'Please log in to apply the wallet configuration.',
          });
          
          // Mark as checked but don't clear URL param yet
          setHasChecked(true);
          return;
        }
        
        // If logged in, parse config and show confirmation dialog
        const config = parseConfig(configParam);
        if (config) {
          setPendingConfig(config);
          setConfirmDialogOpen(true);
        }
        
        // Mark as checked
        setHasChecked(true);
        return;
      }
      
      // If no URL param, check for stored config from previous login
      const storedConfig = configStore.getPendingConfig();
      if (storedConfig && user) {
        // User is now logged in and we have a stored config
        const config = parseConfig(storedConfig);
        if (config) {
          setPendingConfig(config);
          setConfirmDialogOpen(true);
        }
        configStore.clearPendingConfig();
      }
      
      // Mark as checked
      setHasChecked(true);
    };
    
    checkConfigParam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, hasChecked]);
  
  // Reset check flag when location changes
  useEffect(() => {
    return () => {
      if (location.includes('?config=')) {
        setHasChecked(false);
      }
    };
  }, [location]);
  
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
  
  // Configuration confirmation dialog
  const ConfigConfirmDialog = () => {
    if (!pendingConfig) {
      return <></>; // Return empty fragment instead of null
    }
    
    return (
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              Confirm Configuration Import
            </DialogTitle>
            <DialogDescription>
              Review the configuration before applying it to your wallet.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <h4 className="text-sm font-medium mb-2">Configuration Details:</h4>
            <ScrollArea className="h-[200px] rounded-md border p-4">
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(pendingConfig, null, 2)}
              </pre>
            </ScrollArea>
            
            <div className="mt-4 text-sm text-muted-foreground">
              <p className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                Warning: Only import configurations from trusted sources.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setConfirmDialogOpen(false);
                setPendingConfig(null);
                // Remove config parameter
                const cleanUrl = window.location.pathname;
                setLocation(cleanUrl, { replace: true });
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setConfirmDialogOpen(false);
                applyConfiguration(pendingConfig);
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="mr-2 h-4 w-4" />
              Apply Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  return { 
    generateConfigUrl,
    ConfigConfirmDialog
  };
}