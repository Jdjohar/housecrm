import type { Metadata } from 'next';
import './globals.css';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'H&H House Maintenance CRM | Smart Automation & Review Funnel',
  description:
    'Dedicated CRM with Automatic Customer Communication Sequences, 5-Star Google Review Filter & Seasonal Reminders for H&H House Maintenance (hnhpros.ca)',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-slate-50 text-slate-900">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
