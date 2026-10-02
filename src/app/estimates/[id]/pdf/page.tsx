'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Printer, ArrowLeft, Download, ExternalLink, RefreshCw } from 'lucide-react';
import EstimatePdfDocument from '@/components/EstimatePdfDocument';

export default function EstimateStandalonePdfPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [estimate, setEstimate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/estimates/${id}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.data) {
          setEstimate(d.data);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-400 text-sm space-x-2">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
        <span>Preparing high-resolution PDF document...</span>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 text-slate-700 text-sm space-y-3">
        <p className="font-bold text-base">Estimate not found.</p>
        <button
          onClick={() => router.push('/estimates')}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          Back to Estimates
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200 py-6 px-4 print:bg-white print:p-0 print:m-0">
      {/* Top Floating Controls (Hidden during print / save to PDF) */}
      <div className="max-w-[850px] mx-auto mb-4 bg-slate-900 text-white p-3.5 px-5 rounded-2xl shadow-xl flex items-center justify-between gap-4 print:hidden">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push('/estimates')}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition cursor-pointer"
            title="Back to Estimates"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Estimate PDF Export</span>
              <span className="font-mono text-blue-400">({estimate.estimateNumber})</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Customer: {estimate.customerName}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={`/portal/estimate/${estimate._id}`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-medium transition flex items-center gap-1"
          >
            <span>Client Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Download / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Full Sheet Document Container */}
      <div
        id="printable-estimate-doc"
        className="max-w-[850px] mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden print:shadow-none print:rounded-none print:max-w-none print:w-full print:m-0 print:p-0"
      >
        <EstimatePdfDocument estimate={estimate} customer={estimate.customer} />
      </div>
    </div>
  );
}
