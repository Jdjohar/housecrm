'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Search,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import CommunicationSequenceModal from './CommunicationSequenceModal';

export default function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clearNotice, setClearNotice] = useState(false);

  const handleClearData = async () => {
    if (!window.confirm('Are you sure you want to clear all data?')) return;
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

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
        {/* Left: System status */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>H&H System Active</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="text-xs text-slate-500 hidden md:block">
            Lower Mainland, BC • <span className="font-semibold text-slate-700">hnhpros.ca</span>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center space-x-3">
          {/* Quick 8-Stage Simulator Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Test 8-Stage SMS Sequence</span>
          </button>

          {/* Clean / Clear Database Button */}
          <button
            onClick={handleClearData}
            disabled={clearing}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition border border-slate-200"
            title="Purge all customer records"
          >
            <Trash2 className={`w-3.5 h-3.5 ${clearing ? 'animate-spin text-rose-600' : 'text-slate-500'}`} />
            <span>{clearNotice ? 'Database Cleared!' : clearing ? 'Clearing...' : 'Clear Data'}</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={async () => {
              try {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/login';
              } catch (e) {
                console.error(e);
                window.location.href = '/login';
              }
            }}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition border border-slate-200"
            title="Sign out of CRM"
          >
            <span>Log out</span>
          </button>

          <a
            href="https://hnhpros.ca/"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            title="Visit Live Website"
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
