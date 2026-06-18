export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <main className="min-h-screen w-full">{children}</main>
    </div>
  );
}
