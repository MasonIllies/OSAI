import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "OSAI — Your personal OS assistant",
  description: "Always-on AI control for your life and work.",
  openGraph: {
    title: "OSAI",
    description: "Always-on AI control for your life and work.",
    url: "https://osai.llc",
    siteName: "OSAI",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "OSAI", description: "Always-on AI control." },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-black text-white antialiased relative">
        {/* subtle texture + gradients (looks premium) */}
        <div aria-hidden className="fixed inset-0 -z-10 bg-[radial-gradient(1000px_700px_at_70%_-10%,rgba(255,255,255,0.18),transparent),radial-gradient(800px_500px_at_-10%_30%,rgba(255,255,255,0.10),transparent)]" />
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 opacity-[0.06] mix-blend-soft-light" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%27160%27 height=%27160%27><filter id=%27n%27><feTurbulence type=%27fractalNoise%27 baseFrequency=%270.8%27 numOctaves=%273%27 stitchTiles=%27stitch%27/></filter><rect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27 opacity=%271%27/></svg>')" }} />

        {/* Skip to content (accessibility) */}
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:bg-black focus:text-white focus:px-3 focus:py-2 rounded">
          Skip to content
        </a>

        {/* HEADER — shown on every page */}
        <header className="sticky top-0 z-40 backdrop-blur-md bg-black/30 border-b border-white/10">
          <nav className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-6 rounded-full bg-white/90 shadow ring-1 ring-black/10" />
              <span className="font-semibold tracking-tight">OSAI</span>
              <span className="hidden md:inline text-white/50">— your personal OS</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/pricing" className="px-2 py-1 rounded-md hover:opacity-80 focus:outline-none focus:ring">Pricing</Link>
              <Link href="/account" className="px-2 py-1 rounded-md hover:opacity-80 focus:outline-none focus:ring">Account</Link>
              <Link href="/pricing" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold shadow-inner hover:bg-white/20">
                Get OSAI
              </Link>
            </div>
          </nav>
        </header>

        {/* PAGE CONTENT */}
        <main id="main" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          {children}
        </main>

        {/* FOOTER — shown on every page */}
        <footer className="border-t border-white/10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 text-sm flex flex-col md:flex-row items-center justify-between gap-4 text-white/70">
            <div>© {new Date().getFullYear()} OSAI LLC. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <Link className="hover:text-white" href="/legal/terms">Terms</Link>
              <Link className="hover:text-white" href="/legal/privacy">Privacy</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
