import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Live Analytics & Traffic Hub — How Rare Is My Name?',
  description: 'Real-time telemetry, visitor counts, demographic breakdowns, and social interaction metrics.',
  robots: {
    index: false,
    follow: false
  }
};

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
