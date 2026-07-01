export default function AuthLayout({ children }) {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-background text-slate-900 midnight-shell dark:text-slate-200">
      <main className="relative z-10 min-h-screen w-full">{children}</main>
    </div>
  );
}
