'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  CreditCard,
  CheckCircle2,
  Lock,
  Star,
  ExternalLink,
  ShieldCheck,
  Building2,
  DollarSign,
  ArrowRight,
  Clock,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ClientInvoicePortal() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  // Mock checkout form
  const [cardName, setCardName] = useState('John Miller');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8912');
  const [exp, setExp] = useState('08/28');
  const [cvc, setCvc] = useState('849');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/invoices/${id}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.data) {
          setInvoice(d.data);
          if (d.data.status === 'paid') setPaid(true);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaying(true);
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'record_payment',
          paymentMethod: 'Credit Card (Visa)',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPaid(true);
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-400 text-sm">
        Loading invoice...
      </div>
    );
  }

  const inv = invoice || {
    customerName: 'Valued Client',
    invoiceNumber: 'INV-2026-302',
    items: [
      { service: 'Driveway Pressure Washing', description: 'Rotary surface wash', quantity: 1, unitPrice: 220, total: 220 },
      { service: 'Window Cleaning', description: 'Exterior 18 panes', quantity: 1, unitPrice: 175, total: 175 },
    ],
    subtotal: 395,
    tax: 19.75,
    total: 414.75,
    dueDate: new Date(),
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-amber-400 flex items-center justify-center font-black text-white text-xl shadow-lg">
              H&H
            </div>
            <div>
              <h1 className="font-bold text-lg text-white">H&H House Maintenance</h1>
              <a
                href="https://hnhpros.ca/"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-300 hover:underline flex items-center gap-1"
              >
                hnhpros.ca <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-mono font-bold bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-400/30 inline-block">
              {inv.invoiceNumber}
            </span>
            <div className="text-xs text-slate-400 mt-1">
              Due Date: {new Date(inv.dueDate).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Billed To:</div>
              <div className="text-lg font-bold text-slate-900">{inv.customerName}</div>
            </div>
            <div>
              {paid ? (
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Paid in Full
                </span>
              ) : (
                <span className="text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full">
                  Payment Due
                </span>
              )}
            </div>
          </div>

          {/* Line items */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-2.5">Service Description</th>
                  <th className="py-2.5 text-center">Qty</th>
                  <th className="py-2.5 text-right">Price</th>
                  <th className="py-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inv.items?.map((item: any, i: number) => (
                  <tr key={i} className="text-slate-800">
                    <td className="py-3 pr-2">
                      <div className="font-bold text-sm text-slate-900">{item.service}</div>
                      {item.description && (
                        <div className="text-slate-500 mt-0.5">{item.description}</div>
                      )}
                    </td>
                    <td className="py-3 text-center font-medium">{item.quantity}</td>
                    <td className="py-3 text-right font-medium">${(Number(item.unitPrice) || 0).toFixed(2)}</td>
                    <td className="py-3 text-right font-bold">${(Number(item.total) || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2 text-xs max-w-xs ml-auto">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold">${(Number(inv.subtotal) || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST (5%):</span>
              <span>${(Number(inv.tax) || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>Amount Due:</span>
              <span className="text-purple-700">${(Number(inv.total) || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Card / Flow */}
          <div className="pt-4 border-t border-slate-200">
            {paid ? (
              <div className="p-6 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/50 border border-emerald-300 rounded-3xl text-center space-y-4 animate-in fade-in">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-emerald-950">Thank you for your payment!</h3>
                  <p className="text-xs text-emerald-800 max-w-md mx-auto">
                    Your receipt of ${(Number(inv.total) || 0).toFixed(2)} has been recorded. Sequence #7 (Receipt) was dispatched.
                  </p>
                </div>

                {/* Prompt Review Request */}
                <div className="p-4 bg-white/90 rounded-2xl border border-emerald-200 text-left max-w-md mx-auto space-y-2.5 shadow-xs">
                  <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                    How did we do?
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Please take 10 seconds to share your experience with H&H House Maintenance!
                  </p>
                  <a
                    href={`/review/${inv.customerId || inv._id}`}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                  >
                    <span>⭐ Rate Your Service Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePay} className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    Secure Card Checkout
                  </h3>
                  <span className="text-[11px] text-slate-500">256-Bit Encrypted</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Name on Card</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1">Expires</label>
                      <input
                        type="text"
                        value={exp}
                        onChange={(e) => setExp(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1">CVC</label>
                      <input
                        type="text"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={paying}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{paying ? 'Processing Payment...' : `Pay $${(Number(inv.total) || 0).toFixed(2)} Securely`}</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 p-4 text-center text-xs text-slate-500">
          H&H House Maintenance • (604) 555-0199 • info@hnhpros.ca
        </div>
      </div>
    </div>
  );
}
