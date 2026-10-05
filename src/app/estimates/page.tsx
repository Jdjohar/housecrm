'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  DollarSign,
  User,
  Calendar,
  Sparkles,
  ArrowRight,
  RefreshCw,
  X,
  Trash2,
  Wrench,
  Grid3X3,
  Mail,
  Printer,
  Eye,
  Download,
} from 'lucide-react';
import EstimatePdfDocument from '@/components/EstimatePdfDocument';

export default function EstimatesPage() {
  const [estimates, setEstimates] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [catalogServices, setCatalogServices] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // PDF Preview Modal state
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [selectedPdfEstimate, setSelectedPdfEstimate] = useState<any>(null);

  // Email Send Modal state
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedEmailEstimate, setSelectedEmailEstimate] = useState<any>(null);
  const [targetEmail, setTargetEmail] = useState('');
  const [emailNote, setEmailNote] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  // Roof Matrix Calculator sub-modal inside Estimate builder
  const [isRoofCalcOpen, setIsRoofCalcOpen] = useState(false);
  const [roofSize, setRoofSize] = useState<'small' | 'medium' | 'large' | 'xLarge'>('medium');
  const [roofStories, setRoofStories] = useState<'oneStory' | 'twoStory' | 'threeStory'>('twoStory');

  // New Estimate state
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [items, setItems] = useState([
    { service: 'Gutter Cleaning & Downspout Flush', description: 'Complete debris removal', quantity: 1, unitPrice: 220, total: 220 },
    { service: 'Vinyl Siding Soft Wash (House Wash)', description: 'Low pressure eco wash', quantity: 1, unitPrice: 280, total: 280 },
  ]);
  const [notes, setNotes] = useState('Thank you for choosing H&H House Maintenance (hnhpros.ca). Estimate valid for 30 days.');

  const fetchEstimates = async () => {
    setLoading(true);
    try {
      const [estRes, custRes, svcRes, setRes] = await Promise.all([
        fetch('/api/estimates'),
        fetch('/api/customers'),
        fetch('/api/services'),
        fetch('/api/settings'),
      ]);
      const estData = await estRes.json();
      const custData = await custRes.json();
      const svcData = await svcRes.json();
      const setData = await setRes.json();

      if (estData.data) setEstimates(estData.data);
      if (custData.data) {
        setCustomers(custData.data);
        if (custData.data.length > 0 && !selectedCustomerId) {
          setSelectedCustomerId(custData.data[0]._id);
        }
      }
      if (svcData.data) setCatalogServices(svcData.data);
      if (setData.data) setSettings(setData.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimates();
  }, []);

  const handleSendEstimate = async (id: string) => {
    try {
      const res = await fetch(`/api/estimates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_estimate' }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice('Estimate Sent Notification (SMS #1) dispatched to client!');
        setTimeout(() => setActionNotice(null), 3500);
        fetchEstimates();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEmailModal = (est: any) => {
    setSelectedEmailEstimate(est);
    setTargetEmail(est.customerEmail || '');
    setEmailNote(`Hi ${est.customerName?.split(' ')[0] || 'there'}, please find your customized estimate attached. Let us know if you have any questions!`);
    setIsEmailModalOpen(true);
  };

  const handleSendEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmailEstimate) return;
    setSendingEmail(true);

    try {
      const res = await fetch(`/api/estimates/${selectedEmailEstimate._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_email',
          customEmail: targetEmail,
          customNote: emailNote,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsEmailModalOpen(false);
        setActionNotice(`Estimate #${selectedEmailEstimate.estimateNumber} successfully sent to ${targetEmail}!`);
        setTimeout(() => setActionNotice(null), 4000);
        fetchEstimates();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleOpenPdfModal = (est: any) => {
    const cust = customers.find((c) => c._id === est.customerId) || est.customer;
    setSelectedPdfEstimate({ ...est, customer: cust });
    setIsPdfModalOpen(true);
  };

  const handleSendReminder = async (id: string) => {
    try {
      const res = await fetch(`/api/estimates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_reminder' }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice('Follow-up Reminder (SMS #2: "Just following up on your estimate") dispatched!');
        setTimeout(() => setActionNotice(null), 3500);
        fetchEstimates();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConvertToJob = async (id: string) => {
    try {
      const res = await fetch(`/api/estimates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'convert_to_job' }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice('Estimate converted into Scheduled Job!');
        setTimeout(() => setActionNotice(null), 3500);
        fetchEstimates();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const calculateSubtotal = () => items.reduce((sum, item) => sum + (item.total || 0), 0);
  const calculateTax = () => {
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
          description: presetSvc.description || '',
          quantity: 1,
          unitPrice: presetSvc.price || presetSvc.defaultPrice || 200,
          total: presetSvc.price || presetSvc.defaultPrice || 200,
        },
      ]);
    } else {
      setItems([
        ...items,
        {
          service: 'Driveway Power Washing',
          description: 'Rotary scrub wash',
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

  const handleCreateEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      alert('Please select or create a customer first.');
      return;
    }

    try {
      const res = await fetch('/api/estimates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          items,
          subtotal: calculateSubtotal(),
          tax: calculateTax(),
          total: calculateTotal(),
          notes,
          status: 'sent',
          expiryDate: new Date(Date.now() + 30 * 24 * 3600 * 1000),
          sendSmsNow: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsNewModalOpen(false);
        setActionNotice('Estimate created & sent to customer with automated SMS!');
        setTimeout(() => setActionNotice(null), 3500);
        fetchEstimates();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Available services list from settings
  const availableServices = settings?.customServices?.length
    ? settings.customServices
    : catalogServices;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Estimates & Quotes Pipeline
          </h1>
          <p className="text-xs text-slate-500">
            Professional PDF Export, 1-Click Email Dispatch & Tiered Roof Matrix Pricing
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Estimate</span>
        </button>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Estimates List Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">All Quotes ({estimates.length})</h2>
          <button
            onClick={fetchEstimates}
            className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading estimates...</div>
          ) : estimates.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 space-y-2">
              <FileText className="w-8 h-8 mx-auto text-slate-300" />
              <div>No estimates created yet.</div>
              <button
                onClick={() => setIsNewModalOpen(true)}
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                + Create your first estimate
              </button>
            </div>
          ) : (
            estimates.map((est) => (
              <div
                key={est._id}
                className="p-5 hover:bg-slate-50/70 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-base">{est.customerName}</span>
                    <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      {est.estimateNumber}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
                        est.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : est.status === 'sent'
                          ? 'bg-blue-100 text-blue-800'
                          : est.status === 'declined'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {est.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 font-medium">
                    {est.items?.map((i: any) => `${i.service} ($${(Number(i.total) || 0).toFixed(2)})`).join(' • ')}
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-3 flex-wrap">
                    <span>Created: {new Date(est.createdAt).toLocaleDateString()}</span>
                    {est.sentAt && (
                      <span className="text-blue-600 font-semibold">
                        ✓ Sent SMS #1 ({new Date(est.sentAt).toLocaleDateString()})
                      </span>
                    )}
                    {est.emailSentAt && (
                      <span className="text-purple-600 font-semibold">
                        ✓ Email Sent ({new Date(est.emailSentAt).toLocaleDateString()})
                      </span>
                    )}
                    {est.reminderSentAt && (
                      <span className="text-indigo-600 font-semibold">
                        ✓ Follow-up Reminder Sent
                      </span>
                    )}
                  </div>
                </div>

                {/* Pricing & Quick Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-row items-start sm:items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 w-full lg:w-auto">
                  <div className="text-left sm:text-right">
                    <div className="text-[10px] sm:text-xs text-slate-400 font-medium">Total Amount</div>
                    <div className="text-base sm:text-lg font-black text-slate-900">${(Number(est.total) || 0).toFixed(2)}</div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap w-full sm:w-auto">
                    {/* View / Export PDF Button */}
                    <button
                      onClick={() => handleOpenPdfModal(est)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                      title="Quick Preview PDF Modal"
                    >
                      <Printer className="w-3.5 h-3.5 text-blue-300" />
                      <span>PDF Preview</span>
                    </button>

                    {/* Direct Full-Page PDF Download Tab */}
                    <a
                      href={`/estimates/${est._id}/pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Direct Full-Page PDF Download & Print"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </a>

                    {/* Send Email Button */}
                    <button
                      onClick={() => handleOpenEmailModal(est)}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      title="Send Estimate via Email"
                    >
                      <Mail className="w-3.5 h-3.5 text-purple-600" />
                      <span>Send Email</span>
                    </button>

                    {/* Client Portal Link */}
                    <a
                      href={`/portal/estimate/${est._id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1"
                    >
                      <span>Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    {est.status !== 'accepted' && (
                      <>
                        <button
                          onClick={() => handleSendReminder(est._id)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          title="Trigger SMS #2: Just following up on your H&H estimate"
                        >
                          <Send className="w-3 h-3" />
                          <span>SMS</span>
                        </button>

                        <button
                          onClick={() => handleConvertToJob(est._id)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Convert to Job</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* PDF Export & Preview Modal */}
      {isPdfModalOpen && selectedPdfEstimate && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-6 space-y-4 my-6 animate-in fade-in zoom-in-95">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Estimate PDF Document ({selectedPdfEstimate.estimateNumber})
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Client: {selectedPdfEstimate.customerName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href={`/estimates/${selectedPdfEstimate._id}/pdf`}
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
                  <span>Print / Save as PDF</span>
                </button>

                <button
                  onClick={() => setIsPdfModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Render */}
            <div className="max-h-[75vh] overflow-y-auto p-3 bg-slate-100 rounded-2xl">
              <EstimatePdfDocument
                estimate={selectedPdfEstimate}
                customer={selectedPdfEstimate.customer}
                settings={settings}
              />
            </div>
          </div>
        </div>
      )}

      {/* Send Email Modal */}
      {isEmailModalOpen && selectedEmailEstimate && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Send Estimate via Email
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Estimate #{selectedEmailEstimate.estimateNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendEmailSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Recipient Email Address:
                </label>
                <input
                  type="email"
                  required
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Email Subject Line:
                </label>
                <input
                  type="text"
                  readOnly
                  value={`Your H&H House Maintenance Estimate #${selectedEmailEstimate.estimateNumber} is Ready`}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Custom Message / Note to Client:
                </label>
                <textarea
                  rows={3}
                  value={emailNote}
                  onChange={(e) => setEmailNote(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-slate-700 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-[11px] text-purple-900 leading-relaxed">
                ✉️ The client will receive an official branded email with the estimate breakdown, PDF link, and 1-Click online approval button.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingEmail || !targetEmail}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sendingEmail ? 'Sending...' : 'Send Estimate Email'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Estimate Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-hidden">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Top Fixed Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Create Estimate for H&amp;H Client</h3>
                <p className="text-xs text-slate-400">
                  Pick services with live search or calculate tiered Roof Cleaning rates
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
            <form onSubmit={handleCreateEstimate} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Select Customer</label>
                  {customers.length === 0 ? (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                      No customers found. Please go to the <strong>Customers</strong> tab to add a customer first!
                    </div>
                  ) : (
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {customers.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name} — {c.address}, {c.city} ({c.phone})
                        </option>
                      ))}
                    </select>
                  )}
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

                    {/* Search Bar */}
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

                    {/* Filtered Services Badges / Grid */}
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

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {items.map((item, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                          <div className="sm:col-span-6">
                            <input
                              type="text"
                              value={item.service}
                              onChange={(e) => handleItemChange(idx, 'service', e.target.value)}
                              placeholder="Service name"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-xs"
                            />
                          </div>
                          <div className="sm:col-span-6 flex items-center gap-2">
                            <div className="w-20">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                placeholder="Qty"
                                className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                              />
                            </div>
                            <div className="flex-1">
                              <input
                                type="number"
                                min="0"
                                value={item.unitPrice}
                                onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                                placeholder="Price ($)"
                                className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 active:scale-95 transition cursor-pointer shrink-0 tap-target flex items-center justify-center"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Description input */}
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
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold">${(Number(calculateSubtotal()) || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST ({settings?.gstRate || 5}%):</span>
                    <span>${(Number(calculateTax()) || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
                    <span>Total Quote:</span>
                    <span className="text-blue-600">${(Number(calculateTotal()) || 0).toFixed(2)}</span>
                  </div>
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
                  <span>Generate &amp; Send Estimate SMS</span>
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
                Add to Estimate Items
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
