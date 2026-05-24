import type { Metadata } from "next";
import { Geist, Geist_Mono, Tajawal } from "next/font/google";
import "../../../globals.css";

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
  title: "Builder preview",
  robots: { index: false, follow: false },
};

/**
 * Root layout for the builder iframe target.
 * Same fonts as tenant sites so the preview matches what will ship.
 */
export default function BuilderPreviewLayout({
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
