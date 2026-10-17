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
  Search,
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

  // Delete Confirmation state
  const [deleteConfirmEstimate, setDeleteConfirmEstimate] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [items, setItems] = useState([
    {
      service: 'Roof cleaning, gutters included',
      description: 'Hand removal of debris & downspout flow test',
      quantity: 1,
      unitPrice: 350,
      total: 350,
    },
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
      setItems((prev) => [
        ...prev,
        {
          service: presetSvc.name,
          description: presetSvc.description || `Standard ${presetSvc.name}`,
          quantity: 1,
          unitPrice: presetSvc.price || presetSvc.defaultPrice || 200,
          total: presetSvc.price || presetSvc.defaultPrice || 200,
        },
      ]);
    } else {
      setItems((prev) => [
        ...prev,
        {
          service: 'Custom Service',
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
    if (field === 'unitPrice') {
      current.quantity = 1;
      current.total = Number(value) || 0;
    } else if (field === 'quantity') {
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

  // Standard services
  const defaultServices = [
    { name: 'Roof cleaning, gutters included', price: 350, unit: 'per job' },
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

  const availableServices = settings?.customServices?.length
    ? [
        ...(settings.customServices.some((s: any) => s.name?.toLowerCase().includes('roof cleaning'))
          ? []
          : [{ name: 'Roof cleaning, gutters included', price: 350, unit: 'per job' }]),
        ...settings.customServices,
      ]
    : defaultServices;

  const filteredCustomers = customers.filter((c) => {
    if (!customerSearchQuery.trim()) return true;
    const q = customerSearchQuery.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.address?.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q)
    );
  });

  const selectedCustomerObj = customers.find((c) => c._id === selectedCustomerId);

  const isServiceMatch = (itemSvc: string, svcName: string) => {
    if (!itemSvc || !svcName) return false;
    const s1 = itemSvc.toLowerCase().replace(/[^a-z0-9]/g, '');
    const s2 = svcName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return s1 === s2 || s1.includes(s2) || s2.includes(s1);
  };

  const toggleService = (svc: any) => {
    const isSelected = items.some((it: any) => isServiceMatch(it.service, svc.name));
    if (isSelected) {
      setItems(items.filter((it: any) => !isServiceMatch(it.service, svc.name)));
    } else {
      if (items.length === 1 && (!items[0].service || items[0].service === 'Custom Service' || items[0].service === 'Custom Maintenance Service' || items[0].service === 'Driveway Power Washing')) {
        setItems([
          {
            service: svc.name,
            description: svc.description || `Standard ${svc.name}`,
            quantity: 1,
            unitPrice: svc.price || svc.defaultPrice || 200,
            total: svc.price || svc.defaultPrice || 200,
          },
        ]);
      } else {
        handleAddItem(svc);
      }
    }
  };

  // Delete estimate with user confirmation
  const handleDeleteEstimate = async () => {
    if (!deleteConfirmEstimate) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/estimates/${deleteConfirmEstimate._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setDeleteConfirmEstimate(null);
        setActionNotice(`Estimate #${deleteConfirmEstimate.estimateNumber} deleted successfully.`);
        setTimeout(() => setActionNotice(null), 3500);
        fetchEstimates();
      } else {
        alert(data.error || 'Failed to delete estimate');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete estimate');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="space-y-6 print:hidden">
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

                    {/* Delete Estimate Button */}
                    <button
                      onClick={() => setDeleteConfirmEstimate(est)}
                      className="p-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition flex items-center justify-center cursor-pointer"
                      title="Delete Estimate"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>



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
                {/* 1. CUSTOMER SELECTION WITH SEARCH & PREVIEW */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      Select Customer
                    </label>
                    {customers.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        {customers.length} total customers
                      </span>
                    )}
                  </div>

                  {/* Customer Search Input */}
                  <div className="relative mb-1.5">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      value={customerSearchQuery}
                      onChange={(e) => setCustomerSearchQuery(e.target.value)}
                      placeholder="Search by name, phone, or address..."
                      className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none transition placeholder:text-slate-400 font-medium"
                    />
                    {customerSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setCustomerSearchQuery('')}
                        className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold p-0.5 cursor-pointer"
                        title="Clear search"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {customers.length === 0 ? (
                    <div className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                      No customers found. Add a customer first in Customers page.
                    </div>
                  ) : filteredCustomers.length === 0 ? (
                    <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                      <span>No customer matches &quot;{customerSearchQuery}&quot;</span>
                      <button
                        type="button"
                        onClick={() => setCustomerSearchQuery('')}
                        className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                      >
                        Show all
                      </button>
                    </div>
                  ) : (
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">-- Choose Customer ({filteredCustomers.length}) --</option>
                      {filteredCustomers.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name} — {c.phone || c.email} ({c.city || 'BC'})
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Selected Customer Details Preview Pill */}
                  {selectedCustomerObj && (
                    <div className="mt-2 p-2 px-3 bg-blue-50/70 border border-blue-200/60 rounded-xl text-[11px] text-slate-700 flex items-center justify-between">
                      <div className="truncate">
                        <span className="font-bold text-blue-900">{selectedCustomerObj.name}</span>
                        {selectedCustomerObj.phone && (
                          <span className="text-slate-600 ml-1.5 font-medium">• {selectedCustomerObj.phone}</span>
                        )}
                        {selectedCustomerObj.address && (
                          <span className="text-slate-500 ml-1.5">• {selectedCustomerObj.address}, {selectedCustomerObj.city}</span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md shrink-0 ml-2">
                        Selected
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. LINE ITEMS & SERVICES */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  {/* SERVICES PILLS CARD (STYLE MATCHING INVOICE & BOOKING PAGE) */}
                  <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black tracking-wider text-slate-500 uppercase">
                        SERVICES
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setIsRoofCalcOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] transition cursor-pointer"
                        >
                          🏠 Roof Matrix
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddItem()}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] transition cursor-pointer"
                        >
                          + Custom Service
                        </button>
                      </div>
                    </div>

                    {/* Pills Flex Wrap - Selected dark navy blue, unselected white with outline */}
                    <div className="flex flex-wrap gap-2 sm:gap-2.5 pt-1">
                      {availableServices.map((svc: any, idx: number) => {
                        const isSelected = items.some((it: any) =>
                          isServiceMatch(it.service, svc.name)
                        );
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => toggleService(svc)}
                            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition cursor-pointer select-none text-left active:scale-95 ${
                              isSelected
                                ? 'bg-[#182848] text-white shadow-xs'
                                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {svc.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected Items Breakdown */}
                  {items.length > 0 && (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Selected Scope &amp; Pricing Breakdown ({items.length} item{items.length > 1 ? 's' : ''})
                      </div>
                      {items.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              value={item.service}
                              onChange={(e) => handleItemChange(idx, 'service', e.target.value)}
                              placeholder="Service name"
                              className="flex-1 font-bold text-slate-900 border-b border-transparent focus:border-blue-500 outline-none"
                            />
                            {items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="text-slate-300 hover:text-rose-500 cursor-pointer p-0.5"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                            placeholder="Description"
                            className="w-full text-[11px] text-slate-500 border-b border-transparent focus:border-blue-500 outline-none"
                          />

                          <div className="flex items-center justify-between gap-2 text-[11px] pt-1 border-t border-slate-100">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-600">Price:</span>
                              <div className="flex items-center">
                                <span className="text-slate-400 font-bold mr-1">$</span>
                                <input
                                  type="number"
                                  value={item.unitPrice}
                                  onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                                  className="w-24 px-2 py-0.5 rounded border border-slate-200 text-slate-900 font-bold outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                            <div className="font-black text-slate-900 text-xs">
                              ${(Number(item.total) || Number(item.unitPrice) || 0).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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

      {/* DELETE ESTIMATE CONFIRMATION MODAL */}
      {deleteConfirmEstimate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-slate-900">
                  Delete Estimate #{deleteConfirmEstimate.estimateNumber}?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to permanently delete this estimate for <strong className="text-slate-800">{deleteConfirmEstimate.customerName}</strong> (Total: ${Number(deleteConfirmEstimate.total || 0).toFixed(2)})? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 font-medium">
              ⚠️ Warning: Deleting this estimate will remove all quoted line items and its customer preview portal link.
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteConfirmEstimate(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteEstimate}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete Estimate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* PDF Export & Preview Modal */}
      {isPdfModalOpen && selectedPdfEstimate && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 sm:py-8 overflow-y-auto print:p-0 print:m-0 print:static print:bg-white print:backdrop-blur-none print:overflow-visible print:block">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full p-3 sm:p-6 space-y-3 sm:space-y-4 my-auto animate-in fade-in zoom-in-95 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none print:w-full print:rounded-none print:transform-none print:animate-none">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-slate-100 pb-3 print:hidden sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate">
                    Estimate PDF Document ({selectedPdfEstimate.estimateNumber})
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate">
                    Client: {selectedPdfEstimate.customerName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end shrink-0">
                <a
                  href={`/estimates/${selectedPdfEstimate._id}/pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  title="Open Full PDF Tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline sm:inline">Full Tab</span>
                  <span className="xs:hidden sm:hidden">Tab</span>
                </a>

                <button
                  onClick={() => window.print()}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md flex items-center gap-1.5 cursor-pointer"
                  title="Download / Print PDF"
                >
                  <Printer className="w-4 h-4" />
                  <span>Download / Print</span>
                </button>

                <button
                  onClick={() => setIsPdfModalOpen(false)}
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
                  title="Close Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Render */}
            <div className="max-h-[75vh] overflow-y-auto overflow-x-auto p-1.5 sm:p-3 bg-slate-100 rounded-xl sm:rounded-2xl print:max-h-none print:overflow-visible print:p-0 print:bg-white print:rounded-none">
              <EstimatePdfDocument
                estimate={selectedPdfEstimate}
                customer={selectedPdfEstimate.customer}
                settings={settings}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
