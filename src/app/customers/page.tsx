'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Tag,
  Star,
  MessageSquare,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  X,
} from 'lucide-react';
import CommunicationSequenceModal from '@/components/CommunicationSequenceModal';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [customerDetails, setCustomerDetails] = useState<any | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isCommModalOpen, setIsCommModalOpen] = useState(false);

  // New Customer form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: 'Vancouver',
    propertyType: 'Residential',
    notes: '',
    tags: 'Gutter Cleaning, Spring',
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers?q=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.data) {
        setCustomers(data.data);
        if (!selectedCustomer && data.data.length > 0) {
          handleSelectCustomer(data.data[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleSelectCustomer = async (cust: any) => {
    setSelectedCustomer(cust);
    try {
      const res = await fetch(`/api/customers/${cust._id}`);
      const data = await res.json();
      if (data.success) {
        setCustomerDetails(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tagsArray = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: tagsArray,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsNewModalOpen(false);
        fetchCustomers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Customer Directory & Service History
          </h1>
          <p className="text-xs text-slate-500">
            Manage H&H clients, property tags, seasonal preferences, and communication history
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md shadow-blue-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Main Grid: List on Left, Detail Drawer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Customer List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by name, phone, city, or tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            />
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading customers...</div>
            ) : customers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No customers found.</div>
            ) : (
              customers.map((cust) => {
                const isSelected = selectedCustomer?._id === cust._id;
                return (
                  <button
                    key={cust._id}
                    onClick={() => handleSelectCustomer(cust)}
                    className={`w-full text-left p-4 transition flex items-start justify-between ${
                      isSelected
                        ? 'bg-blue-50/70 border-l-4 border-blue-600'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm truncate">
                          {cust.name}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {cust.propertyType}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {cust.address}, {cust.city}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {cust.tags?.slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Customer Detail Hub (7 cols) */}
        <div className="lg:col-span-7">
          {selectedCustomer ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
              {/* Top Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900">{selectedCustomer.name}</h2>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {selectedCustomer.propertyType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    <span>{selectedCustomer.city}, BC</span>
                    <span>•</span>
                    <span>Customer since {new Date(selectedCustomer.createdAt).getFullYear()}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setIsCommModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Send Automated SMS</span>
                  </button>
                  <a
                    href={`/review/${selectedCustomer._id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs border border-amber-200 transition flex items-center gap-1"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>Review Link</span>
                  </a>
                </div>
              </div>

              {/* Contact & Property Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Contact Information
                  </div>
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{selectedCustomer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{selectedCustomer.email}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Property Location & Notes
                  </div>
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>
                      {selectedCustomer.address}, {selectedCustomer.city} {selectedCustomer.postalCode}
                    </span>
                  </div>
                  {selectedCustomer.notes && (
                    <div className="text-slate-600 italic">{selectedCustomer.notes}</div>
                  )}
                </div>
              </div>

              {/* Service & Communication History Tabs */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Activity & Communication History
                </h3>

                {customerDetails?.communications?.length > 0 ? (
                  <div className="space-y-2.5">
                    {customerDetails.communications.map((comm: any) => (
                      <div
                        key={comm._id}
                        className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded-md text-[10px]">
                            {comm.triggerTitle || comm.triggerEvent}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(comm.sentAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-700 font-normal">&ldquo;{comm.messageContent}&rdquo;</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 py-4 text-center">
                    No communication history yet.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 text-sm">
              Select a customer from the left to view profile & history.
            </div>
          )}
        </div>
      </div>

      {/* New Customer Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5 shrink-0">
              <h3 className="font-bold text-base text-slate-900">Add New H&H Customer</h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-4 sm:p-5 space-y-3.5 overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Jason Fraser"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Phone (SMS)</label>
                  <input
                    required
                    type="text"
                    placeholder="(604) 555-0182"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Email</label>
                  <input
                    required
                    type="email"
                    placeholder="jason@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Street Address</label>
                  <input
                    required
                    type="text"
                    placeholder="1234 Maple St"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Tags (Comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Gutter Cleaning, Spring, Roof Moss"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Property Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Gate codes, pet warnings, roof pitch details..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedCustomer && (
        <CommunicationSequenceModal
          isOpen={isCommModalOpen}
          onClose={() => {
            setIsCommModalOpen(false);
            handleSelectCustomer(selectedCustomer);
          }}
          defaultCustomer={selectedCustomer}
          defaultTrigger="estimate_sent"
        />
      )}
    </div>
  );
}
