'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Smartphone,
  Mail,
  CheckCircle2,
  Clock,
  User,
  Phone,
  Flame,
  Star,
  ExternalLink,
} from 'lucide-react';

interface CommunicationSequenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTrigger?: string;
  defaultCustomer?: any;
}

const SEQUENCE_STAGES = [
  {
    id: 'estimate_sent',
    number: '1',
    name: 'When Estimate is Sent',
    sample: 'Hi John, your H&H House Maintenance estimate is ready.',
    category: 'Estimates',
  },
  {
    id: 'estimate_followup',
    number: '2',
    name: 'Estimate Follow-up Reminder',
    sample: 'Just following up on your H&H estimate.',
    category: 'Estimates',
  },
  {
    id: 'day_before_job',
    number: '3',
    name: 'Day Before Job Reminder',
    sample: 'Your H&H service is scheduled for tomorrow at 10:00 AM.',
    category: 'Jobs',
  },
  {
    id: 'crew_leaving',
    number: '4',
    name: 'Crew Leaving (En Route Dispatch)',
    sample: 'Our crew is on the way. ETA: 25 minutes.',
    category: 'Dispatch',
  },
  {
    id: 'job_completed',
    number: '5',
    name: 'Job Completed',
    sample: 'Your H&H service has been completed.',
    category: 'Jobs',
  },
  {
    id: 'invoice_sent',
    number: '6',
    name: 'Invoice Ready',
    sample: 'Your invoice is ready.',
    category: 'Billing',
  },
  {
    id: 'payment_received',
    number: '7',
    name: 'Payment Received',
    sample: 'Thank you for your payment.',
    category: 'Billing',
  },
  {
    id: 'review_request',
    number: '8',
    name: 'Review Request (5★ Google Funnel)',
    sample: 'How was your experience with H&H?',
    category: 'Reviews',
  },
];

export default function CommunicationSequenceModal({
  isOpen,
  onClose,
  defaultTrigger = 'estimate_sent',
  defaultCustomer,
}: CommunicationSequenceModalProps) {
  const [selectedTrigger, setSelectedTrigger] = useState(defaultTrigger);
  const [customerName, setCustomerName] = useState(defaultCustomer?.name || 'John Miller');
  const [customerPhone, setCustomerPhone] = useState(defaultCustomer?.phone || '(604) 832-1920');
  const [serviceName, setServiceName] = useState('Gutter Cleaning & House Wash');
  const [scheduledTime, setScheduledTime] = useState('10:00 AM');
  const [etaMinutes, setEtaMinutes] = useState(25);
  const [amount, setAmount] = useState(385);
  const [preview, setPreview] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  useEffect(() => {
    if (defaultTrigger) setSelectedTrigger(defaultTrigger);
    if (defaultCustomer) {
      setCustomerName(defaultCustomer.name);
      setCustomerPhone(defaultCustomer.phone);
    }
  }, [defaultTrigger, defaultCustomer]);

  // Fetch preview dynamically
  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/communications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'preview',
        trigger: selectedTrigger,
        customerName,
        customerPhone,
        serviceName,
        scheduledTime,
        etaMinutes,
        amount,
        referenceNumber: 'DEMO-101',
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPreview(data.data);
      })
      .catch((e) => console.error(e));
  }, [isOpen, selectedTrigger, customerName, customerPhone, serviceName, scheduledTime, etaMinutes, amount]);

  if (!isOpen) return null;

  const handleSend = async () => {
    setSending(true);
    try {
      const res = await fetch('/api/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trigger: selectedTrigger,
          customerName,
          customerPhone,
          serviceName,
          scheduledTime,
          etaMinutes,
          amount,
          referenceNumber: 'TEST-' + Math.floor(100 + Math.random() * 900),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSentSuccess(true);
        setTimeout(() => {
          setSentSuccess(false);
          onClose();
        }, 1800);
      }
    } catch (err) {
      console.error('Dispatch error:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">Auto Communication Dispatcher</h3>
              <p className="text-[11px] sm:text-xs text-blue-200">
                Trigger & preview any of the 8 automated customer lifecycle messages for H&H
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 overflow-y-auto flex-1">
          {/* Left Column: Sequence Step Selector */}
          <div className="md:col-span-5 bg-slate-50 p-4 border-b md:border-b-0 md:border-r border-slate-200 overflow-y-auto space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
              Select 8-Stage Step
            </div>
            {SEQUENCE_STAGES.map((step) => {
              const isSelected = selectedTrigger === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setSelectedTrigger(step.id)}
                  className={`w-full text-left p-3 rounded-xl transition border text-sm flex items-start space-x-3 ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                      : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                      isSelected ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {step.number}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate text-xs sm:text-sm">{step.name}</div>
                    <div
                      className={`text-xs truncate mt-0.5 ${
                        isSelected ? 'text-blue-100' : 'text-slate-500'
                      }`}
                    >
                      &ldquo;{step.sample}&rdquo;
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Parameters & Live SMS Preview */}
          <div className="md:col-span-7 p-4 sm:p-5 overflow-y-auto space-y-4">
            {/* Customer input fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Customer Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Context parameters depending on trigger */}
            {selectedTrigger === 'crew_leaving' && (
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <label className="text-xs font-semibold text-blue-900 block mb-1">
                  Crew ETA (Minutes): <span className="font-bold text-blue-600">{etaMinutes} mins</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={etaMinutes}
                  onChange={(e) => setEtaMinutes(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>
            )}

            {selectedTrigger === 'day_before_job' && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                <label className="text-xs font-semibold text-amber-900 block mb-1">
                  Scheduled Arrival Time
                </label>
                <input
                  type="text"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  placeholder="e.g. 10:00 AM"
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-amber-200 bg-white"
                />
              </div>
            )}

            {/* Live Message Simulator Box */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-blue-600" /> Live SMS Message Preview
                </span>
                <span className="text-[11px] font-normal text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Ready to send
                </span>
              </div>

              {/* Realistic Mobile SMS bubble */}
              <div className="bg-slate-900 rounded-2xl p-4 shadow-inner text-white relative">
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2 mb-3">
                  <span>H&H House Maintenance</span>
                  <span>Now • SMS</span>
                </div>
                <div className="bg-blue-600 text-white p-3.5 rounded-2xl rounded-tl-xs text-sm leading-relaxed shadow">
                  {preview ? preview.smsText : 'Generating preview...'}
                </div>
                {preview?.clientUrl && (
                  <div className="mt-2 text-right">
                    <a
                      href={preview.clientUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-300 hover:text-blue-100 underline inline-flex items-center gap-1"
                    >
                      Test Client View Link <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Modal actions */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={sending || sentSuccess}
                className="px-5 py-2 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-lg shadow-blue-500/25 transition disabled:opacity-50"
              >
                {sentSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Dispatched!
                  </>
                ) : sending ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" /> Dispatching...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Trigger & Log Message
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
