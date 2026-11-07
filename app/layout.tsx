import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#4a90e2",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://howrareismyname.in'),
  title: "How Rare Is My Name? — Indian Name Rarity",
  description: "Find out how common your first name is in India. Empirical, data-backed rarity statistics based on 475.5 million official voter registration records across 31 Indian states.",
  keywords: [
    "Indian name rarity",
    "how common is my name",
    "how rare is my name",
    "name popularity in India",
    "Indian names statistics",
    "name rank India"
  ],
  authors: [{ name: "Name Rarity" }],
  openGraph: {
    title: "How Rare Is My Name? — Indian Name Rarity",
    description: "Enter your first name and find out how common it is in India, backed by 475.5M official records.",
    siteName: "How Rare Is My Name?",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "How Rare Is My Name? — Indian Name Rarity",
    description: "Enter your first name and find out how common it is in India."
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-neutral-900 font-sans relative">
        <div 
          className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{ backgroundImage: "url('/assets/background.png')" }}
          aria-hidden="true"
        />
        {/* Subtle atmospheric vignette/overlay to guarantee effortless readability across bright sky bands */}
        <div 
          className="fixed inset-0 -z-10 bg-gradient-to-b from-black/15 via-black/10 to-black/25 pointer-events-none"
          aria-hidden="true"
        />
        {children}
      </body>
    </html>
  );
}
