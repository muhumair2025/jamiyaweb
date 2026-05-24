import type { Metadata } from "next";
import { Geist, Geist_Mono, Tajawal } from "next/font/google";
import "../../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  // Per-tenant title/description is set by each page via generateMetadata
  title: "Site",
};

/**
 * Root layout for ALL tenant sites.
 *
 * Intentionally minimal — no marketing navbar, no dashboard sidebar.
 * Per-page metadata (title, dir, lang) is set by the catch-all page via
 * `generateMetadata`, since the language depends on the tenant's settings.
 */
export default function TenantSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      className={`${geistSans.variable} ${geistMono.variable} ${tajawal.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
