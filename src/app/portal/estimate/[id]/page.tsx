'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  Printer,
  Sparkles,
  Download,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import EstimatePdfDocument from '@/components/EstimatePdfDocument';

export default function ClientEstimatePortal() {
  const params = useParams();
  const id = params?.id as string;

  const [estimate, setEstimate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/estimates/${id}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.data) {
          setEstimate(d.data);
          if (d.data.status === 'accepted') setAccepted(true);
          if (d.data.status === 'declined') setDeclined(true);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAccept = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/estimates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'convert_to_job' }),
      });
      const data = await res.json();
      if (data.success) {
        setAccepted(true);
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async () => {
    setSubmitting(true);
    try {
      await fetch(`/api/estimates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'declined' }),
      });
      setDeclined(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-400 text-sm">
        Loading estimate document...
      </div>
    );
  }

  const est = estimate || {
    customerName: 'Valued Client',
    estimateNumber: 'EST-2026-001',
    items: [
      {
        service: 'Vinyl Siding Soft Wash (House Wash)',
        description: 'Eco-friendly biodegradable detergent and low-pressure spotless rinse',
        quantity: 1,
        unitPrice: 280,
        total: 280,
      },
      {
        service: 'Gutter Cleaning & Downspout Flush',
        description: 'Hand removal of leaves & debris + high volume downspout flow test',
        quantity: 1,
        unitPrice: 220,
        total: 220,
      },
    ],
    subtotal: 500,
    tax: 25,
    total: 525,
    expiryDate: new Date(),
  };

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-3 sm:px-6 print:bg-white print:p-0">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="max-w-[850px] mx-auto mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Official Estimate #{est.estimateNumber}</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500">H&amp;H House Maintenance Ltd.</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end w-full sm:w-auto">
          {/* Print / Save PDF Button */}
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Download / Print PDF</span>
          </button>

          {!accepted && !declined ? (
            <>
              <button
                onClick={handleDecline}
                disabled={submitting}
                className="px-3 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition cursor-pointer"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve &amp; Schedule Job</span>
              </button>
            </>
          ) : accepted ? (
            <div className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Quote Accepted! Job is Scheduled.</span>
            </div>
          ) : (
            <div className="px-4 py-2 rounded-xl bg-rose-100 text-rose-800 text-xs font-bold flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Estimate Declined</span>
            </div>
          )}
        </div>
      </div>

      {/* Render Official PDF Layout */}
      <div className="max-w-[850px] mx-auto rounded-3xl overflow-hidden shadow-xl print:shadow-none print:max-w-none">
        <EstimatePdfDocument estimate={est} customer={est.customer} />
      </div>
    </div>
  );
}
