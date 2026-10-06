import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Serif } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import { Sidebar } from "@/components/layout/sidebar";
import { EXPERIMENT_TITLE } from "@/lib/sections";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-plex-serif",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${EXPERIMENT_TITLE} | Cryptography Virtual Lab`,
    template: `%s | KDC Key Exchange Lab`,
  },
  description:
    "An interactive virtual lab experiment on symmetric key distribution using a trusted third party (Key Distribution Center). Walk through a simplified Needham–Schroeder style exchange step by step, using real AES-GCM encryption in your browser.",
  keywords: [
    "Key Distribution Center",
    "KDC",
    "trusted third party",
    "session key",
    "Needham-Schroeder",
    "cryptography lab",
    "network security",
  ],
};

export const viewport: Viewport = {
  themeColor: "#f2f3f0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexSerif.variable} ${plexMono.variable}`} suppressHydrationWarning>
      {/* Browser extensions (e.g. Grammarly) inject attributes on <html>/<body> before hydration. */}
      <body className="min-h-dvh bg-canvas text-ink antialiased" suppressHydrationWarning>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:shadow"
        >
          Skip to content
        </a>
        <SiteHeader />
        <div className="flex min-h-[calc(100dvh-3.5rem)] w-full">
          <Sidebar />
          <main id="main" className="min-w-0 flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-6 lg:pt-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
