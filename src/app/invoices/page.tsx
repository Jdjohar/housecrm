'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  ExternalLink,
  DollarSign,
  Star,
  RefreshCw,
  Sparkles,
  FileCheck,
  X,
  Trash2,
  Wrench,
  Grid3X3,
  Search,
  User,
  Calendar,
  Printer,
  FileText,
} from 'lucide-react';
import EstimatePdfDocument from '@/components/EstimatePdfDocument';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Record Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activePaymentInvoice, setActivePaymentInvoice] = useState<any | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number | string>('');
  const [paymentCollectedBy, setPaymentCollectedBy] = useState('Charanjeet Brar');
  const [paymentMethod, setPaymentMethod] = useState('Interac e-Transfer');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('Payment received and verified');
  const [sendReceiptNow, setSendReceiptNow] = useState(true);
  const [sendReviewRequestNow, setSendReviewRequestNow] = useState(true);

  // PDF Invoice Modal State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [selectedPdfInvoice, setSelectedPdfInvoice] = useState<any | null>(null);

  // New Invoice Modal state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [includeGst, setIncludeGst] = useState(true);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState(
    'Payment due upon receipt. E-transfer to info@hnhpros.ca or pay online securely.'
  );
  const [items, setItems] = useState([
    {
      service: 'Vinyl Siding Soft Wash (House Wash)',
      description: 'Exterior house wash and sanitization',
      quantity: 1,
      unitPrice: 280,
      total: 280,
    },
  ]);

  // Roof Matrix Calculator sub-modal
  const [isRoofCalcOpen, setIsRoofCalcOpen] = useState(false);
  const [roofSize, setRoofSize] = useState<'small' | 'medium' | 'large' | 'xLarge'>('medium');
  const [roofStories, setRoofStories] = useState<'oneStory' | 'twoStory' | 'threeStory'>('twoStory');

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const [invRes, custRes, setRes] = await Promise.all([
        fetch('/api/invoices'),
        fetch('/api/customers'),
        fetch('/api/settings'),
      ]);
      const invData = await invRes.json();
      const custData = await custRes.json();
      const setData = await setRes.json();

      if (invData.data) setInvoices(invData.data);
      if (custData.data) {
        setCustomers(custData.data);
        if (custData.data.length > 0 && !selectedCustomerId) {
          setSelectedCustomerId(custData.data[0]._id);
        }
      }
      if (setData.data) setSettings(setData.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const calculateSubtotal = () => items.reduce((sum, item) => sum + (item.total || 0), 0);
  const calculateTax = () => {
    if (!includeGst) return 0;
    const rate = settings?.gstRate !== undefined ? settings.gstRate / 100 : 0.05;
    return Number((calculateSubtotal() * rate).toFixed(2));
  };
  const calculateTotal = () => Number((calculateSubtotal() + calculateTax()).toFixed(2));

  const handleAddItem = (presetSvc?: any) => {
    if (presetSvc) {
      setItems([
        ...items,
        {
          service: presetSvc.name,
          description: presetSvc.description || `Standard ${presetSvc.name}`,
          quantity: 1,
          unitPrice: presetSvc.price || presetSvc.defaultPrice || 200,
          total: presetSvc.price || presetSvc.defaultPrice || 200,
        },
      ]);
    } else {
      setItems([
        ...items,
        {
          service: 'Custom Maintenance Service',
          description: 'Specialized property cleaning',
          quantity: 1,
          unitPrice: 150,
          total: 150,
        },
      ]);
    }
  };

  const handleApplyRoofMatrix = () => {
    const matrix = settings?.roofPricingMatrix || {
      small: { oneStory: 400, twoStory: 450, threeStory: 475 },
      medium: { oneStory: 425, twoStory: 500, threeStory: 550 },
      large: { oneStory: 550, twoStory: 575, threeStory: 625 },
      xLarge: { oneStory: 700, twoStory: 750, threeStory: 800 },
    };

    const sizeLabels: Record<string, string> = {
      small: 'Small (under 1,500 sq ft)',
      medium: 'Medium (1,500 to 2,500 sq ft)',
      large: 'Large (2,500 to 3,500 sq ft)',
      xLarge: 'X-Large (3,500 sq ft & up)',
    };

    const storyLabels: Record<string, string> = {
      oneStory: '1 Story',
      twoStory: '2 Story',
      threeStory: '3 Story',
    };

    const price = matrix[roofSize]?.[roofStories] || 500;
    const desc = `Roof cleaning (gutters included) for ${sizeLabels[roofSize]}, ${storyLabels[roofStories]}`;

    setItems([
      ...items,
      {
        service: 'Roof Cleaning (Gutters Included)',
        description: desc,
        quantity: 1,
        unitPrice: price,
        total: price,
      },
    ]);
    setIsRoofCalcOpen(false);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    const current = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      current.total = Number(current.quantity) * Number(current.unitPrice);
    }
    updated[index] = current;
    setItems(updated);
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      alert('Please select or create a customer first.');
      return;
    }

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          items,
          subtotal: calculateSubtotal(),
          includeGst,
          tax: calculateTax(),
          total: calculateTotal(),
          notes,
          dueDate: new Date(dueDate),
          status: 'sent',
          sendSmsNow: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsNewModalOpen(false);
        setActionNotice('Invoice created & SMS notification #6 dispatched to client!');
        setTimeout(() => setActionNotice(null), 3500);
        fetchInvoices();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Action #6: Send Invoice Notification ("Your invoice is ready.")
  const handleSendInvoice = async (id: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_invoice' }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice('Invoice Ready SMS #6 dispatched to client!');
        setTimeout(() => setActionNotice(null), 3500);
        fetchInvoices();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open Add Payment Modal
  const handleOpenPaymentModal = (inv: any) => {
    setActivePaymentInvoice(inv);
    const balance = inv.balanceDue !== undefined ? Number(inv.balanceDue) : Math.max(0, (Number(inv.total) || 0) - (Number(inv.amountPaid) || 0));
    setPaymentAmount(balance > 0 ? balance : Number(inv.total) || 0);
    setPaymentCollectedBy('Charanjeet Brar');
    setPaymentMethod('Interac e-Transfer');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentReference(`REC-${Date.now().toString().slice(-6)}`);
    setPaymentNotes('Payment received & logged');
    setSendReceiptNow(true);
    setSendReviewRequestNow(true);
    setIsPaymentModalOpen(true);
  };

  // Submit Payment Record
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePaymentInvoice) return;

    try {
      const res = await fetch(`/api/invoices/${activePaymentInvoice._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_payment',
          amount: Number(paymentAmount) || 0,
          collectedBy: paymentCollectedBy,
          paymentMethod,
          paymentDate,
          reference: paymentReference,
          notes: paymentNotes,
          sendReceiptNow,
          sendReviewRequestNow,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsPaymentModalOpen(false);
        setActionNotice(
          `Payment of $${Number(paymentAmount).toFixed(2)} recorded successfully! ${
            data.isFullyPaid ? 'Invoice is fully paid & 5★ Review sequence triggered.' : 'Partial payment logged.'
          }`
        );
        setTimeout(() => setActionNotice(null), 4500);
        fetchInvoices();
      } else {
        alert(data.error || 'Failed to record payment');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open PDF Invoice Modal
  const handleOpenPdfInvoice = (inv: any) => {
    const cust = customers.find((c) => c._id === inv.customerId) || {
      name: inv.customerName,
      phone: inv.customerPhone,
      email: inv.customerEmail,
      address: 'Property Address',
      city: 'Lower Mainland',
    };
    setSelectedPdfInvoice({
      ...inv,
      docType: 'invoice',
      customer: cust,
    });
    setIsPdfModalOpen(true);
  };

  // Available services from settings
  const availableServices = settings?.customServices || [
    { name: 'House soft wash', price: 280, unit: 'per job' },
    { name: 'Gutter cleaning only', price: 220, unit: 'per job' },
    { name: 'Window cleaning', price: 160, unit: 'per job' },
    { name: 'Driveway and concrete', price: 180, unit: 'per job' },
    { name: 'Deck and patio', price: 200, unit: 'per job' },
    { name: 'Siding wash', price: 250, unit: 'per job' },
    { name: 'Commercial wash', price: 450, unit: 'per job' },
    { name: 'Lawn mowing', price: 85, unit: 'per job' },
    { name: 'Hedge and bush trimming', price: 140, unit: 'per job' },
    { name: 'Tree trimming', price: 250, unit: 'per job' },
    { name: 'Yard cleanup', price: 190, unit: 'per job' },
    { name: 'Fence installation', price: 1200, unit: 'per job' },
    { name: 'Fence repair', price: 350, unit: 'per job' },
    { name: 'Gate installation', price: 400, unit: 'per job' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-600" />
            Invoices &amp; Payment Processing
          </h1>
          <p className="text-xs text-slate-500">
            Record payments with owner tracking, automated receipt delivery, and post-payment 5-Star review requests
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Invoice</span>
          </button>

          <button
            onClick={fetchInvoices}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
            title="Refresh Invoices"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Invoices List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">All Invoices ({invoices.length})</h2>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading invoices...</div>
          ) : invoices.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No invoices created yet. Click &quot;Create New Invoice&quot; to generate an invoice.
            </div>
          ) : (
            invoices.map((inv) => {
              const total = Number(inv.total) || 0;
              const paidAmount = Number(inv.amountPaid) || 0;
              const balanceDue = inv.balanceDue !== undefined ? Number(inv.balanceDue) : Math.max(0, total - paidAmount);
              const isPaid = inv.status === 'paid' || balanceDue <= 0.01;
              const isPartiallyPaid = inv.status === 'partially_paid' || (paidAmount > 0 && !isPaid);

              return (
                <div
                  key={inv._id}
                  className="p-5 hover:bg-slate-50/70 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-base">{inv.customerName}</span>
                      <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                        {inv.invoiceNumber}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800'
                            : isPartiallyPaid
                            ? 'bg-amber-100 text-amber-800'
                            : inv.status === 'sent'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isPaid ? 'PAID' : isPartiallyPaid ? 'PARTIALLY PAID' : inv.status?.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 font-medium">
                      {inv.items?.map((i: any) => `${i.service} ($${(Number(i.total) || 0).toFixed(2)})`).join(' • ')}
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-3 flex-wrap">
                      <span>Due: {new Date(inv.dueDate).toLocaleDateString()}</span>
                      {inv.paidAt && (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Paid in Full on {new Date(inv.paidAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Payment History Log */}
                    {inv.payments && inv.payments.length > 0 && (
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-[11px]">
                        <span className="font-bold text-slate-700 block">💳 Payment History:</span>
                        {inv.payments.map((p: any, idx: number) => (
                          <div key={idx} className="text-slate-600 flex items-center gap-1.5 flex-wrap">
                            <span className="text-emerald-700 font-bold">${Number(p.amount).toFixed(2)}</span>
                            <span>via <strong>{p.paymentMethod || 'e-Transfer'}</strong></span>
                            {p.collectedBy && <span className="text-slate-500">• (Received by: {p.collectedBy})</span>}
                            <span className="text-slate-400">on {new Date(p.paymentDate || p.createdAt).toLocaleDateString()}</span>
                            {p.reference && <span className="font-mono text-[10px] text-slate-400">[{p.reference}]</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions & Price */}
                  <div className="flex flex-col sm:flex-row lg:flex-row items-start sm:items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 w-full lg:w-auto">
                    <div className="text-left sm:text-right">
                      <div className="text-[10px] sm:text-xs text-slate-400 font-medium">Invoice Total</div>
                      <div className="text-base sm:text-lg font-black text-slate-900">${total.toFixed(2)}</div>
                      {paidAmount > 0 && (
                        <div className="text-[11px] font-bold text-emerald-700">
                          Paid: ${paidAmount.toFixed(2)} | Due: ${balanceDue.toFixed(2)}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap w-full sm:w-auto">
                      {/* PDF Invoice Button */}
                      <button
                        onClick={() => handleOpenPdfInvoice(inv)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="View &amp; Print Official PDF Invoice"
                      >
                        <span>PDF Invoice</span>
                      </button>

                      {/* Add Payment Button */}
                      {!isPaid && (
                        <button
                          onClick={() => handleOpenPaymentModal(inv)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                          title="Record full or partial payment with owner &amp; receipt tracking"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>+ Add Payment</span>
                        </button>
                      )}

                      <a
                        href={`/portal/invoice/${inv._id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1"
                        title="Open Customer Online Payment Link"
                      >
                        <span>Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      {!isPaid && (
                        <button
                          onClick={() => handleSendInvoice(inv._id)}
                          className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          title="Trigger SMS #6: Your invoice is ready"
                        >
                          <Send className="w-3 h-3" />
                          <span>Send SMS</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create New Invoice Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-hidden">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Top Fixed Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <div>
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  Create Direct Invoice
                </h3>
                <p className="text-xs text-slate-400">
                  Select customer, pick services with live search or Roof Matrix, and dispatch SMS.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleCreateInvoice} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
                {/* Customer Selector & Due Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      Select Customer:
                    </label>
                    {customers.length === 0 ? (
                      <div className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                        No customers found. Add a customer first in Customers page.
                      </div>
                    ) : (
                      <select
                        value={selectedCustomerId}
                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                      >
                        {customers.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name} — {c.phone || c.email}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      Payment Due Date:
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Service Line Items Controls & Searchable Standard Services */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-blue-600" />
                      Service Line Items
                    </label>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setIsRoofCalcOpen(true)}
                        className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Grid3X3 className="w-3.5 h-3.5" /> + Roof Matrix Calc
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddItem()}
                        className="text-xs text-slate-700 font-bold hover:bg-slate-100 flex items-center gap-1 border border-slate-200 px-2.5 py-1 rounded-lg bg-white cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> + Custom Blank Item
                      </button>
                    </div>
                  </div>

                  {/* Standard Services List with Live Search Bar */}
                  <div className="p-3 bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-2xl border border-blue-100 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Standard Services List (Click to Add):
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {availableServices.length} standard services configured
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search standard service (e.g. House wash, Gutter, Window, Siding, Fence...)"
                        value={serviceSearchQuery}
                        onChange={(e) => setServiceSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
                      />
                      <div className="absolute left-2.5 top-2 text-slate-400 pointer-events-none text-xs">
                        🔍
                      </div>
                      {serviceSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setServiceSearchQuery('')}
                          className="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                      {availableServices
                        .filter((svc: any) =>
                          svc.name.toLowerCase().includes(serviceSearchQuery.toLowerCase())
                        )
                        .map((svc: any, idx: number) => {
                          const price = svc.price || svc.defaultPrice || 200;
                          const unit = svc.unit || 'job';
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleAddItem(svc)}
                              className="group px-2.5 py-1 rounded-lg bg-white hover:bg-blue-600 border border-slate-200 hover:border-blue-600 text-slate-700 hover:text-white transition-all text-left flex items-center gap-1.5 shadow-2xs cursor-pointer"
                            >
                              <span className="text-xs font-semibold">{svc.name}</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 group-hover:bg-blue-500 text-blue-700 group-hover:text-white border border-blue-100 group-hover:border-blue-400">
                                ${price}
                              </span>
                              <span className="text-[10px] text-slate-400 group-hover:text-blue-100 font-normal">
                                /{unit}
                              </span>
                              <Plus className="w-3 h-3 text-blue-500 group-hover:text-white" />
                            </button>
                          );
                        })}
                      {availableServices.filter((svc: any) =>
                        svc.name.toLowerCase().includes(serviceSearchQuery.toLowerCase())
                      ).length === 0 && (
                        <div className="text-xs text-slate-400 py-1 italic">
                          No service matching &quot;{serviceSearchQuery}&quot; found. You can add a custom item above.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Line Items List */}
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {items.map((item, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-6">
                            <input
                              type="text"
                              value={item.service}
                              onChange={(e) => handleItemChange(idx, 'service', e.target.value)}
                              placeholder="Service name"
                              className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold"
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                              placeholder="Qty"
                              className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                            />
                          </div>
                          <div className="col-span-3">
                            <input
                              type="number"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                              placeholder="Price ($)"
                              className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                            />
                          </div>
                          <div className="col-span-1 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-slate-400 hover:text-rose-500 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                            placeholder="Service details / scope description..."
                            className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-[11px] text-slate-600"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold">${(Number(calculateSubtotal()) || 0).toFixed(2)}</span>
                  </div>

                  {/* GST Optional Toggle */}
                  <div className="flex items-center justify-between py-1 border-t border-b border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={includeGst}
                        onChange={(e) => setIncludeGst(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-[11px] font-bold text-slate-800">
                        Apply GST ({settings?.gstRate || 5}% Tax)
                      </span>
                    </label>
                    <span className="font-semibold text-slate-900">
                      ${(Number(calculateTax()) || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between font-bold text-sm text-slate-900 pt-0.5">
                    <span>Total Due:</span>
                    <span className="text-blue-600">${(Number(calculateTotal()) || 0).toFixed(2)}</span>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Invoice Notes &amp; Instructions:</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 shrink-0 rounded-b-3xl">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={customers.length === 0}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Create &amp; Send Invoice SMS</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Roof Matrix Calculator Modal */}
      {isRoofCalcOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Grid3X3 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900">Roof Cleaning Matrix Calculator</h3>
              </div>
              <button onClick={() => setIsRoofCalcOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">House Size (Square Footage):</label>
                <select
                  value={roofSize}
                  onChange={(e) => setRoofSize(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                >
                  <option value="small">Small (under 1,500 sq ft)</option>
                  <option value="medium">Medium (1,500 to 2,500 sq ft)</option>
                  <option value="large">Large (2,500 to 3,500 sq ft)</option>
                  <option value="xLarge">X-Large (3,500 sq ft & up)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Number of Stories:</label>
                <select
                  value={roofStories}
                  onChange={(e) => setRoofStories(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                >
                  <option value="oneStory">1 Story</option>
                  <option value="twoStory">2 Story</option>
                  <option value="threeStory">3 Story</option>
                </select>
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between font-bold text-indigo-950">
                <span>Calculated Price (Gutters included):</span>
                <span className="text-base text-indigo-700">
                  ${settings?.roofPricingMatrix?.[roofSize]?.[roofStories] || 500}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRoofCalcOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyRoofMatrix}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-md cursor-pointer"
              >
                Add to Invoice Items
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECORD / ADD PAYMENT MODAL */}
      {isPaymentModalOpen && activePaymentInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-hidden">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    Record Payment ({activePaymentInvoice.invoiceNumber})
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Customer: <strong className="text-slate-700">{activePaymentInvoice.customerName}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitPayment} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
                {/* Summary Banner */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-3 gap-2 text-center">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Invoice Total</span>
                    <span className="text-sm font-black text-slate-900">
                      ${(Number(activePaymentInvoice.total) || 0).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Already Paid</span>
                    <span className="text-sm font-black text-emerald-700">
                      ${(Number(activePaymentInvoice.amountPaid) || 0).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Remaining Due</span>
                    <span className="text-sm font-black text-blue-700">
                      ${(activePaymentInvoice.balanceDue !== undefined ? Number(activePaymentInvoice.balanceDue) : Math.max(0, (Number(activePaymentInvoice.total) || 0) - (Number(activePaymentInvoice.amountPaid) || 0))).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Payment Amount */}
                <div>
                  <label className="font-bold text-slate-800 block mb-1 text-xs">
                    Payment Amount ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-white font-black text-base text-emerald-950 focus:ring-2 focus:ring-emerald-500"
                    placeholder="0.00"
                  />
                </div>

                {/* Received By / Held By (Owner) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                      Received / Held By (Owner) *
                    </label>
                    <select
                      value={paymentCollectedBy}
                      onChange={(e) => setPaymentCollectedBy(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 text-xs focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Charanjeet Brar">👤 Charanjeet Brar (604-781-0546)</option>
                      <option value="Manpreet Gill">👤 Manpreet Gill (778-829-5911)</option>
                      <option value="Company Bank (e-Transfer)">🏦 Company Bank (info@hnhpros.ca)</option>
                      <option value="Cash with Crew/Office">💵 Cash with Crew/Office</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                      Payment Method *
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Interac e-Transfer">Interac e-Transfer</option>
                      <option value="Cash">Cash</option>
                      <option value="Credit Card / Stripe">Credit Card (Stripe)</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Bank Direct Deposit">Bank Direct Deposit</option>
                    </select>
                  </div>
                </div>

                {/* Payment Date & Reference */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                      Payment Date
                    </label>
                    <input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                      Ref # / Transaction ID
                    </label>
                    <input
                      type="text"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="e.g. e-Transfer Ref, Cheque #104"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-xs"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                    Payment Notes:
                  </label>
                  <input
                    type="text"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="e.g. Deposit paid on site, final balance remaining..."
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-xs"
                  />
                </div>

                {/* Automated Notification Options */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sendReceiptNow}
                      onChange={(e) => setSendReceiptNow(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-[11px] font-semibold text-slate-800">
                      🧾 Send Official Payment Receipt SMS/Email to Customer
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sendReviewRequestNow}
                      onChange={(e) => setSendReviewRequestNow(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-[11px] font-semibold text-slate-800">
                      ⭐ Auto-trigger 5★ Google Review Request when balance reaches $0.00
                    </span>
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 shrink-0 rounded-b-3xl">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save &amp; Record Payment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF INVOICE MODAL */}
      {isPdfModalOpen && selectedPdfInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs overflow-y-auto flex justify-center items-start p-4 sm:p-6 sm:py-8">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 my-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 print:hidden sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Official Invoice ({selectedPdfInvoice.invoiceNumber})
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Customer: {selectedPdfInvoice.customerName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href={`/invoices/${selectedPdfInvoice._id}/pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full PDF Tab</span>
                </a>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Download / Print PDF</span>
                </button>
                <button
                  onClick={() => setIsPdfModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-3 bg-slate-100 rounded-2xl">
              <EstimatePdfDocument
                estimate={selectedPdfInvoice}
                customer={selectedPdfInvoice.customer}
                settings={settings}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
