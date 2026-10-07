import type { Metadata, Viewport } from 'next';
import './globals.css';
import AppShell from '@/components/AppShell';
import PwaRegistration from '@/components/PwaRegistration';

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'H&H House Maintenance CRM | Operations & Communications',
  description:
    'Dedicated CRM with Automatic Customer Communication Sequences, 5-Star Google Review Filter & Seasonal Reminders for H&H House Maintenance (hnhpros.ca)',
  manifest: '/manifest.json',
  applicationName: 'H&H Jobs',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'H&H Jobs',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-full bg-slate-50 text-slate-900">
        <AppShell>{children}</AppShell>
        <PwaRegistration />
      </body>
    </html>
  );
}

