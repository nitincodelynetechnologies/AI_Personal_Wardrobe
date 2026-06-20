import { ThemeToggle } from '@/components/theme/ThemeToggle';

export default function AuthLayout({ children }) {
  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 fashion-gradient opacity-40" aria-hidden />
      <ThemeToggle className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6" />
      <main className="relative flex min-h-[100dvh] w-full items-center justify-center px-4 py-10 sm:py-14">
        {children}
      </main>
    </div>
  );
}
