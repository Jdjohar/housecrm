'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ExternalLink,
  Trash2,
  Menu,
  LogOut,
  CheckCircle2,
} from 'lucide-react';
import CommunicationSequenceModal from './CommunicationSequenceModal';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export default function Header({ onOpenMobileMenu }: HeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clearNotice, setClearNotice] = useState(false);

  const handleClearData = async () => {
    if (!window.confirm('Are you sure you want to reset and clear sample CRM data?')) return;
    setClearing(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setClearNotice(true);
        setTimeout(() => {
          setClearNotice(false);
          window.location.reload();
        }, 1200);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setClearing(false);
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

  return (
    <>
      <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 shrink-0">
        {/* Left: Mobile Hamburger & System Status */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          {/* Mobile Drawer Trigger */}
          {onOpenMobileMenu && (
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition tap-target flex items-center justify-center cursor-pointer shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Brand Mark on Mobile */}
          <div className="lg:hidden flex items-center gap-1.5 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-400 flex items-center justify-center font-black text-white text-xs shadow-xs">
              H&H
            </div>
          </div>

          {/* System Status Pill */}
          <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold border border-emerald-200 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="hidden xs:inline">System Active</span>
            <span className="xs:hidden">Live</span>
          </div>

          <span className="text-slate-200 hidden md:inline">|</span>
          <div className="text-xs text-slate-500 hidden md:block truncate">
            Lower Mainland, BC • <span className="font-semibold text-slate-700">hnhpros.ca</span>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
          {/* Quick 8-Stage Simulator Button */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 px-2.5 sm:px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition cursor-pointer tap-target"
            title="Test 8-Stage SMS Sequence"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="hidden sm:inline">Test Sequences</span>
          </button>

          {/* Reset / Clear Data Button */}
          <button
            type="button"
            onClick={handleClearData}
            disabled={clearing}
            className="hidden sm:flex items-center space-x-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 active:scale-95 transition border border-slate-200 cursor-pointer tap-target"
            title="Reset CRM Data"
          >
            <Trash2 className={`w-3.5 h-3.5 ${clearing ? 'animate-spin text-rose-600' : 'text-slate-500'} shrink-0`} />
            <span className="hidden md:inline">{clearNotice ? 'Cleared!' : clearing ? 'Clearing...' : 'Clear Data'}</span>
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 hover:text-slate-900 transition border border-slate-200 cursor-pointer tap-target"
            title="Sign out of CRM"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500 sm:hidden" />
            <span className="hidden sm:inline">Log out</span>
          </button>

          {/* Live website link */}
          <a
            href="https://hnhpros.ca/"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition tap-target flex items-center justify-center"
            title="Visit Live Website (hnhpros.ca)"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </header>

      <CommunicationSequenceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
