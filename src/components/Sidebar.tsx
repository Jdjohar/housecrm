'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  CalendarCheck,
  CreditCard,
  MessageSquareShare,
  Star,
  Sparkles,
  Settings,
  ExternalLink,
  ChevronRight,
  Flame,
  X,
  ShieldCheck,
} from 'lucide-react';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Customers',
    href: '/customers',
    icon: Users,
  },
  {
    name: 'Estimates & Quotes',
    href: '/estimates',
    icon: FileText,
  },
  {
    name: 'Bookings & Jobs',
    href: '/jobs',
    icon: CalendarCheck,
  },
  {
    name: 'Invoices & Payments',
    href: '/invoices',
    icon: CreditCard,
  },
  {
    name: 'Auto Communications',
    href: '/automations',
    icon: MessageSquareShare,
    badge: '8 Steps',
    highlight: true,
  },
  {
    name: 'Review Management',
    href: '/reviews',
    icon: Star,
    badge: '5★ Filter',
    highlight: true,
  },
  {
    name: 'Seasonal Reminders',
    href: '/seasonal',
    icon: Sparkles,
    badge: 'Spring/Fall',
    highlight: true,
  },
  {
    name: 'Settings & Pricing',
    href: '/settings',
    icon: Settings,
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (e) {
      window.location.href = '/login';
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 select-none">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-400 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-blue-500/20 shrink-0">
            H&H
          </div>
          <div>
            <div className="font-bold text-white tracking-tight text-sm leading-tight flex items-center gap-1.5">
              H&H House CRM
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <a
              href="https://hnhpros.ca/"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 transition flex items-center gap-1 mt-0.5"
            >
              hnhpros.ca <ExternalLink className="w-3 h-3 inline" />
            </a>
          </div>
        </div>

        {/* Mobile Close Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition tap-target flex items-center justify-center cursor-pointer"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation list */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto touch-scroll">
        <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Operations
        </div>
        {navigationItems.slice(0, 5).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleLinkClick}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group tap-target ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white active:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span className="truncate">{item.name}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-200 shrink-0" />}
            </Link>
          );
        })}

        <div className="pt-4 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Smart Automation Suite</span>
        </div>
        {navigationItems.slice(5).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleLinkClick}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group tap-target ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white active:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    item.highlight
                      ? 'text-amber-400 group-hover:text-amber-300'
                      : isActive
                      ? 'text-white'
                      : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Banner & User Profile */}
      <div className="p-3 m-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-xs space-y-2 shrink-0 pb-safe">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              A
            </div>
            <div>
              <div className="font-bold text-white text-xs leading-none">Admin Profile</div>
              <div className="text-[10px] text-emerald-400 mt-0.5">Online &amp; Active</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs text-slate-300 hover:text-rose-400 active:scale-95 font-semibold px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700 hover:border-rose-500/40 transition cursor-pointer"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 border-r border-slate-800 min-h-screen flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Slide-over overlay) */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation drawer"
        >
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Slide-over panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full h-full shadow-2xl z-10 animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
