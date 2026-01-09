// Theme Context - Manages app theme and styling

import React, { createContext, useState, useContext } from 'react';

// Color palette matching web frontend
export const colors = {
    primary: '#1d4ed8',
    primaryLight: '#3b82f6',
    primaryDark: '#1e40af',
    secondary: '#ff6600',
    secondaryLight: '#ff8533',

    success: '#10b981',
    successLight: '#34d399',
    successBg: '#d1fae5',

    warning: '#f59e0b',
    warningLight: '#fbbf24',
    warningBg: '#fef3c7',

    danger: '#ef4444',
    dangerLight: '#f87171',
    dangerBg: '#fee2e2',
    error: '#ef4444', // Alias for danger

    info: '#3b82f6',
    infoLight: '#60a5fa',
    infoBg: '#dbeafe',

    white: '#ffffff',
    black: '#000000',

    gray50: '#f9fafb',
    gray100: '#f3f4f6',
    gray200: '#e5e7eb',
    gray300: '#d1d5db',
    gray400: '#9ca3af',
    gray500: '#6b7280',
    gray600: '#4b5563',
    gray700: '#374151',
    gray800: '#1f2937',
    gray900: '#111827',

    background: '#f5f7fa',
    backgroundAlt: '#eef3fc',
    card: '#ffffff',
    border: '#e5e7eb',

    text: '#111827',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',

    // Status colors for lead/inquiry
    statusNew: '#3b82f6',
    statusInReview: '#f59e0b',
    statusConverted: '#10b981',
    statusNotInterested: '#ef4444',
};

// Spacing scale
export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

// Font sizes
export const fontSizes = {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    h3: 24,
    h2: 28,
    h1: 32,
};

// Border radius
export const borderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
};

// Shadow styles
export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
};

// Theme object
export const lightTheme = {
    colors,
    spacing,
    fontSizes,
    borderRadius,
    shadows,
};

// Create context
const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(lightTheme);
    const [isDark, setIsDark] = useState(false);

    // Toggle theme (for future dark mode support)
    const toggleTheme = () => {
        setIsDark(!isDark);
        // Implement dark theme colors here when needed
    };

    const value = {
        theme,
        isDark,
        toggleTheme,
        colors: theme.colors,
        spacing: theme.spacing,
        fontSizes: theme.fontSizes,
        borderRadius: theme.borderRadius,
        shadows: theme.shadows,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

// Custom hook to use theme context
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeContext;
