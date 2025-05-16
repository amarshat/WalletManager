/**
 * Theme configuration interface for dynamic wallet styling
 */
export interface ThemeConfig {
  // Brand appearance
  brand: {
    name: string;
    tagline: string;
    logo?: string; // URL or base64 image
  };
  
  // Color scheme
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    cardBackground: string;
    text: string;
    textSecondary: string;
    success: string;
    warning: string;
    error: string;
    highlight: string;
    border: string;
  };
  
  // Typography
  typography: {
    fontFamily: string;
    headingFontFamily?: string;
    baseFontSize: string;
    fontWeightNormal: number;
    fontWeightBold: number;
    lineHeight: number;
  };
  
  // Component styles
  components: {
    // Button styles
    button: {
      borderRadius: string;
      primaryGradient?: boolean;
      textTransform?: 'none' | 'uppercase' | 'capitalize';
      boldText?: boolean;
    };
    
    // Card styles
    card: {
      borderRadius: string;
      boxShadow: string;
      padding: string;
    };
    
    // Input styles
    input: {
      borderRadius: string;
      backgroundColor: string;
      borderColor: string;
      focusBorderColor: string;
    };
    
    // Navigation
    navigation: {
      style: 'sidebar' | 'topbar' | 'minimal';
      backgroundColor: string;
      activeItemColor: string;
      itemColor: string;
    };
  };
  
  // Layout configuration
  layout: {
    contentMaxWidth: string;
    sidePadding: string;
    borderRadius: string;
    compactMode?: boolean;
  };
  
  // Visual effects
  effects: {
    useGradients: boolean;
    useShadows: boolean;
    animationSpeed: 'fast' | 'normal' | 'slow';
    roundedCorners: boolean;
  };
}

/**
 * Default wallet theme configuration
 */
export const defaultThemeConfig: ThemeConfig = {
  brand: {
    name: "PaySage Wallet",
    tagline: "Smart financial management for everyone",
  },
  colors: {
    primary: "#4f46e5",
    secondary: "#0ea5e9",
    accent: "#8b5cf6",
    background: "#f9fafb",
    cardBackground: "#ffffff",
    text: "#111827",
    textSecondary: "#6b7280",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    highlight: "#f3f4f6",
    border: "#e5e7eb",
  },
  typography: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
    baseFontSize: "16px",
    fontWeightNormal: 400,
    fontWeightBold: 600,
    lineHeight: 1.5,
  },
  components: {
    button: {
      borderRadius: "0.375rem",
      primaryGradient: false,
      textTransform: "none",
      boldText: true,
    },
    card: {
      borderRadius: "0.5rem",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      padding: "1.5rem",
    },
    input: {
      borderRadius: "0.375rem",
      backgroundColor: "#ffffff",
      borderColor: "#d1d5db",
      focusBorderColor: "#4f46e5",
    },
    navigation: {
      style: "sidebar",
      backgroundColor: "#ffffff",
      activeItemColor: "#4f46e5",
      itemColor: "#4b5563",
    },
  },
  layout: {
    contentMaxWidth: "1200px",
    sidePadding: "1rem",
    borderRadius: "0.5rem",
    compactMode: false,
  },
  effects: {
    useGradients: false,
    useShadows: true,
    animationSpeed: "normal",
    roundedCorners: true,
  },
};

/**
 * Industry-specific theme presets
 */
