'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Printer, ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react';
import EstimatePdfDocument from '@/components/EstimatePdfDocument';

export default function InvoiceStandalonePdfPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [invoice, setInvoice] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/invoices/${id}`).then((r) => r.json()),
      fetch('/api/settings').then((r) => r.json()),
    ])
      .then(([invData, setData]) => {
        if (invData.data) setInvoice(invData.data);
        if (setData.data) setSettings(setData.data);
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
        <span>Preparing high-resolution Invoice PDF document...</span>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 text-slate-700 text-sm space-y-3">
        <p className="font-bold text-base">Invoice not found.</p>
        <button
          onClick={() => router.push('/invoices')}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          Back to Invoices
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200 py-3 sm:py-6 px-2 sm:px-4 print:bg-white print:p-0 print:m-0 print:min-h-0">
      {/* Top Floating Controls (Hidden during print / save to PDF) */}
      <div className="max-w-[850px] mx-auto mb-4 bg-slate-900 text-white p-3 sm:p-3.5 px-3.5 sm:px-5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 print:hidden">
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={() => router.push('/invoices')}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition cursor-pointer shrink-0"
            title="Back to Invoices"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
              <span>Invoice PDF Document</span>
              <span className="font-mono text-purple-400">({invoice.invoiceNumber})</span>
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              Customer: {invoice.customerName}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap justify-end w-full sm:w-auto shrink-0">
          <a
            href={`/portal/invoice/${invoice._id}`}
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
      <div className="max-w-[850px] mx-auto shadow-2xl rounded-2xl overflow-x-auto print:overflow-visible print:shadow-none print:max-w-none print:w-full print:rounded-none">
        <EstimatePdfDocument
          estimate={invoice}
          customer={invoice.customer}
          settings={settings}
        />
      </div>
    </div>
  );
}
