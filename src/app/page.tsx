'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  FileText,
  CalendarCheck,
  CreditCard,
  MessageSquareShare,
  Star,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Send,
  Flame,
  Flower2,
  Sun,
  Leaf,
  Plus,
} from 'lucide-react';
import CommunicationSequenceModal from '@/components/CommunicationSequenceModal';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    customersCount: 0,
    estimatesCount: 0,
    jobsCount: 0,
    invoicesPaidTotal: 0,
    invoicesPendingTotal: 0,
    reviewsCount: 0,
    avgRating: 5.0,
    googleConversion: 0,
    autoLogsCount: 0,
  });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [upcomingJobs, setUpcomingJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [custRes, estRes, jobRes, invRes, revRes, comRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/estimates'),
          fetch('/api/jobs'),
          fetch('/api/invoices'),
          fetch('/api/reviews'),
          fetch('/api/communications'),
        ]);

        const [custData, estData, jobData, invData, revData, comData] = await Promise.all([
          custRes.json(),
          estRes.json(),
          jobRes.json(),
          invRes.json(),
          revRes.json(),
          comRes.json(),
        ]);

        const paidTotal = invData.data
          ? invData.data
              .filter((i: any) => i.status === 'paid')
              .reduce((sum: number, i: any) => sum + i.total, 0)
          : 0;

        const pendingTotal = invData.data
          ? invData.data
              .filter((i: any) => i.status !== 'paid')
              .reduce((sum: number, i: any) => sum + i.total, 0)
          : 0;

        setStats({
          customersCount: custData.count || custData.data?.length || 0,
          estimatesCount: estData.data?.length || 0,
          jobsCount: jobData.count || jobData.data?.length || 0,
          invoicesPaidTotal: paidTotal,
          invoicesPendingTotal: pendingTotal,
          reviewsCount: revData.stats?.totalReceived || 0,
          avgRating: revData.stats?.avgRating || 5.0,
          googleConversion: revData.stats?.googleConversionPercent || 0,
          autoLogsCount: comData.count || comData.data?.length || 0,
        });

        if (comData.data) setRecentLogs(comData.data.slice(0, 5));
        if (jobData.data) setUpcomingJobs(jobData.data.slice(0, 4));
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            H&H House Maintenance Dispatch Center
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Automated Operations Hub
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Automatic customer communications, 5-Star Google review filtering, and seasonal reminders active for Vancouver & Fraser Valley properties.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Test 8-Stage Automation</span>
          </button>
          <Link
            href="/seasonal"
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs hover:from-amber-300 hover:to-amber-400 transition shadow-lg shadow-amber-500/20 flex items-center gap-2"
          >
            <Flower2 className="w-4 h-4" />
            <span>Seasonal Reminders</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Communication Sequences */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Automated Dispatches
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MessageSquareShare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            {stats.autoLogsCount}
          </div>
          <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 8 Lifecycle Stages Active
          </div>
        </div>

        {/* KPI 2: Review Score & Funnel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              5★ Google Funnel
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-500 mt-2 flex items-center gap-1.5">
            <span>{stats.avgRating}</span>
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {stats.reviewsCount > 0 ? `${stats.googleConversion}% 5★ Google Redirection` : 'Ready for customer reviews'}
          </div>
        </div>

        {/* KPI 3: Scheduled Jobs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Jobs & Crew Dispatch
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            {stats.jobsCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">Live ETA SMS enabled</div>
        </div>

        {/* KPI 4: Invoices & Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Collected Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">
            ${(Number(stats.invoicesPaidTotal) || 0).toFixed(2)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            ${(Number(stats.invoicesPendingTotal) || 0).toFixed(2)} pending invoices
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Real-Time Jobs & Dispatch */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-blue-600" />
                  Active Jobs & Dispatch Status
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time crew tracking with automated customer arrival notifications
                </p>
              </div>
              <Link
                href="/jobs"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingJobs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                  <CalendarCheck className="w-8 h-8 mx-auto text-slate-300" />
                  <div>No scheduled jobs currently in database.</div>
                  <Link
                    href="/estimates"
                    className="inline-block text-xs font-bold text-blue-600 hover:underline"
                  >
                    + Create an Estimate to book a Job
                  </Link>
                </div>
              ) : (
                upcomingJobs.map((job) => (
                  <div
                    key={job._id}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-blue-400/60 transition bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{job.customerName}</span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          ({job.jobNumber})
                        </span>
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            job.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : job.status === 'en_route'
                              ? 'bg-orange-100 text-orange-800 animate-pulse'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {job.status === 'en_route' ? 'En Route (ETA 25m)' : job.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 font-medium">
                        {job.title}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <span>{job.address}</span>
                        <span>•</span>
                        <span>{job.scheduledTime}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Link
                        href="/jobs"
                        className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm"
                      >
                        Dispatch / Update
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Seasonal Alert Card */}
          <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white p-6 rounded-3xl border border-emerald-800 shadow-sm flex items-center justify-between">
            <div className="space-y-1 max-w-md">
              <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-bold uppercase tracking-wider">
                <Flower2 className="w-4 h-4" /> Seasonal Maintenance Engine
              </div>
              <h3 className="font-bold text-base text-white">
                Spring, Summer & Fall Customer Reminders
              </h3>
              <p className="text-xs text-emerald-200">
                Gutter cleaning, vinyl house wash & driveway power washing campaigns ready to blast to past customers.
              </p>
            </div>
            <Link
              href="/seasonal"
              className="px-4 py-2 rounded-xl bg-white text-emerald-950 font-bold text-xs hover:bg-emerald-50 transition shadow-md shrink-0"
            >
              View Campaigns
            </Link>
          </div>
        </div>

        {/* Right 5 Columns: Live Automation Sequence Feed */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Recent Auto-SMS Feed
                </h2>
                <p className="text-xs text-slate-500">Live communication sequence updates</p>
              </div>
              <Link
                href="/automations"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                All logs <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                  <MessageSquareShare className="w-8 h-8 mx-auto text-slate-300" />
                  <div>No automated SMS dispatches logged yet.</div>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Test 8-Stage Simulator
                  </button>
                </div>
              ) : (
                recentLogs.map((log) => (
                  <div
                    key={log._id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{log.customerName}</span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                        {log.triggerTitle?.split('.')[1]?.trim() || log.triggerEvent}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-snug font-normal">
                      &ldquo;{log.messageContent}&rdquo;
                    </p>
                    <div className="text-[10px] text-slate-400 text-right">
                      {new Date(log.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <CommunicationSequenceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
