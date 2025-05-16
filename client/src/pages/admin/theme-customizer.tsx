import { useState, useEffect } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { useDynamicTheme } from "@/hooks/use-dynamic-theme";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ThemeConfig, themePresets } from "@shared/theme-config";
import { Copy, Download, Globe, Paintbrush, Palette, RefreshCw, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ThemeCustomizer() {
  const { generateThemeConfig, availablePresets } = useDynamicTheme();
  const [activePreset, setActivePreset] = useState<string>("default");
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(themePresets.gaming);
  const [encodedConfig, setEncodedConfig] = useState<string>("");
  const [launchUrl, setLaunchUrl] = useState<string>("");
  const { toast } = useToast();

  // Generate encoded config when preset or theme changes
  useEffect(() => {
    if (activePreset && activePreset !== "custom") {
      setThemeConfig(themePresets[activePreset as keyof typeof themePresets]);
    }
  }, [activePreset]);

  // Generate URL when theme config changes
  useEffect(() => {
    try {
      const encoded = btoa(JSON.stringify(themeConfig));
      setEncodedConfig(encoded);
      
      const origin = window.location.origin;
      setLaunchUrl(`${origin}/embedded-wallet?_hidden_brand_experience=${encoded}`);
    } catch (error) {
      console.error("Failed to encode theme config:", error);
    }
  }, [themeConfig]);

  // Generate URL for a preset without customization
  const generatePresetUrl = (presetName: string) => {
    const origin = window.location.origin;
    return `${origin}/embedded-wallet?_hidden_brand_experience=${presetName}`;
  };

  // Handle copying to clipboard
  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        description: message,
        duration: 3000,
      });
    }).catch(err => {
      console.error('Could not copy text: ', err);
      toast({
        title: "Failed to copy",
        description: "Please try again or copy manually",
        variant: "destructive",
      });
    });
  };

  // Handle preset selection
  const handlePresetChange = (preset: string) => {
    setActivePreset(preset);
  };

  // Handle color change
  const handleColorChange = (colorKey: string, value: string) => {
    setThemeConfig(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value
      }
    }));
  };

  // Handle brand setting change
  const handleBrandChange = (brandKey: string, value: string) => {
    setThemeConfig(prev => ({
      ...prev,
      brand: {
        ...prev.brand,
        [brandKey]: value
      }
    }));
  };

  // Handle typography change
  const handleTypographyChange = (typographyKey: string, value: string | number) => {
    setThemeConfig(prev => ({
      ...prev,
      typography: {
        ...prev.typography,
        [typographyKey]: value
      }
    }));
  };

  // Handle component setting change
  const handleComponentChange = (component: string, key: string, value: any) => {
    setThemeConfig(prev => ({
      ...prev,
      components: {
        ...prev.components,
        [component]: {
          ...prev.components[component as keyof typeof prev.components],
          [key]: value
        }
      }
    }));
  };

  // Handle effects change
  const handleEffectsChange = (effectKey: string, value: any) => {
    setThemeConfig(prev => ({
      ...prev,
      effects: {
        ...prev.effects,
        [effectKey]: value
      }
    }));
  };

  // Launch themed wallet in new tab
  const launchThemedWallet = () => {
    window.open(launchUrl, '_blank');
  };

  // Format a preset name for display
  const formatPresetName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <AdminLayout
      title="Theme Customizer"
      description="Create and manage custom wallet themes for partners"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="presets" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="presets">
                <Palette className="h-4 w-4 mr-2" />
                Preset Themes
              </TabsTrigger>
              <TabsTrigger value="customize">
                <Paintbrush className="h-4 w-4 mr-2" />
                Customize Theme
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="presets">
              <Card>
                <CardHeader>
                  <CardTitle>Ready-to-Use Preset Themes</CardTitle>
                  <CardDescription>Select a preset theme for different partner industries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availablePresets.map(preset => (
                      <Card 
                        key={preset} 
                        className={`overflow-hidden cursor-pointer transition-all hover:shadow-md ${activePreset === preset ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => handlePresetChange(preset)}
                      >
                        <div 
                          className="h-16 w-full" 
                          style={{ 
                            backgroundColor: themePresets[preset as keyof typeof themePresets].colors.primary,
                            background: themePresets[preset as keyof typeof themePresets].effects.useGradients 
                              ? `linear-gradient(to right, ${themePresets[preset as keyof typeof themePresets].colors.primary}, ${themePresets[preset as keyof typeof themePresets].colors.secondary})` 
                              : themePresets[preset as keyof typeof themePresets].colors.primary
                          }}
                        />
                        <CardContent className="pt-4">
                          <h3 className="font-semibold mb-1">{formatPresetName(preset)}</h3>
                          <p className="text-sm text-muted-foreground">
                            {themePresets[preset as keyof typeof themePresets].brand.tagline}
                          </p>
                        </CardContent>
                        <CardFooter className="border-t pt-3 flex justify-between">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(
                                generatePresetUrl(preset), 
                                "Preset URL copied. Share to launch with this theme."
                              );
                            }}
                          >
                            <Copy className="h-3.5 w-3.5 mr-1" />
                            Copy URL
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(generatePresetUrl(preset), '_blank');
                            }}
                          >
                            <Globe className="h-3.5 w-3.5 mr-1" />
                            Preview
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="customize">
              <Card>
                <CardHeader>
                  <CardTitle>Customize Theme</CardTitle>
                  <CardDescription>Fine-tune theme settings for partners</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="brand">
                    <TabsList className="mb-4">
                      <TabsTrigger value="brand">Brand</TabsTrigger>
                      <TabsTrigger value="colors">Colors</TabsTrigger>
                      <TabsTrigger value="typography">Typography</TabsTrigger>
                      <TabsTrigger value="components">Components</TabsTrigger>
                      <TabsTrigger value="effects">Effects</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="brand">
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="brand-name">Brand Name</Label>
                          <Input 
                            id="brand-name" 
                            value={themeConfig.brand.name} 
                            onChange={(e) => handleBrandChange('name', e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="brand-tagline">Tagline</Label>
                          <Input 
                            id="brand-tagline" 
                            value={themeConfig.brand.tagline} 
                            onChange={(e) => handleBrandChange('tagline', e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="brand-logo">Logo URL (optional)</Label>
                          <Input 
                            id="brand-logo" 
                            value={themeConfig.brand.logo || ''} 
                            onChange={(e) => handleBrandChange('logo', e.target.value)}
                            placeholder="https://example.com/logo.png"
                          />
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="colors">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Object.entries(themeConfig.colors).map(([key, value]) => (
                            <div key={key} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor={`color-${key}`} className="capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </Label>
                                <div 
                                  className="h-4 w-4 rounded-full border"
                                  style={{ backgroundColor: value }}
                                />
                              </div>
                              <div className="flex space-x-2">
                                <Input 
                                  id={`color-${key}`} 
                                  value={value} 
                                  onChange={(e) => handleColorChange(key, e.target.value)}
                                  className="flex-1"
                                />
                                <input 
                                  type="color" 
                                  value={value}
                                  onChange={(e) => handleColorChange(key, e.target.value)}
                                  className="h-10 w-10 p-0 border-0"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="typography">
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="font-family">Font Family</Label>
                          <Textarea 
                            id="font-family" 
                            value={themeConfig.typography.fontFamily} 
                            onChange={(e) => handleTypographyChange('fontFamily', e.target.value)}
                            rows={2}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="heading-font-family">Heading Font Family (optional)</Label>
                          <Textarea 
                            id="heading-font-family" 
                            value={themeConfig.typography.headingFontFamily || ''} 
                            onChange={(e) => handleTypographyChange('headingFontFamily', e.target.value)}
                            rows={2}
                            placeholder="If different from main font family"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="base-font-size">Base Font Size</Label>
                            <Input 
                              id="base-font-size" 
                              value={themeConfig.typography.baseFontSize} 
                              onChange={(e) => handleTypographyChange('baseFontSize', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="font-weight-normal">Normal Font Weight</Label>
                            <Input 
                              id="font-weight-normal" 
                              type="number"
                              value={themeConfig.typography.fontWeightNormal} 
                              onChange={(e) => handleTypographyChange('fontWeightNormal', parseInt(e.target.value))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="font-weight-bold">Bold Font Weight</Label>
                            <Input 
                              id="font-weight-bold" 
                              type="number"
                              value={themeConfig.typography.fontWeightBold} 
                              onChange={(e) => handleTypographyChange('fontWeightBold', parseInt(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="line-height">Line Height</Label>
                          <Input 
                            id="line-height" 
                            type="number"
                            step="0.1"
                            value={themeConfig.typography.lineHeight} 
                            onChange={(e) => handleTypographyChange('lineHeight', parseFloat(e.target.value))}
                          />
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="components">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-3">Buttons</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="button-radius">Border Radius</Label>
                              <Input 
                                id="button-radius" 
                                value={themeConfig.components.button.borderRadius} 
                                onChange={(e) => handleComponentChange('button', 'borderRadius', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="button-transform">Text Transform</Label>
                              <Select 
                                value={themeConfig.components.button.textTransform || 'none'}
                                onValueChange={(value) => handleComponentChange('button', 'textTransform', value)}
                              >
                                <SelectTrigger id="button-transform">
                                  <SelectValue placeholder="Select transform" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">None</SelectItem>
                                  <SelectItem value="uppercase">Uppercase</SelectItem>
                                  <SelectItem value="capitalize">Capitalize</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch 
                                id="button-gradient"
                                checked={themeConfig.components.button.primaryGradient || false}
                                onCheckedChange={(checked) => handleComponentChange('button', 'primaryGradient', checked)}
                              />
                              <Label htmlFor="button-gradient">Use Gradient for Primary</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch 
                                id="button-bold"
                                checked={themeConfig.components.button.boldText || false}
                                onCheckedChange={(checked) => handleComponentChange('button', 'boldText', checked)}
                              />
                              <Label htmlFor="button-bold">Bold Text</Label>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium mb-3">Cards</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="card-radius">Border Radius</Label>
                              <Input 
                                id="card-radius" 
                                value={themeConfig.components.card.borderRadius} 
                                onChange={(e) => handleComponentChange('card', 'borderRadius', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="card-padding">Padding</Label>
                              <Input 
                                id="card-padding" 
                                value={themeConfig.components.card.padding} 
                                onChange={(e) => handleComponentChange('card', 'padding', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="card-shadow">Box Shadow</Label>
                              <Input 
                                id="card-shadow" 
                                value={themeConfig.components.card.boxShadow} 
                                onChange={(e) => handleComponentChange('card', 'boxShadow', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium mb-3">Navigation</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="nav-style">Navigation Style</Label>
                              <Select 
                                value={themeConfig.components.navigation.style}
                                onValueChange={(value: 'sidebar' | 'topbar' | 'minimal') => handleComponentChange('navigation', 'style', value)}
                              >
                                <SelectTrigger id="nav-style">
                                  <SelectValue placeholder="Select style" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="sidebar">Sidebar</SelectItem>
                                  <SelectItem value="topbar">Top Bar</SelectItem>
                                  <SelectItem value="minimal">Minimal</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="effects">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex items-center space-x-2">
                            <Switch 
                              id="use-gradients"
                              checked={themeConfig.effects.useGradients}
                              onCheckedChange={(checked) => handleEffectsChange('useGradients', checked)}
                            />
                            <Label htmlFor="use-gradients">Use Gradients</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch 
                              id="use-shadows"
                              checked={themeConfig.effects.useShadows}
                              onCheckedChange={(checked) => handleEffectsChange('useShadows', checked)}
                            />
                            <Label htmlFor="use-shadows">Use Shadows</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch 
                              id="rounded-corners"
                              checked={themeConfig.effects.roundedCorners}
                              onCheckedChange={(checked) => handleEffectsChange('roundedCorners', checked)}
                            />
                            <Label htmlFor="rounded-corners">Rounded Corners</Label>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="animation-speed">Animation Speed</Label>
                            <Select 
                              value={themeConfig.effects.animationSpeed}
                              onValueChange={(value: 'fast' | 'normal' | 'slow') => handleEffectsChange('animationSpeed', value)}
                            >
                              <SelectTrigger id="animation-speed">
                                <SelectValue placeholder="Select speed" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="fast">Fast</SelectItem>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="slow">Slow</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Theme Preview</CardTitle>
              <CardDescription>Test and share your custom theme</CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className="h-32 w-full mb-4 rounded"
                style={{ 
                  backgroundColor: themeConfig.colors.primary,
                  background: themeConfig.effects.useGradients 
                    ? `linear-gradient(to right, ${themeConfig.colors.primary}, ${themeConfig.colors.secondary})` 
                    : themeConfig.colors.primary
                }}
              />
              
              <div className="mb-6">
                <h4 className="font-semibold mb-1">Brand Preview</h4>
                <p
                  className="text-lg font-bold mb-1"
                  style={{ 
                    fontFamily: themeConfig.typography.headingFontFamily || themeConfig.typography.fontFamily,
                    color: themeConfig.colors.text
                  }}
                >
                  {themeConfig.brand.name}
                </p>
                <p
                  className="text-sm"
                  style={{ 
                    fontFamily: themeConfig.typography.fontFamily,
                    color: themeConfig.colors.textSecondary
                  }}
                >
                  {themeConfig.brand.tagline}
                </p>
              </div>
              
              <div className="mb-6">
                <h4 className="font-semibold mb-2">UI Elements</h4>
                <div className="flex flex-wrap gap-2 mb-2">
                  <button
                    className="px-4 py-2 text-white rounded"
                    style={{ 
                      backgroundColor: themeConfig.colors.primary,
                      borderRadius: themeConfig.components.button.borderRadius,
                      fontWeight: themeConfig.components.button.boldText ? 'bold' : 'normal',
                      textTransform: themeConfig.components.button.textTransform as any || 'none',
                      background: themeConfig.components.button.primaryGradient
                        ? `linear-gradient(to right, ${themeConfig.colors.primary}, ${themeConfig.colors.secondary})`
                        : themeConfig.colors.primary
                    }}
                  >
                    Primary Button
                  </button>
                  <button
                    className="px-4 py-2 rounded border"
                    style={{ 
                      color: themeConfig.colors.primary,
                      borderColor: themeConfig.colors.border,
                      borderRadius: themeConfig.components.button.borderRadius,
                      fontWeight: themeConfig.components.button.boldText ? 'bold' : 'normal',
                      textTransform: themeConfig.components.button.textTransform as any || 'none'
                    }}
                  >
                    Secondary
                  </button>
                </div>
                
                <div 
                  className="p-3 rounded mb-2"
                  style={{ 
                    backgroundColor: themeConfig.colors.cardBackground,
                    borderRadius: themeConfig.components.card.borderRadius,
                    boxShadow: themeConfig.effects.useShadows ? themeConfig.components.card.boxShadow : 'none'
                  }}
                >
                  <p style={{ color: themeConfig.colors.text }}>Card Example</p>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <div
                      className="h-2 w-20 mb-1"
                      style={{ backgroundColor: themeConfig.colors.textSecondary, opacity: 0.5 }}
                    />
                    <input
                      type="text"
                      className="px-3 py-2 w-full border rounded"
                      placeholder="Input field"
                      style={{ 
                        backgroundColor: themeConfig.components.input.backgroundColor,
                        borderColor: themeConfig.components.input.borderColor,
                        borderRadius: themeConfig.components.input.borderRadius,
                        color: themeConfig.colors.text
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Base64 Config</Label>
                  <div className="mt-1 relative">
                    <Textarea 
                      value={encodedConfig} 
                      readOnly 
                      rows={3}
                      className="pr-10 text-xs font-mono"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute right-2 top-2"
                      onClick={() => copyToClipboard(encodedConfig, "Theme configuration copied to clipboard")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm text-muted-foreground">Share URL</Label>
                  <div className="mt-1 relative">
                    <Input 
                      value={launchUrl} 
                      readOnly 
                      className="pr-10"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute right-2 top-2"
                      onClick={() => copyToClipboard(launchUrl, "Launch URL copied to clipboard")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <Button 
                  className="w-full"
                  onClick={launchThemedWallet}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Launch Themed Wallet
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}