export const themePresets: Record<string, ThemeConfig> = {
  // Gaming theme preset
  gaming: {
    brand: {
      name: "GameVault",
      tagline: "Level up your gaming finances",
    },
    colors: {
      primary: "#6d28d9", // Deep purple
      secondary: "#2563eb", // Royal blue
      accent: "#db2777", // Pink
      background: "#0f172a", // Very dark blue
      cardBackground: "#1e293b", // Dark blue/grey
      text: "#f8fafc", // Very light grey
      textSecondary: "#94a3b8", // Light blue/grey
      success: "#059669", // Green
      warning: "#d97706", // Amber
      error: "#dc2626", // Red
      highlight: "#334155", // Dark blue/grey highlight
      border: "#475569", // Blue/grey
    },
    typography: {
      fontFamily: "'Rajdhani', 'Play', sans-serif",
      headingFontFamily: "'Rajdhani', sans-serif",
      baseFontSize: "16px",
      fontWeightNormal: 400,
      fontWeightBold: 700,
      lineHeight: 1.6,
    },
    components: {
      button: {
        borderRadius: "0.25rem",
        primaryGradient: true,
        textTransform: "uppercase",
        boldText: true,
      },
      card: {
        borderRadius: "0.5rem",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
        padding: "1.25rem",
      },
      input: {
        borderRadius: "0.25rem",
        backgroundColor: "#0f172a",
        borderColor: "#475569",
        focusBorderColor: "#8b5cf6",
      },
      navigation: {
        style: "sidebar",
        backgroundColor: "#0f172a",
        activeItemColor: "#8b5cf6",
        itemColor: "#94a3b8",
      },
    },
    layout: {
      contentMaxWidth: "1200px",
      sidePadding: "1rem",
      borderRadius: "0.25rem",
      compactMode: false,
    },
    effects: {
      useGradients: true,
      useShadows: true,
      animationSpeed: "fast",
      roundedCorners: true,
    },
  },
  
  // Charity/Religious theme preset
  charity: {
    brand: {
      name: "GraceGive",
      tagline: "Supporting missions with transparent giving",
    },
    colors: {
      primary: "#4b6e90", // Muted blue
      secondary: "#80a4c9", // Lighter blue
      accent: "#c99d80", // Soft gold
      background: "#f8f9fa", // Off white
      cardBackground: "#ffffff", // White
      text: "#353535", // Near black
      textSecondary: "#6c757d", // Medium grey
      success: "#6a994e", // Muted green
      warning: "#bc6c25", // Muted orange
      error: "#9a031e", // Muted red
      highlight: "#f1f3f5", // Very light grey
      border: "#dee2e6", // Light grey
    },
    typography: {
      fontFamily: "'Noto Serif', 'Merriweather', serif",
      headingFontFamily: "'Noto Serif', serif",
      baseFontSize: "16px",
      fontWeightNormal: 400,
      fontWeightBold: 600,
      lineHeight: 1.7,
    },
    components: {
      button: {
        borderRadius: "0.375rem",
        primaryGradient: false,
        textTransform: "none",
        boldText: false,
      },
      card: {
        borderRadius: "0.5rem",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        padding: "1.5rem",
      },
      input: {
        borderRadius: "0.375rem",
        backgroundColor: "#ffffff",
        borderColor: "#dee2e6",
        focusBorderColor: "#4b6e90",
      },
      navigation: {
        style: "sidebar",
        backgroundColor: "#ffffff",
        activeItemColor: "#4b6e90",
        itemColor: "#6c757d",
      },
    },
    layout: {
      contentMaxWidth: "1100px",
      sidePadding: "1.25rem",
      borderRadius: "0.5rem",
      compactMode: false,
    },
    effects: {
      useGradients: false,
      useShadows: true,
      animationSpeed: "normal",
      roundedCorners: true,
    },
  },
  
  // Parking/Transportation theme preset
  parking: {
    brand: {
      name: "ParkPay",
      tagline: "Seamless parking payments",
    },
    colors: {
      primary: "#0369a1", // Blue
      secondary: "#0284c7", // Lighter blue
      accent: "#14b8a6", // Teal
      background: "#f0f9ff", // Very light blue
      cardBackground: "#ffffff", // White
      text: "#0f172a", // Very dark blue
      textSecondary: "#64748b", // Grey blue
      success: "#059669", // Green
      warning: "#d97706", // Amber
      error: "#dc2626", // Red
      highlight: "#e0f2fe", // Light blue
      border: "#bae6fd", // Lighter blue
    },
    typography: {
      fontFamily: "'Inter', 'Roboto', sans-serif",
      baseFontSize: "16px",
      fontWeightNormal: 400,
      fontWeightBold: 600,
      lineHeight: 1.5,
    },
    components: {
      button: {
        borderRadius: "8px",
        primaryGradient: false,
        textTransform: "none",
        boldText: true,
      },
      card: {
        borderRadius: "12px",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.1)",
        padding: "1.5rem",
      },
      input: {
        borderRadius: "8px",
        backgroundColor: "#f8fafc",
        borderColor: "#bae6fd",
        focusBorderColor: "#0284c7",
      },
      navigation: {
        style: "topbar",
        backgroundColor: "#ffffff",
        activeItemColor: "#0284c7",
        itemColor: "#64748b",
      },
    },
    layout: {
      contentMaxWidth: "1200px",
      sidePadding: "1rem",
      borderRadius: "12px",
      compactMode: true,
    },
    effects: {
      useGradients: false,
      useShadows: true,
      animationSpeed: "normal",
      roundedCorners: true,
    },
  },
  
  // Gambling/Betting theme preset
  gambling: {
    brand: {
      name: "BetVault",
      tagline: "Secure funds for betting enthusiasts",
    },
    colors: {
      primary: "#18181b", // Almost black
      secondary: "#a855f7", // Purple
      accent: "#f97316", // Orange
      background: "#18181b", // Almost black
      cardBackground: "#27272a", // Dark grey
      text: "#f4f4f5", // Very light grey
      textSecondary: "#a1a1aa", // Medium grey
      success: "#22c55e", // Green
      warning: "#eab308", // Yellow
      error: "#ef4444", // Red
      highlight: "#3f3f46", // Medium dark grey
      border: "#52525b", // Grey
    },
    typography: {
      fontFamily: "'Montserrat', 'Roboto', sans-serif",
      headingFontFamily: "'Montserrat', sans-serif",
      baseFontSize: "16px",
      fontWeightNormal: 400,
      fontWeightBold: 700,
      lineHeight: 1.5,
    },
    components: {
      button: {
        borderRadius: "0.25rem",
        primaryGradient: true,
        textTransform: "uppercase",
        boldText: true,
      },
      card: {
        borderRadius: "0.5rem",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)",
        padding: "1.25rem",
      },
      input: {
        borderRadius: "0.25rem",
        backgroundColor: "#3f3f46",
        borderColor: "#52525b",
        focusBorderColor: "#a855f7",
      },
      navigation: {
        style: "minimal",
        backgroundColor: "#18181b",
        activeItemColor: "#a855f7",
        itemColor: "#a1a1aa",
      },
    },
    layout: {
      contentMaxWidth: "1200px",
      sidePadding: "1rem",
      borderRadius: "0.5rem",
      compactMode: true,
    },
    effects: {
      useGradients: true,
      useShadows: true,
      animationSpeed: "fast",
      roundedCorners: false,
    },
  },
};

