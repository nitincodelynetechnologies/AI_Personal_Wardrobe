import {
  LayoutDashboard,
  Shirt,
  Sparkles,
  Settings,
} from 'lucide-react';

export const APP_NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', shortLabel: 'Home', icon: LayoutDashboard, exact: true },
  { href: '/wardrobe', label: 'Wardrobe', shortLabel: 'Wardrobe', icon: Shirt },
  { href: '/outfits', label: 'Style Studio', shortLabel: 'Studio', icon: Sparkles },
  { href: '/settings', label: 'Settings', shortLabel: 'Settings', icon: Settings },
];

export function isNavItemActive(pathname, item) {
  if (item.exact) {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
