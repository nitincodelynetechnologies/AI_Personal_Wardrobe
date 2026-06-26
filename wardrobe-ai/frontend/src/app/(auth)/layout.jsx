export default function AuthLayout({ children }) {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-background text-slate-900 dark:text-white">
      <main className="relative z-10 min-h-screen w-full">{children}</main>
    </div>
  );
}
