'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Plus,
  Clock,
  MapPin,
  Flame,
  CheckCircle2,
  Send,
  User,
  ShieldCheck,
  RefreshCw,
  Sliders,
  AlertCircle,
  X,
  CreditCard,
  Phone,
  Mail,
  Building2,
  Sparkles,
  Trash2,
  Wrench,
  Grid3X3,
  Printer,
  FileText,
  DollarSign,
  Calendar,
} from 'lucide-react';
import EstimatePdfDocument from '@/components/EstimatePdfDocument';

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Live Crew Dispatch ETA Modal
  const [etaModalJob, setEtaModalJob] = useState<any | null>(null);
  const [etaMinutes, setEtaMinutes] = useState(25);

  // PDF Work Order Modal
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [selectedPdfJob, setSelectedPdfJob] = useState<any | null>(null);

  // New Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('existing');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  // Status & Financials
  const [bookingStatus, setBookingStatus] = useState<'scheduled' | 'reminder_sent' | 'en_route' | 'in_progress' | 'completed' | 'cancelled'>('scheduled');
  const [includeGst, setIncludeGst] = useState(true);
  const [depositPaid, setDepositPaid] = useState<number | string>(0);
  const [depositCollectedBy, setDepositCollectedBy] = useState('Charanjeet Brar');
  const [depositPaymentMethod, setDepositPaymentMethod] = useState('e-Transfer');
  const [jobCosts, setJobCosts] = useState<number | string>(0);

  // New Customer Fields (for on-the-fly creation)
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustCity, setNewCustCity] = useState('Surrey');
  const [newCustPostal, setNewCustPostal] = useState('V3W 3A1');
  const [newCustType, setNewCustType] = useState<'Residential' | 'Commercial' | 'Strata'>('Residential');

  // Schedule & Dispatch Fields
  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [scheduledTime, setScheduledTime] = useState('10:00 AM');
  const [durationHours, setDurationHours] = useState(2.5);
  const [assignedCrew, setAssignedCrew] = useState('H&H Lead Crew (Mike & Dave)');
  const [bookingNotes, setBookingNotes] = useState('Customer confirmed. Please check outdoor water connection.');
  const [customerNotes, setCustomerNotes] = useState('');
  const [sendConfirmationNow, setSendConfirmationNow] = useState(true);

  // Line items & Standard Services
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [items, setItems] = useState([
    {
      service: 'Gutter Cleaning & Downspout Flush',
      description: 'Hand removal of debris & downspout flow test',
      quantity: 1,
      unitPrice: 220,
      total: 220,
    },
  ]);

  // Roof Matrix Calculator Modal inside Booking
  const [isRoofCalcOpen, setIsRoofCalcOpen] = useState(false);
  const [roofSize, setRoofSize] = useState<'small' | 'medium' | 'large' | 'xLarge'>('medium');
  const [roofStories, setRoofStories] = useState<'oneStory' | 'twoStory' | 'threeStory'>('twoStory');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const [jobRes, custRes, setRes] = await Promise.all([
        fetch('/api/jobs'),
        fetch('/api/customers'),
        fetch('/api/settings'),
      ]);
      const jobData = await jobRes.json();
      const custData = await custRes.json();
      const setData = await setRes.json();

      if (jobData.data) setJobs(jobData.data);
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
    fetchJobs();
  }, []);

  const calculateSubtotal = () => items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  const calculateTax = () => {
    if (!includeGst) return 0;
    const rate = settings?.gstRate !== undefined ? settings.gstRate / 100 : 0.05;
    return Number((calculateSubtotal() * rate).toFixed(2));
  };
  const calculateTotal = () => Number((calculateSubtotal() + calculateTax()).toFixed(2));
  const calculateBalanceDue = () => {
    const total = calculateTotal();
    const deposit = Number(depositPaid) || 0;
    return Math.max(0, Number((total - deposit).toFixed(2)));
  };

  const handleAddItem = (presetSvc?: any, type: 'service' | 'cost' = 'service') => {
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
    } else if (type === 'cost') {
      setItems([
        ...items,
        {
          service: 'Extra Materials & Job Cost',
          description: 'Special equipment rental / disposal / dump fee',
          quantity: 1,
          unitPrice: 50,
          total: 50,
        },
      ]);
    } else {
      setItems([
        ...items,
        {
          service: 'Custom Maintenance Work',
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

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    let payload: any = {
      status: bookingStatus,
      scheduledDate,
      scheduledTime,
      durationHours: Number(durationHours) || 2.5,
      assignedCrew,
      notes: bookingNotes,
      customerNotes,
      items,
      subtotal: calculateSubtotal(),
      includeGst,
      tax: calculateTax(),
      totalAmount: calculateTotal(),
      depositPaid: Number(depositPaid) || 0,
      depositCollectedBy: Number(depositPaid) > 0 ? depositCollectedBy : '',
      depositPaymentMethod: Number(depositPaid) > 0 ? depositPaymentMethod : '',
      balanceDue: calculateBalanceDue(),
      jobCosts: Number(jobCosts) || 0,
      sendConfirmationNow,
    };

    if (customerMode === 'existing') {
      if (!selectedCustomerId) {
        alert('Please select an existing customer.');
        return;
      }
      payload.customerId = selectedCustomerId;
    } else {
      if (!newCustName || !newCustPhone) {
        alert('Please enter customer full name and phone number.');
        return;
      }
      payload.newCustomer = {
        name: newCustName,
        phone: newCustPhone,
        email: newCustEmail,
        address: newCustAddress,
        city: newCustCity,
        postalCode: newCustPostal,
        propertyType: newCustType,
      };
    }

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setIsBookingModalOpen(false);
        setActionNotice(
          `New Booking #${data.data.jobNumber} created successfully! ${
            sendConfirmationNow ? 'Confirmation SMS/Email dispatched.' : ''
          }`
        );
        setTimeout(() => setActionNotice(null), 4000);
        // Reset form
        setNewCustName('');
        setNewCustPhone('');
        setNewCustEmail('');
        setNewCustAddress('');
        setDepositPaid(0);
        setJobCosts(0);
        setBookingStatus('scheduled');
        setCustomerNotes('');
        fetchJobs();
      } else {
        alert(data.error || 'Failed to create booking');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Action #3: Send Day Before Job SMS
  const handleSendDayBefore = async (id: string) => {
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_day_before_reminder' }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice('Day-Before Job Reminder SMS dispatched to customer!');
        setTimeout(() => setActionNotice(null), 3500);
        fetchJobs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Action #4: Crew Leaving Dispatch
  const handleConfirmEnRoute = async () => {
    if (!etaModalJob) return;
    try {
      const res = await fetch(`/api/jobs/${etaModalJob._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_crew_en_route',
          etaMinutes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEtaModalJob(null);
        setActionNotice(`Crew On The Way SMS (ETA: ${etaMinutes} mins) dispatched!`);
        setTimeout(() => setActionNotice(null), 3500);
        fetchJobs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Action #5: Mark Job Completed
  const handleMarkCompleted = async (id: string, createInvoiceNow = true) => {
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark_completed',
          createInvoiceNow,
          completionNotes: 'All services completed per H&H quality checklist. Site cleaned and inspected.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice('Job completed! "Service Complete" SMS & Invoice generated and dispatched.');
        setTimeout(() => setActionNotice(null), 3500);
        fetchJobs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenPdfWorkOrder = (job: any) => {
    const cust = customers.find((c) => c._id === job.customerId) || {
      name: job.customerName,
      phone: job.customerPhone,
      email: job.customerEmail,
      address: job.address,
    };
    setSelectedPdfJob({
      ...job,
      estimateNumber: job.jobNumber,
      jobNumber: job.jobNumber,
      docType: 'job',
      subtotal: Number(job.subtotal) || Number(job.totalAmount) || 0,
      tax: Number(job.tax) || 0,
      total: Number(job.totalAmount) || 0,
      totalAmount: Number(job.totalAmount) || 0,
      depositPaid: Number(job.depositPaid) || 0,
      depositCollectedBy: job.depositCollectedBy || '',
      depositPaymentMethod: job.depositPaymentMethod || '',
      balanceDue:
        job.balanceDue !== undefined
          ? Number(job.balanceDue)
          : Math.max(0, (Number(job.totalAmount) || 0) - (Number(job.depositPaid) || 0)),
      customerNotes: job.customerNotes || '',
      notes: job.notes || 'Scheduled Job Work Order. Service guaranteed by H&H House Maintenance.',
      items:
        job.items?.length > 0
          ? job.items
          : job.services?.map((s: string) => ({
              service: s,
              description: 'Scheduled property maintenance service',
              quantity: 1,
              unitPrice: (Number(job.totalAmount) || 0) / (job.services?.length || 1),
              total: (Number(job.totalAmount) || 0) / (job.services?.length || 1),
            })),
      customer: cust,
    });
    setIsPdfModalOpen(true);
  };

  // Available standard services
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
            <CalendarCheck className="w-6 h-6 text-blue-600" />
            Bookings &amp; Live Dispatch Pipeline
          </h1>
          <p className="text-xs text-slate-500">
            Create new customer bookings, schedule crew, calculate prices &amp; trigger real-time dispatch sequences
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* New Booking Button */}
          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Booking</span>
          </button>

          <button
            onClick={fetchJobs}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
            title="Refresh pipeline"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Jobs Pipeline */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-3xl border">
            Loading scheduled bookings &amp; jobs...
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-3xl border space-y-2">
            <CalendarCheck className="w-8 h-8 mx-auto text-slate-300" />
            <div>No active bookings found.</div>
            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              + Create your first booking
            </button>
          </div>
        ) : (
          jobs.map((job) => {
            const isCompleted = job.status === 'completed';
            const isEnRoute = job.status === 'en_route';
            const hasDeposit = Number(job.depositPaid) > 0;
            const balanceDue = job.balanceDue !== undefined ? Number(job.balanceDue) : Math.max(0, (Number(job.totalAmount) || 0) - (Number(job.depositPaid) || 0));

            return (
              <div
                key={job._id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-base">{job.customerName}</span>
                      <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {job.jobNumber}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : isEnRoute
                            ? 'bg-orange-100 text-orange-800 animate-pulse-glow flex items-center gap-1'
                            : job.status === 'in_progress'
                            ? 'bg-amber-100 text-amber-800'
                            : job.status === 'reminder_sent'
                            ? 'bg-blue-100 text-blue-800'
                            : job.status === 'cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isEnRoute ? (
                          <>
                            <Flame className="w-3 h-3 text-orange-600" /> En Route (ETA: {job.etaMinutes || 25}m)
                          </>
                        ) : (
                          job.status?.toUpperCase() || 'SCHEDULED'
                        )}
                      </span>

                      {job.tax > 0 ? (
                        <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded">
                          5% GST
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          No GST
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 font-medium flex items-center gap-2 flex-wrap">
                      <span className="text-blue-700 font-semibold">{job.title}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <MapPin className="w-3 h-3" />
                        {job.address}
                      </span>
                    </div>

                    {/* Notes Snippet */}
                    {(job.notes || job.customerNotes) && (
                      <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-start gap-1.5">
                        <span className="font-bold text-slate-700">📝 Notes:</span>
                        <span className="text-slate-600 line-clamp-1">{job.notes || job.customerNotes}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xs text-slate-400 font-medium">Scheduled Booking</div>
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5 justify-end">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        {new Date(job.scheduledDate).toLocaleDateString()} @ {job.scheduledTime}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-400 font-medium">Total Value</div>
                      <div className="text-base font-black text-slate-900">
                        ${(Number(job.totalAmount) || 0).toFixed(2)}
                      </div>
                      {hasDeposit && (
                        <div className="text-[10px] text-emerald-700 font-bold">
                          Dep: ${(Number(job.depositPaid) || 0).toFixed(2)} {job.depositCollectedBy ? `(with ${job.depositCollectedBy}${job.depositPaymentMethod ? ` • ${job.depositPaymentMethod}` : ''})` : ''} | Due: ${balanceDue.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dispatch Controls & Work Order PDF */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
                  <div className="flex items-center gap-4 text-slate-500 flex-wrap">
                    <span className="font-semibold text-slate-700">Crew: {job.assignedCrew}</span>
                    <span>Duration: ~{job.durationHours || 2.5} hrs</span>
                    {job.jobCosts > 0 && (
                      <span className="text-slate-600">Cost: ${(Number(job.jobCosts) || 0).toFixed(2)}</span>
                    )}
                    {job.reminderSentAt && (
                      <span className="text-blue-600 font-semibold">✓ 24h Reminder Sent</span>
                    )}
                    {job.enRouteSentAt && (
                      <span className="text-orange-600 font-semibold">✓ Live ETA Dispatched</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Work Order PDF Button */}
                    <button
                      onClick={() => handleOpenPdfWorkOrder(job)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      title="View &amp; Print Official Work Order PDF"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span>PDF Work Order</span>
                    </button>

                    {!isCompleted && (
                      <>
                        {/* Day-Before Reminder */}
                        <button
                          onClick={() => handleSendDayBefore(job._id)}
                          className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          title="Trigger SMS #3: 24h day-before reminder"
                        >
                          <Send className="w-3 h-3" />
                          <span>24h Reminder</span>
                        </button>

                        {/* Crew Leaving Dispatch Button */}
                        <button
                          onClick={() => setEtaModalJob(job)}
                          className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shadow-sm flex items-center gap-1 cursor-pointer"
                          title="Trigger SMS #4: Our crew is on the way with Live ETA"
                        >
                          <Flame className="w-3 h-3" />
                          <span>Dispatch Crew (ETA)</span>
                        </button>

                        {/* Complete Job Button */}
                        <button
                          onClick={() => handleMarkCompleted(job._id)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-1 cursor-pointer"
                          title="Trigger SMS #5: Job completed &amp; Auto-generate invoice"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Complete &amp; Invoice</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE NEW BOOKING MODAL (2-COLUMN COMPACT LAYOUT) */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-hidden">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Top Fixed Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-slate-900">New Customer Booking &amp; Dispatch</h3>
                  <p className="text-[11px] text-slate-400">
                    Select customer, status, services, deposit &amp; schedule arrival time
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body - 2 Column Grid */}
            <form onSubmit={handleCreateBooking} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-xs">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
                  
                  {/* LEFT COLUMN: STATUS, CUSTOMER, SCHEDULE & NOTES */}
                  <div className="space-y-4">
                    {/* 1. STATUS & CUSTOMER INFORMATION */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <User className="w-4 h-4 text-blue-600" />
                          1. Customer &amp; Booking Status
                        </span>

                        <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[11px]">
                          <button
                            type="button"
                            onClick={() => setCustomerMode('existing')}
                            className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                              customerMode === 'existing'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            👤 Existing
                          </button>
                          <button
                            type="button"
                            onClick={() => setCustomerMode('new')}
                            className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer ${
                              customerMode === 'new'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            ➕ Add New
                          </button>
                        </div>
                      </div>

                      {/* Status Selector */}
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                          Booking Status:
                        </label>
                        <select
                          value={bookingStatus}
                          onChange={(e) => setBookingStatus(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="scheduled">🗓️ Scheduled (Confirmed)</option>
                          <option value="in_progress">⚡ In Progress</option>
                          <option value="en_route">🚚 Crew En Route</option>
                          <option value="reminder_sent">📩 Reminder Sent</option>
                          <option value="completed">✅ Completed</option>
                          <option value="cancelled">❌ Cancelled</option>
                        </select>
                      </div>

                      {customerMode === 'existing' ? (
                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                            Choose Customer:
                          </label>
                          {customers.length === 0 ? (
                            <div className="text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                              No customers saved yet. Please switch to &quot;➕ Add New&quot; above.
                            </div>
                          ) : (
                            <select
                              value={selectedCustomerId}
                              onChange={(e) => setSelectedCustomerId(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-xs focus:ring-2 focus:ring-blue-500"
                            >
                              {customers.map((c) => (
                                <option key={c._id} value={c._id}>
                                  {c.name} — {c.phone} | {c.address}, {c.city}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2.5 pt-1">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="font-semibold text-slate-700 block mb-0.5 text-[11px]">Full Name *</label>
                              <input
                                type="text"
                                required
                                value={newCustName}
                                onChange={(e) => setNewCustName(e.target.value)}
                                placeholder="John Smith"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                              />
                            </div>
                            <div>
                              <label className="font-semibold text-slate-700 block mb-0.5 text-[11px]">Phone Number *</label>
                              <input
                                type="text"
                                required
                                value={newCustPhone}
                                onChange={(e) => setNewCustPhone(e.target.value)}
                                placeholder="(604) 555-0199"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="font-semibold text-slate-700 block mb-0.5 text-[11px]">Email Address</label>
                            <input
                              type="email"
                              value={newCustEmail}
                              onChange={(e) => setNewCustEmail(e.target.value)}
                              placeholder="john@example.com"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                            />
                          </div>

                          <div className="grid grid-cols-12 gap-2">
                            <div className="col-span-7">
                              <label className="font-semibold text-slate-700 block mb-0.5 text-[11px]">Street Address</label>
                              <input
                                type="text"
                                value={newCustAddress}
                                onChange={(e) => setNewCustAddress(e.target.value)}
                                placeholder="1234 80th Ave"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                              />
                            </div>
                            <div className="col-span-5">
                              <label className="font-semibold text-slate-700 block mb-0.5 text-[11px]">City</label>
                              <input
                                type="text"
                                value={newCustCity}
                                onChange={(e) => setNewCustCity(e.target.value)}
                                placeholder="Surrey"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 2. BOOKING SCHEDULE & CREW */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        2. Schedule &amp; Crew Assignment
                      </span>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="font-semibold text-slate-700 block mb-0.5 text-[11px]">Service Date *</label>
                          <input
                            type="date"
                            required
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 block mb-0.5 text-[11px]">Arrival Time *</label>
                          <select
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-xs"
                          >
                            <option value="08:00 AM">08:00 AM</option>
                            <option value="09:00 AM">09:00 AM</option>
                            <option value="10:00 AM">10:00 AM</option>
                            <option value="11:30 AM">11:30 AM</option>
                            <option value="01:00 PM">01:00 PM</option>
                            <option value="02:30 PM">02:30 PM</option>
                            <option value="04:00 PM">04:00 PM</option>
                          </select>
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 block mb-0.5 text-[11px]">Duration</label>
                          <select
                            value={durationHours}
                            onChange={(e) => setDurationHours(Number(e.target.value))}
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-xs"
                          >
                            <option value="1.5">1.5 hrs</option>
                            <option value="2.0">2.0 hrs</option>
                            <option value="2.5">2.5 hrs</option>
                            <option value="3.0">3.0 hrs</option>
                            <option value="4.0">4.0 hrs</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 block mb-0.5 text-[11px]">Assigned Crew / Lead Tech:</label>
                        <select
                          value={assignedCrew}
                          onChange={(e) => setAssignedCrew(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-xs"
                        >
                          <option value="H&H Lead Crew (Mike & Dave)">H&H Lead Crew (Mike & Dave)</option>
                          {settings?.crewMembers?.map((c: any, i: number) => (
                            <option key={i} value={`${c.name} (${c.role || 'Tech'} - $${c.hourlyRate}/hr)`}>
                              {c.name} ({c.role || 'Tech'} — ${c.hourlyRate}/hr)
                            </option>
                          ))}
                          <option value="Crew Beta (Vancouver Central)">Crew Beta (Vancouver Central)</option>
                        </select>
                      </div>
                    </div>

                    {/* 3. NOTES SECTION */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-blue-600" />
                        3. Notes &amp; Special Instructions
                      </span>

                      <div>
                        <label className="font-semibold text-slate-700 block mb-0.5 text-[11px]">
                          Internal / Access Notes (Crew Gate Code, Pets, Parking):
                        </label>
                        <textarea
                          rows={2}
                          value={bookingNotes}
                          onChange={(e) => setBookingNotes(e.target.value)}
                          placeholder="Side gate code #1234, watch for pets in backyard, outdoor water tap is active..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium resize-none text-xs"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 block mb-0.5 text-[11px]">
                          Customer Scope Notes (Printed on Work Order / Receipt):
                        </label>
                        <textarea
                          rows={2}
                          value={customerNotes}
                          onChange={(e) => setCustomerNotes(e.target.value)}
                          placeholder="All services guaranteed per H&H quality checklist. Site rinsed and cleaned before departure."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium resize-none text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: SERVICES, PRICING, DEPOSIT & TOTALS */}
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Wrench className="w-4 h-4 text-blue-600" />
                          4. Services &amp; Extra Line Items
                        </span>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setIsRoofCalcOpen(true)}
                            className="text-[11px] font-bold px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 flex items-center gap-1 transition cursor-pointer"
                          >
                            <Grid3X3 className="w-3 h-3" /> + Roof Matrix
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAddItem(undefined, 'service')}
                            className="text-[11px] text-slate-700 font-bold hover:bg-slate-100 flex items-center gap-1 border border-slate-200 px-2 py-1 rounded-lg bg-white cursor-pointer"
                          >
                            <Plus className="w-3 h-3" /> + Custom Svc
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAddItem(undefined, 'cost')}
                            className="text-[11px] text-amber-800 font-bold bg-amber-50 hover:bg-amber-100 border border-amber-200 flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer"
                            title="Add extra item, rental equipment, material or dump fee"
                          >
                            <Plus className="w-3 h-3 text-amber-600" /> + Extra Cost/Item
                          </button>
                        </div>
                      </div>

                      {/* Searchable Standard Services Picker */}
                      <div className="space-y-2">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search standard service (House wash, Gutter, Window, Siding...)"
                            value={serviceSearchQuery}
                            onChange={(e) => setServiceSearchQuery(e.target.value)}
                            className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
                          />
                          <div className="absolute left-2.5 top-2 text-slate-400 pointer-events-none text-xs">
                            🔍
                          </div>
                        </div>

                        {/* Filtered Chips */}
                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                          {availableServices
                            .filter((svc: any) =>
                              svc.name.toLowerCase().includes(serviceSearchQuery.toLowerCase())
                            )
                            .map((svc: any, idx: number) => {
                              const price = svc.price || svc.defaultPrice || 200;
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleAddItem(svc)}
                                  className="group px-2 py-0.5 rounded-md bg-white hover:bg-blue-600 border border-slate-200 hover:border-blue-600 text-slate-700 hover:text-white transition-all text-left flex items-center gap-1 shadow-2xs cursor-pointer text-[11px]"
                                >
                                  <span className="font-semibold">{svc.name}</span>
                                  <span className="font-bold text-blue-700 group-hover:text-white">
                                    ${price}
                                  </span>
                                  <Plus className="w-2.5 h-2.5 text-blue-500 group-hover:text-white" />
                                </button>
                              );
                            })}
                        </div>
                      </div>

                      {/* Line Items List */}
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {items.map((item, idx) => (
                          <div key={idx} className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
                            <div className="grid grid-cols-12 gap-1.5 items-center">
                              <div className="col-span-6">
                                <input
                                  type="text"
                                  value={item.service}
                                  onChange={(e) => handleItemChange(idx, 'service', e.target.value)}
                                  placeholder="Service / Extra item name"
                                  className="w-full px-2 py-1 rounded-md border border-slate-300 bg-slate-50 font-semibold text-xs"
                                />
                              </div>
                              <div className="col-span-2">
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                  placeholder="Qty"
                                  className="w-full px-1.5 py-1 rounded-md border border-slate-300 bg-white text-xs text-center"
                                />
                              </div>
                              <div className="col-span-3">
                                <input
                                  type="number"
                                  min="0"
                                  value={item.unitPrice}
                                  onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                                  placeholder="Price ($)"
                                  className="w-full px-1.5 py-1 rounded-md border border-slate-300 bg-white text-xs text-right font-bold"
                                />
                              </div>
                              <div className="col-span-1 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(idx)}
                                  className="text-slate-400 hover:text-rose-500 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                              placeholder="Description / scope notes..."
                              className="w-full px-2 py-0.5 rounded-md border border-slate-200 bg-white text-[10px] text-slate-600"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 5. PRICING, GST OPTION, DEPOSIT & SUMMARY */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        5. Price, GST &amp; Deposit
                      </span>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between text-slate-700">
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
                          <span>Total Booking Price:</span>
                          <span className="text-blue-600">${(Number(calculateTotal()) || 0).toFixed(2)}</span>
                        </div>

                        {/* Deposit Taken Field */}
                        <div className="pt-2 border-t border-slate-200 space-y-2">
                          <div className="grid grid-cols-2 gap-2 items-center">
                            <div>
                              <label className="font-bold text-emerald-800 block text-[11px]">
                                Deposit Taken / Paid ($):
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={depositPaid}
                                onChange={(e) => setDepositPaid(e.target.value)}
                                placeholder="0.00"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-white font-bold text-emerald-900 text-xs"
                              />
                            </div>

                            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-right">
                              <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                                Balance Due:
                              </span>
                              <span className="text-sm font-black text-emerald-950">
                                ${calculateBalanceDue().toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* Owner who collected / holds the deposit */}
                          {Number(depositPaid) > 0 && (
                            <div className="grid grid-cols-2 gap-2 pt-1 bg-white p-2.5 rounded-xl border border-emerald-200/80 animate-in fade-in">
                              <div>
                                <label className="font-bold text-slate-700 block text-[10px] mb-0.5">
                                  Deposit Received / Held By (Owner):
                                </label>
                                <select
                                  value={depositCollectedBy}
                                  onChange={(e) => setDepositCollectedBy(e.target.value)}
                                  className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-slate-50 font-bold text-slate-800 text-[11px] focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="Charanjeet Brar">👤 Charanjeet Brar (604-781-0546)</option>
                                  <option value="Manpreet Gill">👤 Manpreet Gill (778-829-5911)</option>
                                  <option value="Company Account (e-Transfer)">🏦 Company Account (info@hnhpros.ca)</option>
                                  <option value="Cash with Crew/Office">💵 Cash with Crew/Office</option>
                                </select>
                              </div>

                              <div>
                                <label className="font-bold text-slate-700 block text-[10px] mb-0.5">
                                  Payment Method:
                                </label>
                                <select
                                  value={depositPaymentMethod}
                                  onChange={(e) => setDepositPaymentMethod(e.target.value)}
                                  className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-slate-50 font-medium text-slate-800 text-[11px] focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="e-Transfer">Interac e-Transfer</option>
                                  <option value="Cash">Cash</option>
                                  <option value="Credit Card / Stripe">Credit Card (Stripe)</option>
                                  <option value="Cheque">Cheque</option>
                                </select>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Optional Internal Job Cost / Expenses */}
                        <div className="pt-1">
                          <label className="font-semibold text-slate-600 block text-[10px]">
                            Internal Job Cost / Expenses (Contractor/Material Cost - Optional):
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={jobCosts}
                            onChange={(e) => setJobCosts(e.target.value)}
                            placeholder="0.00 (materials, dump fees)"
                            className="w-full px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 text-xs"
                          />
                        </div>

                        {/* Confirmation Dispatch Sequence */}
                        <div className="pt-2 border-t border-slate-200">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={sendConfirmationNow}
                              onChange={(e) => setSendConfirmationNow(e.target.checked)}
                              className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-[11px] font-semibold text-slate-800">
                              📱 Send Booking Confirmation &amp; 24h Reminder automatically
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 shrink-0 rounded-b-3xl">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Save &amp; Confirm Booking</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ROOF MATRIX CALCULATOR MODAL */}
      {isRoofCalcOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs overflow-y-auto flex justify-center items-start p-4 sm:p-6 sm:py-10">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 my-auto">
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
                Add to Booking Items
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF WORK ORDER MODAL */}
      {isPdfModalOpen && selectedPdfJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs overflow-y-auto flex justify-center items-start p-4 sm:p-6 sm:py-8">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 print:hidden sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Official Job Work Order ({selectedPdfJob.jobNumber})
                </h3>
              </div>
              <div className="flex items-center gap-2">
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
                estimate={selectedPdfJob}
                customer={selectedPdfJob.customer}
                settings={settings}
              />
            </div>
          </div>
        </div>
      )}

      {/* LIVE ETA CREW DISPATCH MODAL */}
      {etaModalJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs overflow-y-auto flex justify-center items-start p-4 sm:p-6 sm:py-10">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-base text-slate-900">Dispatch Crew &amp; Send ETA SMS</h3>
              </div>
              <button
                onClick={() => setEtaModalJob(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-orange-50/70 border border-orange-200/60 rounded-2xl space-y-1">
                <div className="font-bold text-orange-950 text-sm">Job: {etaModalJob.title}</div>
                <div className="text-orange-800">
                  Customer: <strong>{etaModalJob.customerName}</strong> ({etaModalJob.customerPhone})
                </div>
                <div className="text-orange-700 text-[11px] flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {etaModalJob.address}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center font-semibold text-slate-700">
                  <span>Estimated Arrival Time (ETA):</span>
                  <span className="text-base font-black text-orange-600 bg-orange-100 px-3 py-1 rounded-xl">
                    {etaMinutes} minutes
                  </span>
                </div>

                <input
                  type="range"
                  min="5"
                  max="90"
                  step="5"
                  value={etaMinutes}
                  onChange={(e) => setEtaMinutes(Number(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />

                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>5 mins</span>
                  <span>25 mins</span>
                  <span>45 mins</span>
                  <span>90 mins</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEtaModalJob(null)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmEnRoute}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-orange-500 text-white hover:bg-orange-600 shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send &quot;Crew On The Way&quot; SMS</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
