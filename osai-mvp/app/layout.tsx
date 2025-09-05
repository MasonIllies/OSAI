// app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "OSAI",
  description: "Your personal OS assistant",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen text-white antialiased
        bg-[radial-gradient(1000px_700px_at_70%_-10%,rgba(255,255,255,0.18),transparent),radial-gradient(800px_500px_at_-10%_30%,rgba(255,255,255,0.10),transparent)]
        bg-black">
        {/* NAV */}
        <header className="sticky top-0 z-40 backdrop-blur-md bg-black/30 border-b border-white/10">
          <nav className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-6 rounded-full bg-white/90 shadow ring-1 ring-black/10" />
              <span className="font-semibold tracking-tight">OSAI</span>
              <span className="hidden md:inline text-white/50">— your personal OS</span>
            </div>
            <div className="flex items-center gap-2">
              <a href="/pricing" className="text-sm text-white/80 hover:text-white">Pricing</a>
              <a href="/account" className="text-sm text-white/80 hover:text-white">Account</a>
            </div>
          </nav>
        </header>

        {/* PAGE */}
        <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          {children}
        </main>

        {/* FOOTER */}
        <footer className="border-t border-white/10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 text-sm flex items-center justify-between text-white/70">
            <div>© {new Date().getFullYear()} OSAI</div>
            <div className="flex items-center gap-4">
              <a className="hover:text-white" href="/legal/terms">Terms</a>
              <a className="hover:text-white" href="/legal/privacy">Privacy</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
