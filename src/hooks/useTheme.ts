import { useCallback, useEffect, useState } from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'theme';
const THEME_COLORS = { light: '#F5F5F4', dark: '#0C0A09' };

function loadPreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // Ignore localStorage errors
  }
  return 'system';
}

/** Light / dark / follow the system. The resolved theme is set as data-theme on <html>. */
export function useTheme(): { theme: ThemePreference; setTheme: (theme: ThemePreference) => void } {
  const [theme, setThemeState] = useState<ThemePreference>(loadPreference);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const resolved = theme === 'system' ? (media.matches ? 'dark' : 'light') : theme;
      document.documentElement.dataset.theme = resolved;
      document.querySelectorAll('meta[name="theme-color"]').forEach(meta => {
        if (theme === 'system') {
          const isDarkMeta = meta.getAttribute('media')?.includes('dark');
          meta.setAttribute('content', isDarkMeta ? THEME_COLORS.dark : THEME_COLORS.light);
        } else {
          meta.setAttribute('content', THEME_COLORS[resolved]);
        }
      });
    };
    apply();
    if (theme !== 'system') return;
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme]);

  const setTheme = useCallback((next: ThemePreference) => {
    setThemeState(next);
    try {
      if (next === 'system') localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  return { theme, setTheme };
}
