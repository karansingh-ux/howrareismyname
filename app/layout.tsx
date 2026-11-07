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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null)
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
  || 'https://checknamerarity.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "How Rare Is My Name? — Global & Regional Name Rarity",
  description: "Find out your exact name odds and statistical rarity across India, the US, Europe, and 180+ countries. Backed by 1+ billion official demographic records.",
  keywords: [
    "how rare is my name",
    "name rarity calculator",
    "how common is my name",
    "name popularity rank",
    "global name rarity",
    "Indian name rarity",
    "US name rarity",
    "name odds"
  ],
  authors: [{ name: "Karan Singh", url: "https://www.instagram.com/karansinghh.ai/" }],
  creator: "Karan Singh",
  openGraph: {
    title: "How Rare Is My Name? — Global & Regional Name Rarity",
    description: "Find out your exact name odds across India, the United States, Europe, and 180+ countries. Tested against 1B+ official demographic records.",
    siteName: "How Rare Is My Name?",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'How Rare Is My Name? — Global & Regional Name Rarity'
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "How Rare Is My Name? — Global & Regional Name Rarity",
    description: "Find out your exact name odds across India, the United States, Europe, and 180+ countries. Tested against 1B+ official demographic records.",
    images: ['/opengraph-image']
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
