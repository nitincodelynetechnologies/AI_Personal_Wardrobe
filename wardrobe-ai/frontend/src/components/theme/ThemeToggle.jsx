'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className, showLabel = false }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size={showLabel ? 'default' : 'icon'} className={className} disabled>
        <Sun className="h-4 w-4" />
        {showLabel ? <span className="ml-2">Theme</span> : null}
      </Button>
    );
  }

  const isDark = (resolvedTheme || theme) === 'dark';

  return (
    <Button
      type="button"
      variant="outline"
      size={showLabel ? 'default' : 'icon'}
      className={cn(showLabel && 'justify-start gap-2', className)}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {showLabel ? <span>{isDark ? 'Light mode' : 'Dark mode'}</span> : null}
    </Button>
  );
}
