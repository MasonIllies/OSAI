import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "OSAI — Your personal OS assistant",
  description: "Always-on AI control for your life and work.",
  openGraph: { title: "OSAI", description: "Always-on AI control for your life and work.", url: "https://osai.llc", siteName: "OSAI", type: "website", images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: "OSAI", description: "Always-on AI control.", images: ["/og.png"] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen antialiased">
        {/* HEADER */}
        <header className="sticky top-0 z-40 backdrop-blur-md bg-black/30 border-b border-white/10">
          <nav className="container h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              {/* Upload your PNG to /public as osai-logo.png */}
              <Image src="/osai-logo.png" alt="OSAI logo" width={28} height={28} priority />
              <span className="font-semibold tracking-tight">OSAI</span>
              <span className="hidden md:inline text-white/50">— your personal OS</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/pricing" className="px-2 py-1 rounded-md hover:opacity-80 focus:outline-none focus:ring">Pricing</Link>
              <Link href="/account" className="px-2 py-1 rounded-md hover:opacity-80 focus:outline-none focus:ring">Account</Link>
              <Link href="/pricing" className="btn">Get OSAI</Link>
            </div>
          </nav>
        </header>

        {/* CONTENT */}
        <main id="main" className="container py-10">{children}</main>

        {/* FOOTER */}
        <footer className="border-t border-white/10">
          <div className="container py-8 text-sm flex flex-col md:flex-row items-center justify-between gap-4 text-white/70">
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
