'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileBottomNav from './MobileBottomNav';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if public page (Login, Customer estimate portal, invoice portal, review page, or standalone PDF)
  const isPublicPage =
    pathname === '/login' ||
    pathname.startsWith('/portal') ||
    pathname.startsWith('/review') ||
    pathname.startsWith('/feedback') ||
    pathname.endsWith('/pdf');

  if (isPublicPage) {
    return <main className="min-h-screen bg-slate-950 print:bg-white print:min-h-0 print:p-0">{children}</main>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans overflow-x-hidden print:bg-white print:min-h-0 print:overflow-visible print:block">
      {/* Sidebar (Desktop static & Mobile Drawer) */}
      <div className="print:hidden">
        <Sidebar
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen print:min-h-0 print:block">
        <div className="print:hidden">
          <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        </div>
        
        {/* Main Content with bottom padding on mobile for MobileBottomNav */}
        <main className="flex-1 p-3.5 sm:p-5 md:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto pb-24 lg:pb-8 print:p-0 print:m-0 print:max-w-none print:w-full print:overflow-visible print:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (< 1024px) */}
      <div className="print:hidden">
        <MobileBottomNav onOpenMenu={() => setMobileMenuOpen(true)} />
      </div>
    </div>
  );
}
