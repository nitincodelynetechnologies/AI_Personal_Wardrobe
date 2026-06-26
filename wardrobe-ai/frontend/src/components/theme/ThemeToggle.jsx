'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className, showLabel = false, variant = 'default' }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && (resolvedTheme || theme) === 'dark';
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  if (!mounted) {
    if (variant === 'header') {
      return (
        <button
          type="button"
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-white/10',
            className,
          )}
          disabled
          aria-label="Toggle theme"
        >
          <Sun className="h-5 w-5 text-slate-400" />
        </button>
      );
    }

    return (
      <Button variant="outline" size={showLabel ? 'default' : 'icon'} className={className} disabled>
        <Sun className="h-4 w-4" />
        {showLabel ? <span className="ml-2">Theme</span> : null}
      </Button>
    );
  }

  if (variant === 'header') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-100 dark:border-white/10 dark:bg-[#1a1025] dark:text-slate-300 dark:shadow-none dark:hover:bg-white/5',
          className,
        )}
        aria-label={isDark ? 'Switch to Soft Ice Blue mode' : 'Switch to Deep Obsidian mode'}
      >
        {isDark ? (
          <Sun className="h-5 w-5 text-yellow-400" aria-hidden />
        ) : (
          <Moon className="h-5 w-5 text-indigo-600" aria-hidden />
        )}
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size={showLabel ? 'default' : 'icon'}
      className={cn(showLabel && 'justify-start gap-2', className)}
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to Soft Ice Blue mode' : 'Switch to Deep Obsidian mode'}
    >
      {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-violet" />}
      {showLabel ? <span>{isDark ? 'Soft Ice Blue' : 'Deep Obsidian'}</span> : null}
    </Button>
  );
}
