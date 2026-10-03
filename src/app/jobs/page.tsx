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
  RefreshCw,
  X,
  Printer,
  FileText,
  DollarSign,
  Search,
  Table as TableIcon,
  LayoutGrid,
  Edit3,
  Trash2,
  Phone,
  CreditCard,
  Building2,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import EstimatePdfDocument from '@/components/EstimatePdfDocument';

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'upcoming' | 'done' | 'unpaid' | 'cancelled'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Helper: Accurate Balance Due by cross-referencing Invoices
  const getJobBalanceDue = (job: any, invoicesList: any[] = invoices) => {
    if (job.status === 'cancelled') return 0;
    const linkedInvoice = invoicesList.find(
      (inv) => inv.jobId && (String(inv.jobId._id || inv.jobId) === String(job._id))
    );
    if (linkedInvoice) {
      if (linkedInvoice.status === 'paid' || Number(linkedInvoice.balanceDue) <= 0.01) {
        return 0;
      }
      return Number(linkedInvoice.balanceDue) || 0;
    }
    if (job.balanceDue !== undefined && job.balanceDue !== null) {
      return Number(job.balanceDue) || 0;
    }
    return Math.max(0, (Number(job.totalAmount) || 0) - (Number(job.depositPaid) || 0));
  };

  // COMPLETE JOB & COLLECT PAYMENT MODAL STATE
  const [completeModalJob, setCompleteModalJob] = useState<any | null>(null);
  const [completionNotes, setCompletionNotes] = useState('All services completed per H&H quality checklist. Site cleaned and inspected.');
  const [collectPaymentNow, setCollectPaymentNow] = useState(true);
  const [completionPayAmount, setCompletionPayAmount] = useState<number | string>(0);
  const [completionPayMethod, setCompletionPayMethod] = useState('Interac e-Transfer');
  const [completionPayCollectedBy, setCompletionPayCollectedBy] = useState('Charanjeet Brar');
  const [completionPayReference, setCompletionPayReference] = useState('');
  const [completionSendReceipt, setCompletionSendReceipt] = useState(true);
  const [completionSendReview, setCompletionSendReview] = useState(true);
  const [completingInProgress, setCompletingInProgress] = useState(false);

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

  // Status & Financials for New Booking
  const [bookingStatus, setBookingStatus] = useState<'scheduled' | 'reminder_sent' | 'en_route' | 'in_progress' | 'completed' | 'cancelled'>('scheduled');
  const [includeGst, setIncludeGst] = useState(true);
  const [depositPaid, setDepositPaid] = useState<number | string>(0);
  const [depositCollectedBy, setDepositCollectedBy] = useState('Charanjeet Brar');
  const [depositPaymentMethod, setDepositPaymentMethod] = useState('e-Transfer');
  const [jobCosts, setJobCosts] = useState<number | string>(0);

  // New Customer Fields
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

  // Line items
  const [items, setItems] = useState([
    {
      service: 'Gutter Cleaning & Downspout Flush',
      description: 'Hand removal of debris & downspout flow test',
      quantity: 1,
      unitPrice: 220,
      total: 220,
    },
  ]);

  // Roof Matrix Calculator Modal
  const [isRoofCalcOpen, setIsRoofCalcOpen] = useState(false);
  const [roofCalcTarget, setRoofCalcTarget] = useState<'new' | 'edit'>('new');
  const [roofSize, setRoofSize] = useState<'small' | 'medium' | 'large' | 'xLarge'>('medium');
  const [roofStories, setRoofStories] = useState<'oneStory' | 'twoStory' | 'threeStory'>('twoStory');

  // EDIT BOOKING MODAL STATE
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editCustomerPhone, setEditCustomerPhone] = useState('');
  const [editCustomerEmail, setEditCustomerEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editStatus, setEditStatus] = useState<'scheduled' | 'reminder_sent' | 'en_route' | 'in_progress' | 'completed' | 'cancelled'>('scheduled');
  const [editScheduledDate, setEditScheduledDate] = useState('');
  const [editScheduledTime, setEditScheduledTime] = useState('10:00 AM');
  const [editDurationHours, setEditDurationHours] = useState<number | string>(2.5);
  const [editAssignedCrew, setEditAssignedCrew] = useState('H&H Lead Crew');
  const [editIncludeGst, setEditIncludeGst] = useState(true);
  const [editDepositPaid, setEditDepositPaid] = useState<number | string>(0);
  const [editDepositCollectedBy, setEditDepositCollectedBy] = useState('Charanjeet Brar');
  const [editDepositPaymentMethod, setEditDepositPaymentMethod] = useState('e-Transfer');
  const [editJobCosts, setEditJobCosts] = useState<number | string>(0);
  const [editNotes, setEditNotes] = useState('');
  const [editCustomerNotes, setEditCustomerNotes] = useState('');
  const [editItems, setEditItems] = useState<any[]>([]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const [jobRes, custRes, setRes, invRes] = await Promise.all([
        fetch('/api/jobs'),
        fetch('/api/customers'),
        fetch('/api/settings'),
        fetch('/api/invoices'),
      ]);
      const jobData = await jobRes.json();
      const custData = await custRes.json();
      const setData = await setRes.json();
      const invData = await invRes.json();

      if (jobData.data) setJobs(jobData.data);
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
    fetchJobs();
  }, []);

  // Standard services
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

  // Calculations for New Booking
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

  // Calculations for Edit Booking
  const calculateEditSubtotal = () => editItems.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  const calculateEditTax = () => {
    if (!editIncludeGst) return 0;
    const rate = settings?.gstRate !== undefined ? settings.gstRate / 100 : 0.05;
    return Number((calculateEditSubtotal() * rate).toFixed(2));
  };
  const calculateEditTotal = () => Number((calculateEditSubtotal() + calculateEditTax()).toFixed(2));
  const calculateEditBalanceDue = () => {
    const total = calculateEditTotal();
    const deposit = Number(editDepositPaid) || 0;
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
    } else {
      setItems([
        ...items,
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

  const handleAddEditItem = (presetSvc?: any) => {
    if (presetSvc) {
      setEditItems([
        ...editItems,
        {
          service: presetSvc.name,
          description: presetSvc.description || `Standard ${presetSvc.name}`,
          quantity: 1,
          unitPrice: presetSvc.price || presetSvc.defaultPrice || 200,
          total: presetSvc.price || presetSvc.defaultPrice || 200,
        },
      ]);
    } else {
      setEditItems([
        ...editItems,
        {
          service: 'Custom Service',
          description: 'Specialized property maintenance',
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

    if (roofCalcTarget === 'edit') {
      setEditItems([
        ...editItems,
        {
          service: 'Roof Cleaning (Gutters Included)',
          description: desc,
          quantity: 1,
          unitPrice: price,
          total: price,
        },
      ]);
    } else {
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
    }
    setIsRoofCalcOpen(false);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleRemoveEditItem = (index: number) => {
    setEditItems(editItems.filter((_, i) => i !== index));
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

  const handleEditItemChange = (index: number, field: string, value: any) => {
    const updated = [...editItems];
    const current = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      current.total = Number(current.quantity) * Number(current.unitPrice);
    }
    updated[index] = current;
    setEditItems(updated);
  };

  // Open Edit Modal with selected Job
  const handleOpenEditModal = (job: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingJob(job);
    setEditCustomerName(job.customerName || '');
    setEditCustomerPhone(job.customerPhone || '');
    setEditCustomerEmail(job.customerEmail || '');
    setEditAddress(job.address || '');
    setEditStatus(job.status || 'scheduled');
    setEditScheduledDate(
      job.scheduledDate
        ? new Date(job.scheduledDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]
    );
    setEditScheduledTime(job.scheduledTime || '10:00 AM');
    setEditDurationHours(job.durationHours || 2.5);
    setEditAssignedCrew(job.assignedCrew || 'H&H Lead Crew');
    setEditIncludeGst(job.includeGst !== false && (job.tax > 0 || job.includeGst === true));
    setEditDepositPaid(job.depositPaid || 0);
    setEditDepositCollectedBy(job.depositCollectedBy || 'Charanjeet Brar');
    setEditDepositPaymentMethod(job.depositPaymentMethod || 'e-Transfer');
    setEditJobCosts(job.jobCosts || 0);
    setEditNotes(job.notes || '');
    setEditCustomerNotes(job.customerNotes || '');
    setEditItems(
      job.items && job.items.length > 0
        ? job.items
        : job.services?.map((s: string) => ({
            service: s,
            description: `Standard ${s}`,
            quantity: 1,
            unitPrice: (Number(job.totalAmount) || 0) / (job.services?.length || 1),
            total: (Number(job.totalAmount) || 0) / (job.services?.length || 1),
          })) || [
            {
              service: 'House soft wash',
              description: 'Standard exterior wash',
              quantity: 1,
              unitPrice: 280,
              total: 280,
            },
          ]
    );
    setIsEditModalOpen(true);
  };

  // Update Existing Booking
  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;

    const subtotal = calculateEditSubtotal();
    const rate = settings?.gstRate !== undefined ? settings.gstRate / 100 : 0.05;
    const tax = editIncludeGst ? Number((subtotal * rate).toFixed(2)) : 0;
    const totalAmount = Number((subtotal + tax).toFixed(2));
    const deposit = Number(editDepositPaid) || 0;
    const balanceDue = Math.max(0, Number((totalAmount - deposit).toFixed(2)));

    const servicesList = editItems.map((i: any) => i.service);
    const title = servicesList.join(' & ') || 'House Maintenance Service';

    const payload = {
      customerName: editCustomerName,
      customerPhone: editCustomerPhone,
      customerEmail: editCustomerEmail,
      address: editAddress,
      status: editStatus,
      scheduledDate: new Date(editScheduledDate),
      scheduledTime: editScheduledTime,
      durationHours: Number(editDurationHours) || 2.5,
      assignedCrew: editAssignedCrew,
      items: editItems,
      services: servicesList,
      title,
      subtotal,
      tax,
      includeGst: editIncludeGst,
      totalAmount,
      depositPaid: deposit,
      depositCollectedBy: deposit > 0 ? editDepositCollectedBy : '',
      depositPaymentMethod: deposit > 0 ? editDepositPaymentMethod : '',
      balanceDue,
      jobCosts: Number(editJobCosts) || 0,
      notes: editNotes,
      customerNotes: editCustomerNotes,
    };

    try {
      const res = await fetch(`/api/jobs/${editingJob._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setIsEditModalOpen(false);
        setEditingJob(null);
        setActionNotice(`Booking #${editingJob.jobNumber} updated successfully!`);
        setTimeout(() => setActionNotice(null), 3500);
        fetchJobs();
      } else {
        alert(data.error || 'Failed to update booking');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Booking
  const handleDeleteJob = async (id: string, jobNumber: string) => {
    if (!confirm(`Are you sure you want to delete Booking #${jobNumber}? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        if (isEditModalOpen) setIsEditModalOpen(false);
        setActionNotice(`Booking #${jobNumber} deleted.`);
        setTimeout(() => setActionNotice(null), 3500);
        fetchJobs();
      } else {
        alert(data.error || 'Failed to delete booking');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create New Booking
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
        setTimeout(() => setActionNotice(null), 4500);
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

  // Action: Open Complete Job & Payment Modal
  const handleOpenCompleteModal = (job: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const balance = getJobBalanceDue(job, invoices);

    setCompleteModalJob(job);
    setCompletionNotes('All services completed per H&H quality checklist. Site cleaned and inspected.');
    setCollectPaymentNow(balance > 0.01);
    setCompletionPayAmount(balance > 0.01 ? balance : 0);
    setCompletionPayMethod('Interac e-Transfer');
    setCompletionPayCollectedBy(job.depositCollectedBy || 'Charanjeet Brar');
    setCompletionPayReference(`REC-${job.jobNumber}`);
    setCompletionSendReceipt(true);
    setCompletionSendReview(true);
  };

  // Action: Confirm Job Completion & Invoice
  const handleConfirmCompleteJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeModalJob) return;

    setCompletingInProgress(true);
    try {
      const res = await fetch(`/api/jobs/${completeModalJob._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark_completed',
          createInvoiceNow: true,
          completionNotes,
          recordPaymentNow: collectPaymentNow && Number(completionPayAmount) > 0,
          paymentAmount: Number(completionPayAmount) || 0,
          paymentMethod: completionPayMethod,
          collectedBy: completionPayCollectedBy,
          paymentReference: completionPayReference,
          paymentNotes: 'Final balance payment received on service completion',
          sendReceiptNow: completionSendReceipt,
          sendReviewRequestNow: completionSendReview,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCompleteModalJob(null);
        setActionNotice(
          `Job #${completeModalJob.jobNumber} completed! Invoice #${
            data.invoice?.invoiceNumber || ''
          } generated${
            collectPaymentNow && Number(completionPayAmount) > 0 ? ' & marked as PAID' : ''
          }.`
        );
        setTimeout(() => setActionNotice(null), 5000);
        fetchJobs();
      } else {
        alert(data.error || 'Failed to complete job');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCompletingInProgress(false);
    }
  };

  // Action: Send Day Before SMS
  const handleSendDayBefore = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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

  // Action: Crew Leaving Dispatch
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

  const handleOpenPdfWorkOrder = (job: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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
      balanceDue: getJobBalanceDue(job, invoices),
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

  // Filter & Search calculation
  const filteredJobs = jobs.filter((job) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      job.jobNumber?.toLowerCase().includes(q) ||
      job.customerName?.toLowerCase().includes(q) ||
      job.customerPhone?.toLowerCase().includes(q) ||
      job.customerEmail?.toLowerCase().includes(q) ||
      job.title?.toLowerCase().includes(q) ||
      job.address?.toLowerCase().includes(q) ||
      job.assignedCrew?.toLowerCase().includes(q) ||
      job.services?.some((s: string) => s.toLowerCase().includes(q));

    if (!matchSearch) return false;

    if (filterTab === 'upcoming') {
      return ['scheduled', 'reminder_sent', 'en_route', 'in_progress'].includes(job.status);
    }
    if (filterTab === 'done') {
      return job.status === 'completed';
    }
    if (filterTab === 'unpaid') {
      const balance = getJobBalanceDue(job, invoices);
      return balance > 0.01 && job.status !== 'cancelled';
    }
    if (filterTab === 'cancelled') {
      return job.status === 'cancelled';
    }
    return true; // 'all'
  });

  // Tab counts
  const countAll = jobs.length;
  const countUpcoming = jobs.filter((j) =>
    ['scheduled', 'reminder_sent', 'en_route', 'in_progress'].includes(j.status)
  ).length;
  const countDone = jobs.filter((j) => j.status === 'completed').length;
  const countUnpaid = jobs.filter((j) => {
    const b = getJobBalanceDue(j, invoices);
    return b > 0.01 && j.status !== 'cancelled';
  }).length;
  const countCancelled = jobs.filter((j) => j.status === 'cancelled').length;

  return (
    <div className="space-y-5">
      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-blue-600" />
            Bookings &amp; Live Dispatch Pipeline
          </h1>
          <p className="text-xs text-slate-500">
            View all bookings in a searchable table, filter upcoming/unpaid, click to edit &amp; complete with instant payment
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Card Pipeline View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
          </div>

          {/* New Booking Button */}
          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Booking</span>
          </button>

          <button
            onClick={fetchJobs}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
            title="Refresh bookings list"
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

      {/* SEARCH BAR & STATUS FILTER TABS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer, phone, job # (e.g. JOB-4001), address, service or crew..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Stats Summary */}
          <div className="text-xs text-slate-500 font-medium px-1 flex items-center gap-2">
            <span>Showing:</span>
            <strong className="text-slate-900">{filteredJobs.length}</strong> of{' '}
            <strong className="text-slate-900">{jobs.length}</strong> bookings
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-t border-slate-100 pt-3">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              filterTab === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>All Bookings</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterTab === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {countAll}
            </span>
          </button>

          <button
            onClick={() => setFilterTab('upcoming')}
            className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              filterTab === 'upcoming'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <span>⚡ Upcoming / Active</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterTab === 'upcoming' ? 'bg-blue-500 text-white' : 'bg-blue-200 text-blue-800'}`}>
              {countUpcoming}
            </span>
          </button>

          <button
            onClick={() => setFilterTab('done')}
            className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              filterTab === 'done'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <span>✅ Done / Completed</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterTab === 'done' ? 'bg-emerald-500 text-white' : 'bg-emerald-200 text-emerald-800'}`}>
              {countDone}
            </span>
          </button>

          <button
            onClick={() => setFilterTab('unpaid')}
            className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              filterTab === 'unpaid'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <span>💳 Unpaid / Balance Due</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterTab === 'unpaid' ? 'bg-amber-500 text-white' : 'bg-amber-200 text-amber-800'}`}>
              {countUnpaid}
            </span>
          </button>

          <button
            onClick={() => setFilterTab('cancelled')}
            className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              filterTab === 'cancelled'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <span>❌ Cancelled</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterTab === 'cancelled' ? 'bg-rose-500 text-white' : 'bg-rose-200 text-rose-800'}`}>
              {countCancelled}
            </span>
          </button>
        </div>
      </div>

      {/* TABLE VIEW (DEFAULT) */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">
              Loading scheduled bookings &amp; jobs...
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 space-y-2">
              <CalendarCheck className="w-8 h-8 mx-auto text-slate-300" />
              <div>No bookings match the selected filter &amp; search.</div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterTab('all');
                }}
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Clear search &amp; filter
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-600 tracking-wider">
                    <th className="py-3.5 px-4">JOB # &amp; DATE</th>
                    <th className="py-3.5 px-4">CUSTOMER &amp; PROPERTY</th>
                    <th className="py-3.5 px-4">SERVICES / SCOPE</th>
                    <th className="py-3.5 px-3">CREW</th>
                    <th className="py-3.5 px-3">STATUS</th>
                    <th className="py-3.5 px-4 text-right">TOTAL &amp; BALANCE</th>
                    <th className="py-3.5 px-4 text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredJobs.map((job) => {
                    const isCompleted = job.status === 'completed';
                    const isEnRoute = job.status === 'en_route';
                    const isCancelled = job.status === 'cancelled';
                    const hasDeposit = Number(job.depositPaid) > 0;
                    const balanceDue = getJobBalanceDue(job, invoices);

                    return (
                      <tr
                        key={job._id}
                        onClick={() => handleOpenEditModal(job)}
                        className="hover:bg-blue-50/50 transition cursor-pointer group"
                      >
                        {/* Job Number & Date */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {job.jobNumber}
                            </span>
                            {job.tax > 0 ? (
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                                5% GST
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                                0% Tax
                              </span>
                            )}
                          </div>
                          <div className="font-bold text-slate-900 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-blue-600" />
                            <span>{new Date(job.scheduledDate).toLocaleDateString()}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {job.scheduledTime} (~{job.durationHours || 2.5}h)
                          </div>
                        </td>

                        {/* Customer & Address */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition">
                            {job.customerName}
                          </div>
                          <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <a
                              href={`tel:${job.customerPhone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="hover:text-blue-600 hover:underline"
                            >
                              {job.customerPhone}
                            </a>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 line-clamp-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[200px]">{job.address}</span>
                          </div>
                        </td>

                        {/* Services & Scope */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="font-semibold text-slate-900">
                            {job.title}
                          </div>
                          {job.items && job.items.length > 0 ? (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {job.items.slice(0, 2).map((it: any, iIdx: number) => (
                                <span
                                  key={iIdx}
                                  className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium"
                                >
                                  {it.service}
                                </span>
                              ))}
                              {job.items.length > 2 && (
                                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                  +{job.items.length - 2} more
                                </span>
                              )}
                            </div>
                          ) : null}
                          {(job.notes || job.customerNotes) && (
                            <div className="text-[10px] text-slate-400 mt-1 line-clamp-1 italic">
                              📝 {job.notes || job.customerNotes}
                            </div>
                          )}
                        </td>

                        {/* Crew */}
                        <td className="py-3.5 px-3 align-top whitespace-nowrap">
                          <span className="inline-block px-2 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium text-[11px]">
                            {job.assignedCrew}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-3 align-top whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-800'
                                : isEnRoute
                                ? 'bg-orange-100 text-orange-800 animate-pulse'
                                : job.status === 'in_progress'
                                ? 'bg-amber-100 text-amber-800'
                                : job.status === 'reminder_sent'
                                ? 'bg-blue-100 text-blue-800'
                                : isCancelled
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {isEnRoute ? (
                              <>
                                <Flame className="w-3 h-3 text-orange-600" /> En Route ({job.etaMinutes || 25}m)
                              </>
                            ) : (
                              job.status?.toUpperCase().replace('_', ' ') || 'SCHEDULED'
                            )}
                          </span>
                        </td>

                        {/* Total, Deposit & Balance Due */}
                        <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                          <div className="font-black text-slate-900 text-sm">
                            ${(Number(job.totalAmount) || 0).toFixed(2)}
                          </div>
                          {hasDeposit ? (
                            <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
                              ✓ Dep: ${(Number(job.depositPaid) || 0).toFixed(2)}
                              {job.depositCollectedBy && (
                                <span className="text-slate-500 block text-[9px]">
                                  ({job.depositCollectedBy})
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-400 mt-0.5">Dep: $0.00</div>
                          )}
                          <div
                            className={`text-[11px] font-bold px-1.5 py-0.5 rounded mt-1 inline-block ${
                              balanceDue <= 0.01
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {balanceDue <= 0.01 ? '✓ Paid In Full' : `Due: $${balanceDue.toFixed(2)}`}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 align-top text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            {/* Complete & Collect Payment Button */}
                            {!isCompleted && !isCancelled && (
                              <button
                                onClick={(e) => handleOpenCompleteModal(job, e)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs flex items-center gap-1 cursor-pointer"
                                title="Complete Service &amp; Process Invoice / Payment"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Complete</span>
                              </button>
                            )}

                            {/* Edit Button */}
                            <button
                              onClick={(e) => handleOpenEditModal(job, e)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 transition cursor-pointer"
                              title="Edit Booking Details"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Work Order PDF Button */}
                            <button
                              onClick={(e) => handleOpenPdfWorkOrder(job, e)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                              title="View &amp; Print Work Order PDF"
                            >
                              <Printer className="w-4 h-4 text-slate-600" />
                            </button>

                            {!isCompleted && !isCancelled && (
                              <>
                                {/* Dispatch Crew ETA */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEtaModalJob(job);
                                  }}
                                  className="p-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-600 transition cursor-pointer"
                                  title="Dispatch Crew (Live ETA SMS)"
                                >
                                  <Flame className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* CARDS / PIPELINE VIEW */
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-3xl border">
              Loading scheduled bookings &amp; jobs...
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-3xl border space-y-2">
              <CalendarCheck className="w-8 h-8 mx-auto text-slate-300" />
              <div>No bookings match the selected filter &amp; search.</div>
            </div>
          ) : (
            filteredJobs.map((job) => {
              const isCompleted = job.status === 'completed';
              const isEnRoute = job.status === 'en_route';
              const hasDeposit = Number(job.depositPaid) > 0;
              const balanceDue = getJobBalanceDue(job, invoices);

              return (
                <div
                  key={job._id}
                  onClick={() => handleOpenEditModal(job)}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition space-y-4 cursor-pointer"
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
                              ? 'bg-orange-100 text-orange-800 animate-pulse flex items-center gap-1'
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
                            job.status?.toUpperCase().replace('_', ' ') || 'SCHEDULED'
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
                        {hasDeposit ? (
                          <div className="text-[10px] text-emerald-700 font-bold">
                            Dep: ${(Number(job.depositPaid) || 0).toFixed(2)} {job.depositCollectedBy ? `(${job.depositCollectedBy})` : ''} | {balanceDue <= 0.01 ? '✓ Paid In Full' : `Due: $${balanceDue.toFixed(2)}`}
                          </div>
                        ) : (
                          <div className={`text-[10px] font-bold ${balanceDue <= 0.01 ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {balanceDue <= 0.01 ? '✓ Paid In Full' : `Due: $${balanceDue.toFixed(2)}`}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dispatch Controls & Work Order PDF */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1" onClick={(e) => e.stopPropagation()}>
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
                      {/* Complete & Invoice Button */}
                      {!isCompleted && job.status !== 'cancelled' && (
                        <button
                          onClick={(e) => handleOpenCompleteModal(job, e)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Complete &amp; Invoice</span>
                        </button>
                      )}

                      {/* Edit Booking Button */}
                      <button
                        onClick={(e) => handleOpenEditModal(job, e)}
                        className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {/* Work Order PDF Button */}
                      <button
                        onClick={(e) => handleOpenPdfWorkOrder(job, e)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-600" />
                        <span>Work Order PDF</span>
                      </button>

                      {!isCompleted && job.status !== 'cancelled' && (
                        <>
                          {/* Day-Before Reminder */}
                          <button
                            onClick={(e) => handleSendDayBefore(job._id, e)}
                            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            <span>24h Reminder</span>
                          </button>

                          {/* Crew Leaving Dispatch Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEtaModalJob(job);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shadow-sm flex items-center gap-1 cursor-pointer"
                          >
                            <Flame className="w-3 h-3" />
                            <span>Dispatch ETA</span>
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
      )}

      {/* QUICK COMPLETE JOB & COLLECT PAYMENT MODAL */}
      {completeModalJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-hidden">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 my-auto">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-xs">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-slate-900">
                    Complete Booking #{completeModalJob.jobNumber}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Generate final invoice, collect payment &amp; dispatch review sequence
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCompleteModalJob(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleConfirmCompleteJob} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
                {/* 1. Job Summary Card */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{completeModalJob.customerName}</div>
                      <div className="text-slate-500 text-[11px]">{completeModalJob.customerPhone} • {completeModalJob.address}</div>
                    </div>
                    <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {completeModalJob.jobNumber}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-center">
                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-medium">Total Price</div>
                      <div className="font-black text-slate-900 text-sm">
                        ${(Number(completeModalJob.totalAmount) || 0).toFixed(2)}
                      </div>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <div className="text-[10px] text-emerald-600 font-medium">Deposit Paid</div>
                      <div className="font-black text-emerald-700 text-sm">
                        ${(Number(completeModalJob.depositPaid) || 0).toFixed(2)}
                      </div>
                    </div>

                    <div className="bg-amber-50 p-2 rounded-xl border border-amber-200">
                      <div className="text-[10px] text-amber-800 font-medium">Remaining Due</div>
                      <div className="font-black text-amber-950 text-sm">
                        ${(
                          completeModalJob.balanceDue !== undefined
                            ? Number(completeModalJob.balanceDue)
                            : Math.max(0, (Number(completeModalJob.totalAmount) || 0) - (Number(completeModalJob.depositPaid) || 0))
                        ).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Completion Checklist & Notes */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Service Completion Notes:
                  </label>
                  <textarea
                    rows={2}
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium resize-none text-xs"
                    placeholder="e.g. All services completed, gutters cleaned, site washed down..."
                  />
                </div>

                {/* 3. Payment Collection Section */}
                <div className="p-4 rounded-2xl border transition bg-emerald-50/70 border-emerald-200">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer font-black text-emerald-950 text-xs">
                      <input
                        type="checkbox"
                        checked={collectPaymentNow}
                        onChange={(e) => setCollectPaymentNow(e.target.checked)}
                        className="w-4 h-4 accent-emerald-600 rounded"
                      />
                      <span>💳 Customer Paid Balance on Site Now?</span>
                    </label>
                    <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                      {collectPaymentNow ? 'Mark Invoice as PAID' : 'Send UNPAID Invoice'}
                    </span>
                  </div>

                  {collectPaymentNow ? (
                    <div className="mt-3.5 space-y-3 pt-3 border-t border-emerald-200/80">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-emerald-900 block mb-1">
                            Amount Paid ($):
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={completionPayAmount}
                            onChange={(e) => setCompletionPayAmount(e.target.value)}
                            required={collectPaymentNow}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-white font-black text-emerald-950 text-sm"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-emerald-900 block mb-1">
                            Payment Method:
                          </label>
                          <select
                            value={completionPayMethod}
                            onChange={(e) => setCompletionPayMethod(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-white font-semibold text-emerald-950"
                          >
                            <option value="Interac e-Transfer">Interac e-Transfer</option>
                            <option value="Cash">Cash</option>
                            <option value="Credit Card">Credit Card</option>
                            <option value="Cheque">Cheque</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-emerald-900 block mb-1">
                            Collected By (Owner):
                          </label>
                          <select
                            value={completionPayCollectedBy}
                            onChange={(e) => setCompletionPayCollectedBy(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-white font-semibold text-emerald-950"
                          >
                            <option value="Charanjeet Brar">Charanjeet Brar</option>
                            <option value="Manpreet Gill">Manpreet Gill</option>
                            <option value="Company Bank Account">Company Bank Account</option>
                            <option value="Cash with Crew/Office">Cash with Crew / Office</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-emerald-900 block mb-1">
                            Receipt / Ref #:
                          </label>
                          <input
                            type="text"
                            value={completionPayReference}
                            onChange={(e) => setCompletionPayReference(e.target.value)}
                            placeholder="e.g. REC-4001"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-white font-medium text-emerald-950"
                          />
                        </div>
                      </div>

                      {/* Automated Communication Toggles */}
                      <div className="pt-2 border-t border-emerald-200/60 space-y-1.5 text-[11px] text-emerald-900">
                        <label className="flex items-center gap-2 cursor-pointer font-medium">
                          <input
                            type="checkbox"
                            checked={completionSendReceipt}
                            onChange={(e) => setCompletionSendReceipt(e.target.checked)}
                            className="w-3.5 h-3.5 accent-emerald-600 rounded"
                          />
                          <span>✓ Auto-send Official Payment Receipt SMS / Email</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer font-medium">
                          <input
                            type="checkbox"
                            checked={completionSendReview}
                            onChange={(e) => setCompletionSendReview(e.target.checked)}
                            className="w-3.5 h-3.5 accent-emerald-600 rounded"
                          />
                          <span>⭐ Auto-trigger 5-Star Google Review Request SMS</span>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2.5 text-[11px] text-slate-500 bg-white/70 p-2.5 rounded-xl border border-slate-200">
                      ℹ️ Invoice will be created as <strong>SENT / UNPAID</strong> with remaining balance due. The customer will receive an SMS/Email link to pay online or via e-Transfer.
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                <button
                  type="button"
                  onClick={() => setCompleteModalJob(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={completingInProgress}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {completingInProgress ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing Completion...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Complete Job &amp; Process Invoice</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT BOOKING MODAL */}
      {isEditModalOpen && editingJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-hidden">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Top Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base sm:text-lg text-slate-900">
                      Edit Booking ({editingJob.jobNumber})
                    </h3>
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {editStatus.toUpperCase().replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Update customer details, schedule, line items, deposit holder, notes or status
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteJob(editingJob._id, editingJob.jobNumber)}
                  className="px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  title="Delete this booking permanently"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleUpdateJob} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-xs">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
                  {/* LEFT COLUMN: CUSTOMER, SCHEDULE & NOTES */}
                  <div className="space-y-4">
                    {/* Status & Customer Info */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <User className="w-4 h-4 text-blue-600" />
                        1. Booking Status &amp; Customer Info
                      </div>

                      {/* Status Selector */}
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                          Booking Status:
                        </label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="scheduled">🗓️ Scheduled (Confirmed)</option>
                          <option value="reminder_sent">📩 Reminder Sent</option>
                          <option value="en_route">🚚 Crew En Route</option>
                          <option value="in_progress">⚡ In Progress</option>
                          <option value="completed">✅ Completed</option>
                          <option value="cancelled">❌ Cancelled</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 pt-1">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                            Customer Name:
                          </label>
                          <input
                            type="text"
                            value={editCustomerName}
                            onChange={(e) => setEditCustomerName(e.target.value)}
                            required
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                            Phone Number:
                          </label>
                          <input
                            type="text"
                            value={editCustomerPhone}
                            onChange={(e) => setEditCustomerPhone(e.target.value)}
                            required
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                            Email Address:
                          </label>
                          <input
                            type="email"
                            value={editCustomerEmail}
                            onChange={(e) => setEditCustomerEmail(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                            Service Address:
                          </label>
                          <input
                            type="text"
                            value={editAddress}
                            onChange={(e) => setEditAddress(e.target.value)}
                            required
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Schedule & Crew */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-blue-600" />
                        2. Schedule &amp; Crew Assignment
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                            Scheduled Date:
                          </label>
                          <input
                            type="date"
                            value={editScheduledDate}
                            onChange={(e) => setEditScheduledDate(e.target.value)}
                            required
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                            Start Time:
                          </label>
                          <input
                            type="text"
                            value={editScheduledTime}
                            onChange={(e) => setEditScheduledTime(e.target.value)}
                            placeholder="e.g. 10:00 AM"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                            Estimated Duration:
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            value={editDurationHours}
                            onChange={(e) => setEditDurationHours(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                            Assigned Crew:
                          </label>
                          <input
                            type="text"
                            value={editAssignedCrew}
                            onChange={(e) => setEditAssignedCrew(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Dual Notes Section */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-blue-600" />
                        3. Service Notes &amp; Access Details
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                          Internal Crew / Access Notes (gate code, pets, water access):
                        </label>
                        <textarea
                          rows={2}
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="e.g. Back gate unlocked, water spigot on left side..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium resize-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                          Customer Scope Notes (visible on Work Order PDF):
                        </label>
                        <textarea
                          rows={2}
                          value={editCustomerNotes}
                          onChange={(e) => setEditCustomerNotes(e.target.value)}
                          placeholder="e.g. Includes full exterior window wash and gutter flush..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: SERVICES, FINANCIALS, DEPOSIT & TOTAL */}
                  <div className="space-y-4">
                    {/* Services and Line Items */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-blue-600" />
                          4. Line Items &amp; Services
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setRoofCalcTarget('edit');
                              setIsRoofCalcOpen(true);
                            }}
                            className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] transition cursor-pointer"
                          >
                            🏠 Roof Calculator
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddEditItem()}
                            className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] transition cursor-pointer"
                          >
                            + Custom Item
                          </button>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {editItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <input
                                type="text"
                                value={item.service}
                                onChange={(e) => handleEditItemChange(idx, 'service', e.target.value)}
                                placeholder="Service name"
                                className="flex-1 font-bold text-slate-900 border-b border-transparent focus:border-blue-500 outline-none"
                              />
                              {editItems.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveEditItem(idx)}
                                  className="text-slate-300 hover:text-rose-500 cursor-pointer p-0.5"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleEditItemChange(idx, 'description', e.target.value)}
                              placeholder="Description"
                              className="w-full text-[11px] text-slate-500 border-b border-transparent focus:border-blue-500 outline-none"
                            />

                            <div className="flex items-center justify-between gap-2 text-[11px] pt-1 border-t border-slate-100">
                              <div className="flex items-center gap-1">
                                <span>Qty:</span>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => handleEditItemChange(idx, 'quantity', e.target.value)}
                                  className="w-12 px-1.5 py-0.5 rounded border border-slate-200 text-center font-bold"
                                />
                              </div>
                              <div className="flex items-center gap-1">
                                <span>Price: $</span>
                                <input
                                  type="number"
                                  value={item.unitPrice}
                                  onChange={(e) => handleEditItemChange(idx, 'unitPrice', e.target.value)}
                                  className="w-20 px-1.5 py-0.5 rounded border border-slate-200 text-right font-bold"
                                />
                              </div>
                              <div className="font-black text-slate-900">
                                ${(Number(item.total) || 0).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Quick Add Preset Service */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Add Standard Service:
                        </label>
                        <select
                          onChange={(e) => {
                            if (!e.target.value) return;
                            const svc = availableServices.find((s: any) => s.name === e.target.value);
                            if (svc) handleAddEditItem(svc);
                            e.target.value = '';
                          }}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium"
                        >
                          <option value="">+ Select a preset service to add...</option>
                          {availableServices.map((svc: any, sIdx: number) => (
                            <option key={sIdx} value={svc.name}>
                              {svc.name} (${svc.price})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Financial Calculations & Deposit */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="font-bold text-slate-800 flex items-center justify-between">
                        <span>5. Pricing, GST &amp; Deposit</span>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editIncludeGst}
                            onChange={(e) => setEditIncludeGst(e.target.checked)}
                            className="w-3.5 h-3.5 accent-blue-600 rounded"
                          />
                          <span>Include 5% GST</span>
                        </label>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-600">
                          <span>Subtotal:</span>
                          <span className="font-bold text-slate-900">${calculateEditSubtotal().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>GST ({editIncludeGst ? '5%' : '0% Tax Free'}):</span>
                          <span className="font-bold text-slate-900">${calculateEditTax().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-900 font-black text-sm pt-1 border-t border-slate-100">
                          <span>Total Amount:</span>
                          <span className="text-blue-700">${calculateEditTotal().toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Deposit Section */}
                      <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-2.5">
                        <div className="font-bold text-emerald-950 flex items-center justify-between">
                          <span>Deposit Received ($):</span>
                          <input
                            type="number"
                            step="0.01"
                            value={editDepositPaid}
                            onChange={(e) => setEditDepositPaid(e.target.value)}
                            placeholder="0.00"
                            className="w-28 px-2 py-1 rounded-lg border border-emerald-300 bg-white font-black text-right text-emerald-800"
                          />
                        </div>

                        {Number(editDepositPaid) > 0 && (
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-emerald-200/60">
                            <div>
                              <label className="text-[10px] font-bold text-emerald-900 block mb-1">
                                Held By (Owner):
                              </label>
                              <select
                                value={editDepositCollectedBy}
                                onChange={(e) => setEditDepositCollectedBy(e.target.value)}
                                className="w-full px-2 py-1 rounded-lg border border-emerald-300 bg-white text-xs font-semibold text-emerald-950"
                              >
                                <option value="Charanjeet Brar">Charanjeet Brar</option>
                                <option value="Manpreet Gill">Manpreet Gill</option>
                                <option value="Company Bank Account">Company Bank Account (e-Transfer)</option>
                                <option value="Cash with Crew/Office">Cash with Crew / Office</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-emerald-900 block mb-1">
                                Payment Method:
                              </label>
                              <select
                                value={editDepositPaymentMethod}
                                onChange={(e) => setEditDepositPaymentMethod(e.target.value)}
                                className="w-full px-2 py-1 rounded-lg border border-emerald-300 bg-white text-xs font-semibold text-emerald-950"
                              >
                                <option value="e-Transfer">Interac e-Transfer</option>
                                <option value="Cash">Cash</option>
                                <option value="Credit Card">Credit Card</option>
                                <option value="Cheque">Cheque</option>
                              </select>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between items-center text-xs font-bold text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200">
                          <span>Remaining Balance Due:</span>
                          <span className="text-sm font-black">${calculateEditBalanceDue().toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Job Cost Tracker */}
                      <div className="flex items-center justify-between text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                        <span>Internal Job Cost / Expenses ($):</span>
                        <input
                          type="number"
                          step="0.01"
                          value={editJobCosts}
                          onChange={(e) => setEditJobCosts(e.target.value)}
                          placeholder="0.00"
                          className="w-24 px-2 py-1 rounded-lg border border-slate-200 font-bold text-right text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Footer Actions */}
              <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium"
                            >
                              {customers.map((c) => (
                                <option key={c._id} value={c._id}>
                                  {c.name} — {c.phone} ({c.address}, {c.city})
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2.5 pt-1">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                                Full Name:
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Gurmukh Sandhu"
                                value={newCustName}
                                onChange={(e) => setNewCustName(e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                                Phone (SMS):
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. 604-555-0199"
                                value={newCustPhone}
                                onChange={(e) => setNewCustPhone(e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                                Email:
                              </label>
                              <input
                                type="email"
                                placeholder="client@example.com"
                                value={newCustEmail}
                                onChange={(e) => setNewCustEmail(e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                                Property Type:
                              </label>
                              <select
                                value={newCustType}
                                onChange={(e) => setNewCustType(e.target.value as any)}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                              >
                                <option value="Residential">Residential</option>
                                <option value="Commercial">Commercial</option>
                                <option value="Strata">Strata</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2">
                              <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                                Street Address:
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. 14220 72nd Ave"
                                value={newCustAddress}
                                onChange={(e) => setNewCustAddress(e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                                City:
                              </label>
                              <input
                                type="text"
                                value={newCustCity}
                                onChange={(e) => setNewCustCity(e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 2. SCHEDULE & CREW ASSIGNMENT */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-blue-600" />
                        2. Schedule &amp; Crew Assignment
                      </span>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                            Service Date:
                          </label>
                          <input
                            type="date"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            required
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                            Arrival Window / Time:
                          </label>
                          <select
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                          >
                            <option value="08:00 AM">08:00 AM (Early Slot)</option>
                            <option value="10:00 AM">10:00 AM (Morning Slot)</option>
                            <option value="01:00 PM">01:00 PM (Afternoon Slot)</option>
                            <option value="03:30 PM">03:30 PM (Late Afternoon)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                            Duration (Hours):
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            value={durationHours}
                            onChange={(e) => setDurationHours(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                            Assigned Crew:
                          </label>
                          <select
                            value={assignedCrew}
                            onChange={(e) => setAssignedCrew(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                          >
                            <option value="H&H Lead Crew (Mike & Dave)">H&amp;H Lead Crew (Mike &amp; Dave)</option>
                            <option value="Crew Beta (Alex & Sam)">Crew Beta (Alex &amp; Sam)</option>
                            <option value="Pressure Wash Specialist Crew">Pressure Wash Specialist Crew</option>
                            <option value="Roof & Gutter Team">Roof &amp; Gutter Team</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* 3. DUAL NOTES (ACCESS & WORK SCOPE) */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-blue-600" />
                        3. Job Notes &amp; Access Details
                      </span>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Internal Crew / Access Notes (gate code, pets, parking):
                        </label>
                        <textarea
                          rows={2}
                          value={bookingNotes}
                          onChange={(e) => setBookingNotes(e.target.value)}
                          placeholder="e.g. Back gate code #1234, watch for golden retriever..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium resize-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Customer Scope Notes (printed on Work Order):
                        </label>
                        <textarea
                          rows={2}
                          value={customerNotes}
                          onChange={(e) => setCustomerNotes(e.target.value)}
                          placeholder="e.g. Focus on north-facing moss, full perimeter flush included..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: SERVICES, FINANCIALS, DEPOSIT & TOTAL */}
                  <div className="space-y-4">
                    {/* 4. LINE ITEMS & SERVICES */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-blue-600" />
                          4. Services &amp; Line Items
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setRoofCalcTarget('new');
                              setIsRoofCalcOpen(true);
                            }}
                            className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] transition cursor-pointer"
                          >
                            🏠 Roof Calculator
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddItem()}
                            className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] transition cursor-pointer"
                          >
                            + Custom
                          </button>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
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
                              <div className="flex items-center gap-1">
                                <span>Qty:</span>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                  className="w-12 px-1.5 py-0.5 rounded border border-slate-200 text-center font-bold"
                                />
                              </div>
                              <div className="flex items-center gap-1">
                                <span>Price: $</span>
                                <input
                                  type="number"
                                  value={item.unitPrice}
                                  onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                                  className="w-20 px-1.5 py-0.5 rounded border border-slate-200 text-right font-bold"
                                />
                              </div>
                              <div className="font-black text-slate-900">
                                ${(Number(item.total) || 0).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Quick Add Presets */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Quick Add Standard Service:
                        </label>
                        <select
                          onChange={(e) => {
                            if (!e.target.value) return;
                            const svc = availableServices.find((s: any) => s.name === e.target.value);
                            if (svc) handleAddItem(svc);
                            e.target.value = '';
                          }}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium"
                        >
                          <option value="">+ Select a preset service to add...</option>
                          {availableServices.map((svc: any, sIdx: number) => (
                            <option key={sIdx} value={svc.name}>
                              {svc.name} (${svc.price})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* 5. FINANCIALS, GST & DEPOSIT */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="font-bold text-slate-800 flex items-center justify-between">
                        <span>5. Pricing, GST &amp; Deposit</span>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeGst}
                            onChange={(e) => setIncludeGst(e.target.checked)}
                            className="w-3.5 h-3.5 accent-blue-600 rounded"
                          />
                          <span>Include 5% GST</span>
                        </label>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-600">
                          <span>Subtotal:</span>
                          <span className="font-bold text-slate-900">${calculateSubtotal().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>GST ({includeGst ? '5%' : '0% Tax Free'}):</span>
                          <span className="font-bold text-slate-900">${calculateTax().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-900 font-black text-sm pt-1 border-t border-slate-100">
                          <span>Total Amount:</span>
                          <span className="text-blue-700">${calculateTotal().toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Deposit Section */}
                      <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-2.5">
                        <div className="font-bold text-emerald-950 flex items-center justify-between">
                          <span>Deposit Received ($):</span>
                          <input
                            type="number"
                            step="0.01"
                            value={depositPaid}
                            onChange={(e) => setDepositPaid(e.target.value)}
                            placeholder="0.00"
                            className="w-28 px-2 py-1 rounded-lg border border-emerald-300 bg-white font-black text-right text-emerald-800"
                          />
                        </div>

                        {Number(depositPaid) > 0 && (
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-emerald-200/60">
                            <div>
                              <label className="text-[10px] font-bold text-emerald-900 block mb-1">
                                Held By (Owner):
                              </label>
                              <select
                                value={depositCollectedBy}
                                onChange={(e) => setDepositCollectedBy(e.target.value)}
                                className="w-full px-2 py-1 rounded-lg border border-emerald-300 bg-white text-xs font-semibold text-emerald-950"
                              >
                                <option value="Charanjeet Brar">Charanjeet Brar</option>
                                <option value="Manpreet Gill">Manpreet Gill</option>
                                <option value="Company Bank Account">Company Bank Account (e-Transfer)</option>
                                <option value="Cash with Crew/Office">Cash with Crew / Office</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-emerald-900 block mb-1">
                                Payment Method:
                              </label>
                              <select
                                value={depositPaymentMethod}
                                onChange={(e) => setDepositPaymentMethod(e.target.value)}
                                className="w-full px-2 py-1 rounded-lg border border-emerald-300 bg-white text-xs font-semibold text-emerald-950"
                              >
                                <option value="e-Transfer">Interac e-Transfer</option>
                                <option value="Cash">Cash</option>
                                <option value="Credit Card">Credit Card</option>
                                <option value="Cheque">Cheque</option>
                              </select>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between items-center text-xs font-bold text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200">
                          <span>Remaining Balance Due:</span>
                          <span className="text-sm font-black">${calculateBalanceDue().toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Job Cost Tracker */}
                      <div className="flex items-center justify-between text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                        <span>Internal Job Cost / Expenses ($):</span>
                        <input
                          type="number"
                          step="0.01"
                          value={jobCosts}
                          onChange={(e) => setJobCosts(e.target.value)}
                          placeholder="0.00"
                          className="w-24 px-2 py-1 rounded-lg border border-slate-200 font-bold text-right text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Footer Actions */}
              <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendConfirmationNow}
                    onChange={(e) => setSendConfirmationNow(e.target.checked)}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                  <span>Dispatch SMS Confirmation to Customer Immediately</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBookingModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>Create &amp; Confirm Booking</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ROOF MATRIX CALCULATOR MODAL */}
      {isRoofCalcOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Roof &amp; Gutter Package Calculator</h3>
              <button
                type="button"
                onClick={() => setIsRoofCalcOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Square Footage Size:</label>
                <select
                  value={roofSize}
                  onChange={(e) => setRoofSize(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                >
                  <option value="small">Small (under 1,500 sq ft)</option>
                  <option value="medium">Medium (1,500 to 2,500 sq ft)</option>
                  <option value="large">Large (2,500 to 3,500 sq ft)</option>
                  <option value="xLarge">X-Large (3,500 sq ft &amp; up)</option>
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
