import React from 'react';
import { SunMoon, Sun, Moon } from 'lucide-react';
import { useTheme } from '../features/theme/useTheme';
import { cn } from '../lib/utils';

export interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { theme, resolvedTheme, cycleTheme } = useTheme();

  const title =
    theme === 'system'
      ? 'Theme: System (Auto)'
      : theme === 'light'
      ? 'Theme: Light'
      : 'Theme: Dark';

  const ariaLabel = `Toggle theme. Currently ${theme} (rendered as ${resolvedTheme})`;

  return (
    <button
      type="button"
      onClick={cycleTheme}
      title={title}
      aria-label={ariaLabel}
      className={cn(
        'min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-2.5 bg-surface-card border border-surface-border text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl shadow-sm transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
        className
      )}
    >
      {theme === 'light' ? (
        <Sun className="w-5 h-5" aria-hidden="true" />
      ) : theme === 'dark' ? (
        <Moon className="w-5 h-5" aria-hidden="true" />
      ) : (
        <SunMoon className="w-5 h-5" aria-hidden="true" />
      )}
    </button>
  );
};

export default ThemeToggle;
