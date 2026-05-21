import type { Metadata, Viewport } from 'next';
import './globals.css';
import { QueryProvider } from '@/lib/query-client';

export const metadata: Metadata = {
  title: {
    default: 'NHPMBR — Ministry of Health, Sierra Leone',
    template: '%s · NHPMBR',
  },
  description:
    'National Health Planning, Monitoring, Budgeting & Reporting Platform — Ministry of Health and Sanitation, Government of Sierra Leone.',
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = {
  themeColor: '#0f2847',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
