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
    type: "website"
  },
  twitter: { card: "summary_large_image", title: "OSAI", description: "Always-on AI control." }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-black text-white antialiased">
        {/* HEADER */}
        <header className="w-full border-b border-white/10">
          <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-semibold tracking-tight">OSAI</Link>
            <nav className="flex items-center gap-6">
              <Link href="/pricing" className="px-2 py-1 rounded-md hover:opacity-80 focus:outline-none focus:ring">Pricing</Link>
              <Link href="/account" className="px-2 py-1 rounded-md hover:opacity-80 focus:outline-none focus:ring">Account</Link>
            </nav>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>

        {/* FOOTER (rendered ONCE here) */}
        <footer className="w-full border-t border-white/10 mt-16">
          <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm opacity-80">
            <p>© {new Date().getFullYear()} OSAI LLC. All rights reserved.</p>
            <nav className="flex items-center gap-6">
              <Link href="/terms" className="hover:underline focus:outline-none focus:ring">Terms</Link>
              <Link href="/privacy" className="hover:underline focus:outline-none focus:ring">Privacy</Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
