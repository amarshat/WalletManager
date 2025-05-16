import { useEffect, useState } from 'react';
import { ThemeConfig, defaultThemeConfig, themePresets, themeConfigToCssVariables } from '@shared/theme-config';

/**
 * Hook to apply dynamic theming based on URL query parameters
 * Supports the format: ?_hidden_brand_experience=<base64_encoded_theme>
 * or preset names like ?_hidden_brand_experience=gaming
 */
export function useDynamicTheme() {
  const [activeTheme, setActiveTheme] = useState<ThemeConfig | null>(null);
  const [isCustomTheme, setIsCustomTheme] = useState(false);

  useEffect(() => {
    const applyTheme = (themeConfig: ThemeConfig) => {
      const cssVars = themeConfigToCssVariables(themeConfig);
      
      // Apply CSS variables to root element
      Object.entries(cssVars).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
      });

      // Update document title with brand name
      if (themeConfig.brand.name) {
        document.title = themeConfig.brand.name;
      }

      // Set theme metadata
      setActiveTheme(themeConfig);
    };

    const extractThemeFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const themeParam = params.get('_hidden_brand_experience');
      
      if (!themeParam) return;

      // Check if it's a preset name
      if (themePresets[themeParam]) {
        applyTheme(themePresets[themeParam]);
        setIsCustomTheme(true);
        return;
      }

      try {
        // Try to decode as base64
        const decodedData = atob(themeParam);
        const themeConfig = JSON.parse(decodedData);
        
        // Validate the theme config by checking for required properties
        if (themeConfig.colors && themeConfig.brand) {
          // Merge with default config to ensure all properties exist
          const mergedConfig = {
            ...defaultThemeConfig,
            ...themeConfig,
            // Deep merge for nested objects
            colors: { ...defaultThemeConfig.colors, ...themeConfig.colors },
            typography: { ...defaultThemeConfig.typography, ...themeConfig.typography },
            components: { 
              ...defaultThemeConfig.components, 
              ...themeConfig.components,
              button: { ...defaultThemeConfig.components.button, ...themeConfig.components?.button },
              card: { ...defaultThemeConfig.components.card, ...themeConfig.components?.card },
              input: { ...defaultThemeConfig.components.input, ...themeConfig.components?.input },
              navigation: { ...defaultThemeConfig.components.navigation, ...themeConfig.components?.navigation },
            },
            layout: { ...defaultThemeConfig.layout, ...themeConfig.layout },
            effects: { ...defaultThemeConfig.effects, ...themeConfig.effects },
          };
          
          applyTheme(mergedConfig);
          setIsCustomTheme(true);
        }
      } catch (error) {
        console.error('Failed to parse theme configuration:', error);
      }
    };

    // Apply theme from URL parameters
    extractThemeFromUrl();

    // If no custom theme is applied, use the default
    if (!isCustomTheme) {
      applyTheme(defaultThemeConfig);
    }

    // Clean up function to restore default theme
    return () => {
      const defaultVars = themeConfigToCssVariables(defaultThemeConfig);
      Object.keys(defaultVars).forEach(key => {
        document.documentElement.style.removeProperty(key);
      });
    };
  }, [isCustomTheme]);

  /**
   * Generate a Base64 encoded theme configuration string
   * @param presetName Optional preset name to use as a base
   * @param overrides Optional overrides to apply to the preset
   * @returns Base64 encoded theme configuration
   */
  const generateThemeConfig = (presetName?: keyof typeof themePresets, overrides?: Partial<ThemeConfig>): string => {
    const baseConfig = presetName ? themePresets[presetName] : defaultThemeConfig;
    const mergedConfig = { ...baseConfig, ...overrides };
    return btoa(JSON.stringify(mergedConfig));
  };

  return {
    activeTheme,
    isCustomTheme,
    generateThemeConfig,
    availablePresets: Object.keys(themePresets),
  };
}