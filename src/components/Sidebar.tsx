'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  CalendarCheck,
  CreditCard,
  Wrench,
  MessageSquareShare,
  Star,
  Sparkles,
  Settings,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Flame,
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

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 border-r border-slate-800 select-none min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-400 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-blue-500/20">
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
      </div>

      {/* Navigation list */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Operations
        </div>
        {navigationItems.slice(0, 6).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span>{item.name}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-200" />}
            </Link>
          );
        })}

        <div className="pt-4 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
          <Flame className="w-3 h-3 text-amber-400" />
          Smart Automation Suite
        </div>
        {navigationItems.slice(6).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-4 h-4 ${
                    item.highlight
                      ? 'text-amber-400 group-hover:text-amber-300'
                      : isActive
                      ? 'text-white'
                      : 'text-slate-400'
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Banner & User Profile */}
      <div className="p-3 m-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
              A
            </div>
            <div>
              <div className="font-bold text-white text-[11px] leading-none">Admin</div>
              <div className="text-[9px] text-emerald-400">Online</div>
            </div>
          </div>
          <button
            onClick={async () => {
              try {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/login';
              } catch (e) {
                window.location.href = '/login';
              }
            }}
            className="text-[10px] text-slate-400 hover:text-rose-400 font-medium px-2 py-1 rounded bg-slate-900/60 border border-slate-700 hover:border-rose-500/40 transition"
          >
            Log out
          </button>
        </div>
      </div>
    </aside>
  );
}
