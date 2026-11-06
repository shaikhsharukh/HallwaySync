import { useState, useEffect, useCallback } from 'react';
import type { Theme, ResolvedTheme, UseThemeReturn } from './theme-types';

export type { Theme, ResolvedTheme, UseThemeReturn } from './theme-types';

const STORAGE_KEY = 'theme';

export function getStoredTheme(): Theme {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return 'system';
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'system' || stored === 'light' || stored === 'dark') {
      return stored;
    }
    return 'system';
  } catch {
    return 'system';
  }
}

export function setStoredTheme(theme: Theme): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Gracefully handle storage exceptions (e.g. sandbox, quota)
  }
}

export function getSystemPrefersDark(): boolean {
  try {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
}

export function resolveEffectiveTheme(theme: Theme, systemPrefersDark: boolean): ResolvedTheme {
  if (theme === 'dark') return 'dark';
  if (theme === 'light') return 'light';
  return systemPrefersDark ? 'dark' : 'light';
}

export function applyThemeToDOM(resolved: ResolvedTheme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(getSystemPrefersDark);

  // Sync with OS preference when theme is 'system'
  useEffect(() => {
    if (theme !== 'system') return;
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemPrefersDark(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent | { matches: boolean }) => {
      setSystemPrefersDark(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [theme]);

  const resolvedTheme = resolveEffectiveTheme(theme, systemPrefersDark);

  useEffect(() => {
    applyThemeToDOM(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    const validTheme: Theme = newTheme === 'light' || newTheme === 'dark' ? newTheme : 'system';
    setThemeState(validTheme);
    setStoredTheme(validTheme);
  }, []);

  const cycleTheme = useCallback(() => {
    setThemeState((currentTheme) => {
      let nextTheme: Theme;
      if (currentTheme === 'system') {
        nextTheme = 'light';
      } else if (currentTheme === 'light') {
        nextTheme = 'dark';
      } else {
        nextTheme = 'system';
      }
      setStoredTheme(nextTheme);
      return nextTheme;
    });
  }, []);

  return {
    theme,
    resolvedTheme,
    setTheme,
    cycleTheme,
  };
}