/**
 * Converts a theme config to CSS variables
 */
export function themeConfigToCssVariables(config: ThemeConfig): Record<string, string> {
  return {
    // Colors
    '--color-primary': config.colors.primary,
    '--color-secondary': config.colors.secondary,
    '--color-accent': config.colors.accent,
    '--color-background': config.colors.background,
    '--color-card': config.colors.cardBackground,
    '--color-text': config.colors.text,
    '--color-text-secondary': config.colors.textSecondary,
    '--color-success': config.colors.success,
    '--color-warning': config.colors.warning,
    '--color-error': config.colors.error,
    '--color-highlight': config.colors.highlight,
    '--color-border': config.colors.border,
    
    // Typography
    '--font-family': config.typography.fontFamily,
    '--heading-font-family': config.typography.headingFontFamily || config.typography.fontFamily,
    '--font-size-base': config.typography.baseFontSize,
    '--font-weight-normal': config.typography.fontWeightNormal.toString(),
    '--font-weight-bold': config.typography.fontWeightBold.toString(),
    '--line-height': config.typography.lineHeight.toString(),
    
    // Components
    '--button-radius': config.components.button.borderRadius,
    '--button-transform': config.components.button.textTransform || 'none',
    '--button-font-weight': config.components.button.boldText ? 'var(--font-weight-bold)' : 'var(--font-weight-normal)',
    
    '--card-radius': config.components.card.borderRadius,
    '--card-shadow': config.components.card.boxShadow,
    '--card-padding': config.components.card.padding,
    
    '--input-radius': config.components.input.borderRadius,
    '--input-bg': config.components.input.backgroundColor,
    '--input-border': config.components.input.borderColor,
    '--input-focus-border': config.components.input.focusBorderColor,
    
    '--nav-bg': config.components.navigation.backgroundColor,
    '--nav-active': config.components.navigation.activeItemColor,
    '--nav-item': config.components.navigation.itemColor,
    
    // Layout
    '--content-max-width': config.layout.contentMaxWidth,
    '--side-padding': config.layout.sidePadding,
    '--border-radius': config.layout.borderRadius,
    '--layout-spacing': config.layout.compactMode ? '0.75rem' : '1.25rem',
    
    // Effects
    '--use-gradients': config.effects.useGradients ? '1' : '0',
    '--use-shadows': config.effects.useShadows ? '1' : '0',
    '--animation-speed': config.effects.animationSpeed === 'fast' ? '150ms' : 
                        config.effects.animationSpeed === 'slow' ? '400ms' : '250ms',
    '--border-radius-base': config.effects.roundedCorners ? config.layout.borderRadius : '0',
  };
}