import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface Settings {
  notifications: boolean;
  emailAlerts: boolean;
  autoAssign: boolean;
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  settings: Settings;
  updateSettings: (newSettings: Settings) => void;
}

const defaultSettings: Settings = {
  notifications: true,
  emailAlerts: true,
  autoAssign: true
};

// Check if the Admin wrapper context exists
let AdminThemeContext: React.Context<{theme: Theme}> | null = null;
try {
  // Dynamic import to prevent circular dependency errors
  const adminContext = require('../../admin/src/components/wrappers/FrontendComponentWrapper');
  if (adminContext && adminContext.AdminThemeContext) {
    AdminThemeContext = adminContext.AdminThemeContext;
  }
} catch (e) {
  // No admin context available, continue with standard context
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as Theme) || 'light';
  });

  const [settings, setSettings] = useState<Settings>(() => {
    const savedSettings = localStorage.getItem('settings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, settings, updateSettings }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  // First try to use the Admin Theme Context if it exists
  if (AdminThemeContext) {
    try {
      const adminTheme = useContext(AdminThemeContext);
      if (adminTheme) {
        // Return a compatible interface with the expected ThemeContextType
        return {
          theme: adminTheme.theme,
          toggleTheme: () => {}, // No-op function
          settings: defaultSettings,
          updateSettings: () => {} // No-op function
        };
      }
    } catch (e) {
      // Failed to use admin context, fall back to standard context
    }
  }

  // Fall back to the standard Theme Context
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};