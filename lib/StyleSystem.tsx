import React, { createContext, useContext, useState, useEffect } from 'react';

// Definitions for the Style Command System
export type DensityMode = 'executive' | 'operational';
export type SurfaceReliability = 'flat' | 'elevated' | 'bordered';
export type SignalIntensity = 'standard' | 'high-contrast';
export type PanelHierarchy = 'balanced' | 'focused';
export type SidebarWeight = 'light' | 'normal' | 'bold';
export type SidebarSize = 'compact' | 'normal' | 'large';

export type ThemeMode = 'light' | 'dark' | 'system';

interface StyleConfig {
    density: DensityMode;
    surface: SurfaceReliability;
    signal: SignalIntensity;
    hierarchy: PanelHierarchy;
    theme: ThemeMode;

    // Granular Controls
    sidebarOptimized: boolean; 
    sidebarWeight: SidebarWeight;
    sidebarSize: SidebarSize;
    kpiEmphasis: 'value' | 'label';
    verticalRhythm: 'tight' | 'relaxed';

    // SIDEBAR PRECISION ALIGNMENT
    sidebarLogoPadding: number; 
    sidebarItemPadding: number; 
    sidebarCollapsedWidth: number;
    sidebarCollapsedLogoOffset: number; // New: Specific offset for the 'M' logo when collapsed // Width when collapsed (e.g. 64)

    // Light Mode Fine-Tuning Tokens
    kpiBgLight: string;
    kpiBorderLight: string;
    kpiShadowLight: string;
    kpiLabelColorLight: string;
    kpiValueColorLight: string;
}

const defaultStyle: StyleConfig = {
    density: 'executive',
    surface: 'bordered',
    signal: 'standard',
    hierarchy: 'balanced',
    theme: 'light',
    sidebarOptimized: false,
    sidebarWeight: 'normal',
    sidebarSize: 'normal',
    kpiEmphasis: 'label',
    verticalRhythm: 'relaxed',

    // Golden State Baselines
    sidebarLogoPadding: 24,
    sidebarItemPadding: 24,
    sidebarCollapsedWidth: 64,
    sidebarCollapsedLogoOffset: 10,

    kpiBgLight: '#51A2A8',
    kpiBorderLight: 'rgba(255, 255, 255, 0.1)',
    kpiShadowLight: '0 8px 30px -10px rgba(44, 62, 80, 0.12), 0 0 1px rgba(44, 62, 80, 0.1)',
    kpiLabelColorLight: 'rgba(255, 255, 255, 0.9)',
    kpiValueColorLight: '#ffffff',
};

interface StyleContextType {
    config: StyleConfig;
    updateConfig: (updates: Partial<StyleConfig>) => void;
    resetToBaseline: () => void;
}

const StyleContext = createContext<StyleContextType | undefined>(undefined);

export const StyleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [config, setConfig] = useState<StyleConfig>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('mce-style-config');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    return { ...defaultStyle, ...parsed };
                } catch (e) {
                    console.error("Failed to parse mce-style-config from localStorage", e);
                    return defaultStyle;
                }
            }
            return defaultStyle;
        }
        return defaultStyle;
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('mce-style-config', JSON.stringify(config));
        }
    }, [config]);

    const updateConfig = (updates: Partial<StyleConfig>) => {
        setConfig(prev => {
            const newConfig = { ...prev, ...updates };
            if (updates.theme && typeof window !== 'undefined') {
                applyTheme(newConfig.theme);
            }
            return newConfig;
        });
    };

    const applyTheme = (themeMode: ThemeMode) => {
        if (typeof window === 'undefined') return;
        const root = document.documentElement;
        if (themeMode === 'system') {
            root.dataset.theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        } else {
            root.dataset.theme = themeMode;
        }
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;
        applyTheme(config.theme);
    }, [config.theme]);

    useEffect(() => {
        const root = document.documentElement;

        // 1. Spacing / Density
        if (config.density === 'operational') {
            root.style.setProperty('--space-unit', '0.75rem');
            root.style.setProperty('--font-scale', '0.9');
        } else {
            root.style.setProperty('--space-unit', '1rem');
            root.style.setProperty('--font-scale', '1');
        }

        // 2. Sidebar Alignment
        root.style.setProperty('--sidebar-logo-pl', `${config.sidebarLogoPadding}px`);
        root.style.setProperty('--sidebar-item-pl', `${config.sidebarItemPadding}px`);
        root.style.setProperty('--sidebar-collapsed-width', `${config.sidebarCollapsedWidth}px`);
        root.style.setProperty('--sidebar-collapsed-logo-pl', `${config.sidebarCollapsedLogoOffset}px`);

        // 3. Typography
        if (config.sidebarWeight === 'light') {
            root.style.setProperty('--sidebar-weight', '300');
        } else if (config.sidebarWeight === 'normal') {
            root.style.setProperty('--sidebar-weight', '400');
        } else {
            root.style.setProperty('--sidebar-weight', '500');
        }

        if (config.sidebarSize === 'compact') {
            root.style.setProperty('--sidebar-text-size', '0.75rem');
        } else if (config.sidebarSize === 'normal') {
            root.style.setProperty('--sidebar-text-size', '0.8125rem');
        } else {
            root.style.setProperty('--sidebar-text-size', '0.875rem');
        }
    }, [config]);

    const resetToBaseline = () => {
        setConfig(defaultStyle);
    };

    return (
        <StyleContext.Provider value={{ config, updateConfig, resetToBaseline }}>
            {children}
        </StyleContext.Provider>
    );
};

export const useStyleSystem = () => {
    const context = useContext(StyleContext);
    if (!context) {
        throw new Error('useStyleSystem must be used within a StyleProvider');
    }
    return context;
};