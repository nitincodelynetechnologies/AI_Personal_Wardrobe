import {
  Heart,
  LayoutDashboard,
  ScanFace,
  Settings,
  Shirt,
  ShoppingBag,
  Sparkles,
  Store,
} from 'lucide-react';

/** @typedef {'dashboard'|'catalog'|'wardrobe'|'closet'|'style-profile'|'wishlist'|'cart'|'outfits'|'settings'} NavItemId */

/**
 * @typedef {Object} AppNavItem
 * @property {NavItemId} id
 * @property {string} label
 * @property {string} shortLabel
 * @property {import('lucide-react').LucideIcon} icon
 * @property {string} [iconClass]
 * @property {string} [href]
 * @property {'wishlist'|'cart'} [action]
 * @property {boolean} [exact]
 * @property {boolean} [showInBottomNav]
 */

/** @type {AppNavItem[]} */
export const APP_NAV_ITEMS = [
  {
    id: 'dashboard',
    href: '/dashboard',
    label: 'Dashboard',
    shortLabel: 'Home',
    icon: LayoutDashboard,
    exact: true,
    showInBottomNav: true,
  },
  {
    id: 'catalog',
    href: '/catalog',
    label: 'Catalog',
    shortLabel: 'Catalog',
    icon: Store,
    showInBottomNav: true,
  },
  {
    id: 'outfits',
    href: '/outfits',
    label: 'Style Studio',
    shortLabel: 'Studio',
    icon: Sparkles,
    showInBottomNav: true,
  },
  {
    id: 'wardrobe',
    href: '/wardrobe',
    label: 'Wardrobe',
    shortLabel: 'Wardrobe',
    icon: Shirt,
    showInBottomNav: false,
  },
  {
    id: 'closet',
    href: '/closet',
    label: 'Personal Closet',
    shortLabel: 'Closet',
    icon: Sparkles,
    showInBottomNav: true,
  },
  {
    id: 'style-profile',
    href: '/face-studio',
    label: 'Style Profile',
    shortLabel: 'Profile',
    icon: ScanFace,
    showInBottomNav: false,
  },
  {
    id: 'wishlist',
    action: 'wishlist',
    label: 'Wishlist',
    shortLabel: 'Saved',
    icon: Heart,
    showInBottomNav: false,
  },
  {
    id: 'cart',
    action: 'cart',
    label: 'Cart',
    shortLabel: 'Cart',
    icon: ShoppingBag,
    showInBottomNav: true,
  },
  {
    id: 'settings',
    href: '/settings',
    label: 'Settings',
    shortLabel: 'Settings',
    icon: Settings,
    showInBottomNav: false,
  },
];

export const SIDEBAR_NAV_ITEMS = APP_NAV_ITEMS;

export const BOTTOM_NAV_ITEMS = APP_NAV_ITEMS.filter((item) => item.showInBottomNav);

export function isNavItemActive(pathname, item) {
  if (!item.href) return false;

  if (item.exact) {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function getNavItemActiveState(pathname, item, { cartOpen = false, wishlistOpen = false } = {}) {
  if (item.action === 'cart') return cartOpen;
  if (item.action === 'wishlist') return wishlistOpen;
  return isNavItemActive(pathname, item);
}
