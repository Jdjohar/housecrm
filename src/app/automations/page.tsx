'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquareShare,
  Sparkles,
  Send,
  Smartphone,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  CalendarCheck,
  CreditCard,
  Star,
  RefreshCw,
  Search,
  Filter,
  Flame,
  ArrowRight,
} from 'lucide-react';
import CommunicationSequenceModal from '@/components/CommunicationSequenceModal';

interface LogItem {
  _id: string;
  customerName: string;
  recipientPhone: string;
  triggerEvent: string;
  triggerTitle: string;
  messageContent: string;
  channel: string;
  status: string;
  sentAt: string;
  referenceType?: string;
  referenceId?: string;
}

const AUTOMATION_WORKFLOWS = [
  {
    step: '1',
    key: 'estimate_sent',
    title: 'Estimate Sent Notification',
    triggerEvent: 'When estimate is generated and sent to customer',
    copy: 'Hi John, your H&H House Maintenance estimate is ready.',
    badge: 'Estimates',
    color: 'border-blue-500 bg-blue-50/50',
    icon: FileText,
  },
  {
    step: '2',
    key: 'estimate_followup',
    title: 'Estimate Follow-up Reminder',
    triggerEvent: 'Automated follow-up after 2 days of pending estimate',
    copy: 'Just following up on your H&H estimate.',
    badge: 'Estimates',
    color: 'border-indigo-500 bg-indigo-50/50',
    icon: Clock,
  },
  {
    step: '3',
    key: 'day_before_job',
    title: 'Day Before Job Reminder',
    triggerEvent: '24 hours prior to scheduled appointment',
    copy: 'Your H&H service is scheduled for tomorrow at 10:00 AM.',
    badge: 'Scheduling',
    color: 'border-amber-500 bg-amber-50/50',
    icon: CalendarCheck,
  },
  {
    step: '4',
    key: 'crew_leaving',
    title: 'Crew Leaving (Live Dispatch ETA)',
    triggerEvent: 'When technician/crew taps "En Route" from vehicle',
    copy: 'Our crew is on the way. ETA: 25 minutes.',
    badge: 'Live Dispatch',
    color: 'border-orange-500 bg-orange-50/50',
    icon: Flame,
  },
  {
    step: '5',
    key: 'job_completed',
    title: 'Job Completed Notice',
    triggerEvent: 'When crew marks service finished on site',
    copy: 'Your H&H service has been completed.',
    badge: 'Jobs',
    color: 'border-emerald-500 bg-emerald-50/50',
    icon: CheckCircle2,
  },
  {
    step: '6',
    key: 'invoice_sent',
    title: 'Invoice Sent',
    triggerEvent: 'When invoice is prepared and sent to customer',
    copy: 'Your invoice is ready.',
    badge: 'Billing',
    color: 'border-purple-500 bg-purple-50/50',
    icon: CreditCard,
  },
  {
    step: '7',
    key: 'payment_received',
    title: 'Payment Received Confirmation',
    triggerEvent: 'Triggered instantly when invoice payment is processed',
    copy: 'Thank you for your payment.',
    badge: 'Billing',
    color: 'border-teal-500 bg-teal-50/50',
    icon: CreditCard,
  },
  {
    step: '8',
    key: 'review_request',
    title: 'Smart 5-Star Review Funnel',
    triggerEvent: 'Automated review request after successful payment',
    copy: 'How was your experience with H&H?',
    badge: 'Reviews (5★)',
    color: 'border-amber-500 bg-amber-50/60',
    icon: Star,
  },
];

export default function AutomationsPage() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTrigger, setFilterTrigger] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTrigger, setModalTrigger] = useState('estimate_sent');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/communications');
      const data = await res.json();
      if (data.data) setLogs(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleTestTrigger = (triggerKey: string) => {
    setModalTrigger(triggerKey);
    setIsModalOpen(true);
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.messageContent.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterTrigger === 'all' || log.triggerEvent === filterTrigger;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-6 rounded-3xl shadow-xl border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Automatic Customer Communication Engine
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            8-Stage Automatic Messaging Sequence
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            H&H House Maintenance automatically communicates with customers through each milestone of their service journey: from first estimate to 5-star Google review.
          </p>
        </div>

        <button
          onClick={() => {
            setModalTrigger('estimate_sent');
            setIsModalOpen(true);
          }}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-sm hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 self-start md:self-auto shrink-0"
        >
          <Send className="w-4 h-4" />
          <span>Launch Message Simulator</span>
        </button>
      </div>

      {/* 8-Sequence Workflow Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MessageSquareShare className="w-5 h-5 text-blue-600" />
            Configured Sequence Stages (8 Lifecycle Steps)
          </h2>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
            All 8 Triggers Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {AUTOMATION_WORKFLOWS.map((wf) => {
            const Icon = wf.icon;
            return (
              <div
                key={wf.key}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                      #{wf.step}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
                      {wf.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{wf.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{wf.triggerEvent}</p>
                  </div>

                  {/* Message Quote Box */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 leading-snug">
                    <span className="text-blue-600 font-bold block text-[10px] uppercase mb-0.5">
                      SMS Copy:
                    </span>
                    &ldquo;{wf.copy}&rdquo;
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Auto-SMS
                  </span>
                  <button
                    onClick={() => handleTestTrigger(wf.key)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition flex items-center gap-1"
                  >
                    <span>Test Send</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Communication Feed */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-600" />
              Live Automated Dispatch Log ({filteredLogs.length} Messages)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time feed of SMS & Email messages delivered to H&H customers
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter */}
            <select
              value={filterTrigger}
              onChange={(e) => setFilterTrigger(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Sequence Stages</option>
              <option value="estimate_sent">1. Estimate Sent</option>
              <option value="estimate_followup">2. Estimate Follow-Up</option>
              <option value="day_before_job">3. Day Before Job</option>
              <option value="crew_leaving">4. Crew Leaving (ETA)</option>
              <option value="job_completed">5. Job Completed</option>
              <option value="invoice_sent">6. Invoice Sent</option>
              <option value="payment_received">7. Payment Received</option>
              <option value="review_request">8. Review Request</option>
              <option value="seasonal_reminder">Seasonal Reminders</option>
            </select>

            <button
              onClick={fetchLogs}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
              title="Refresh log"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Feed List */}
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">Loading logs...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              No communication logs found matching criteria.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log._id}
                className="p-4 md:p-5 hover:bg-slate-50/80 transition flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm">{log.customerName}</span>
                    <span className="text-xs text-slate-400">• {log.recipientPhone}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {log.triggerTitle || log.triggerEvent}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Delivered
                    </span>
                  </div>

                  <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 font-normal">
                    {log.messageContent}
                  </div>
                </div>

                <div className="text-right shrink-0 text-xs text-slate-400 space-y-1">
                  <div>{new Date(log.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  <div className="text-[11px] text-slate-400">
                    {new Date(log.sentAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <CommunicationSequenceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          fetchLogs();
        }}
        defaultTrigger={modalTrigger}
      />
    </div>
  );
}
