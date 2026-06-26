import { DM_Mono, DM_Sans, Playfair_Display } from 'next/font/google';
import { Providers } from '@/app/providers';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata = {
  title: {
    default: 'AI Personal Wardrobe',
    template: '%s | AI Personal Wardrobe',
  },
  description: 'Your AI-powered personal wardrobe and virtual fashion platform.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${dmMono.variable} ${playfair.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
