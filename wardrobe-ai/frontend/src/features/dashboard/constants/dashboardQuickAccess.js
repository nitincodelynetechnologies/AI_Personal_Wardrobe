import { Bookmark, MessageCircle, Shirt, Warehouse } from 'lucide-react';

export const DASHBOARD_QUICK_ACCESS = [
  {
    id: 'wardrobe',
    label: 'Digital Wardrobe',
    description: 'Your uploads',
    href: '/wardrobe',
    icon: Warehouse,
    iconWrapperClass:
      'bg-pink-100 shadow-[0_8px_28px_-10px_rgba(236,72,153,0.55)] dark:bg-pink-500/20 dark:shadow-[0_8px_28px_-10px_rgba(236,72,153,0.35)]',
    iconClass: 'text-pink-500',
  },
  {
    id: 'closet',
    label: 'Personal Closet',
    description: 'Saved looks',
    href: '/closet',
    icon: Shirt,
    iconWrapperClass:
      'bg-indigo-100 shadow-[0_8px_28px_-10px_rgba(99,102,241,0.5)] dark:bg-indigo-500/20 dark:shadow-[0_8px_28px_-10px_rgba(99,102,241,0.35)]',
    iconClass: 'text-indigo-500',
  },
  {
    id: 'wishlist',
    label: 'Premium Wishlist',
    description: 'Saved picks',
    href: '/wishlist',
    action: 'wishlist',
    icon: Bookmark,
    iconWrapperClass:
      'bg-amber-100 shadow-[0_8px_28px_-10px_rgba(245,158,11,0.5)] dark:bg-amber-500/20 dark:shadow-[0_8px_28px_-10px_rgba(245,158,11,0.35)]',
    iconClass: 'text-amber-500',
  },
  {
    id: 'stylist',
    label: 'AI Stylist',
    description: 'Style chat',
    href: '/ai-stylist',
    action: 'stylist',
    icon: MessageCircle,
    iconWrapperClass:
      'bg-blue-100 shadow-[0_8px_28px_-10px_rgba(59,130,246,0.5)] dark:bg-blue-500/20 dark:shadow-[0_8px_28px_-10px_rgba(59,130,246,0.35)]',
    iconClass: 'text-blue-500',
  },
];
