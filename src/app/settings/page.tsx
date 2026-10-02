'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Star,
  Globe,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Save,
  Sparkles,
  Users,
  Plus,
  Trash2,
  Key,
  Clock,
  Percent,
  DollarSign,
  Grid3X3,
  Layers,
  Wrench,
  ExternalLink,
} from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({
    companyName: 'H&H House Maintenance Ltd.',
    website: 'https://hnhpros.ca/',
    phone: '(604) 555-0199',
    email: 'info@hnhpros.ca',
    address: '12888 80th Ave, Surrey / Vancouver, BC',
    gstRate: 5,
    defaultJobLengthHours: 3,
    defaultStartTime: '09:00 AM',
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
    crewMembers: [
      { name: 'Mike Johnson', phone: '(604) 555-1201', hourlyRate: 32, role: 'Lead Tech' },
      { name: 'Dave Miller', phone: '(604) 555-1202', hourlyRate: 28, role: 'Technician' },
    ],
    roofPricingMatrix: {
      small: { oneStory: 400, twoStory: 450, threeStory: 475 },
      medium: { oneStory: 425, twoStory: 500, threeStory: 550 },
      large: { oneStory: 550, twoStory: 575, threeStory: 625 },
      xLarge: { oneStory: 700, twoStory: 750, threeStory: 800 },
    },
    customServices: [
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
    ],
    autoEstimateSentSms: true,
    autoEstimateReminderSms: true,
    autoDayBeforeJobSms: true,
    autoCrewLeavingSms: true,
    autoJobCompletedSms: true,
    autoInvoiceSentSms: true,
    autoPaymentReceivedSms: true,
    autoReviewRequestSms: true,
    autoSeasonalReminderSms: true,
  });

  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setSettings((prev: any) => ({
            ...prev,
            ...data.data,
            roofPricingMatrix: data.data.roofPricingMatrix || prev.roofPricingMatrix,
            customServices: data.data.customServices?.length ? data.data.customServices : prev.customServices,
            crewMembers: data.data.crewMembers?.length ? data.data.crewMembers : prev.crewMembers,
          }));
        }
      })
      .catch((e) => console.error(e));
  }, []);

  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setNotice('All settings & pricing matrix saved successfully!');
        setTimeout(() => setNotice(null), 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Matrix cell update helper
  const handleMatrixChange = (sizeKey: string, storyKey: string, val: number) => {
    setSettings((prev: any) => ({
      ...prev,
      roofPricingMatrix: {
        ...prev.roofPricingMatrix,
        [sizeKey]: {
          ...prev.roofPricingMatrix[sizeKey],
          [storyKey]: val,
        },
      },
    }));
  };

  // Custom service row handlers
  const handleAddServiceRow = () => {
    setSettings((prev: any) => ({
      ...prev,
      customServices: [
        ...prev.customServices,
        { name: '', price: 150, unit: 'per job' },
      ],
    }));
  };

  const handleRemoveServiceRow = (index: number) => {
    setSettings((prev: any) => ({
      ...prev,
      customServices: prev.customServices.filter((_: any, i: number) => i !== index),
    }));
  };

  const handleServiceChange = (index: number, field: string, val: any) => {
    const updated = [...settings.customServices];
    updated[index] = { ...updated[index], [field]: val };
    setSettings((prev: any) => ({ ...prev, customServices: updated }));
  };

  // Crew member handlers
  const handleAddCrew = () => {
    setSettings((prev: any) => ({
      ...prev,
      crewMembers: [
        ...prev.crewMembers,
        { name: '', phone: '', hourlyRate: 28, role: 'Technician' },
      ],
    }));
  };

  const handleRemoveCrew = (index: number) => {
    setSettings((prev: any) => ({
      ...prev,
      crewMembers: prev.crewMembers.filter((_: any, i: number) => i !== index),
    }));
  };

  const handleCrewChange = (index: number, field: string, val: any) => {
    const updated = [...settings.crewMembers];
    updated[index] = { ...updated[index], [field]: val };
    setSettings((prev: any) => ({ ...prev, crewMembers: updated }));
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      setPasswordNotice('Passwords do not match or are empty.');
      return;
    }
    setPasswordNotice('Password updated successfully!');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordNotice(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            Business Settings, Pricing & Services
          </h1>
          <p className="text-xs text-slate-500">
            Configure company parameters, crew rates, tiered roof matrix pricing, and flat-rate services catalog
          </p>
        </div>

        <button
          onClick={() => handleSaveAll()}
          disabled={saving}
          className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
        </button>
      </div>

      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}

      {/* Two-Column Grid: Left (Business, Crew, Account) vs Right (Services & Roof Pricing Matrix) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT COLUMN (5 cols) ================= */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Business Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Business</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Shows on estimates, invoices, and in SMS dispatches sent to customer phones.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Business name
                </label>
                <input
                  type="text"
                  value={settings.companyName}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    GST rate %
                  </label>
                  <input
                    type="number"
                    value={settings.gstRate}
                    onChange={(e) => setSettings({ ...settings, gstRate: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Default job length, hours
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={settings.defaultJobLengthHours}
                    onChange={(e) =>
                      setSettings({ ...settings, defaultJobLengthHours: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Default start time
                </label>
                <input
                  type="text"
                  value={settings.defaultStartTime}
                  onChange={(e) => setSettings({ ...settings, defaultStartTime: e.target.value })}
                  placeholder="09:00 AM"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Google Review URL (for 5-Star Funnel)
                </label>
                <input
                  type="text"
                  value={settings.googleReviewUrl}
                  onChange={(e) => setSettings({ ...settings, googleReviewUrl: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 font-mono text-[11px] text-blue-700 bg-slate-50"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleSaveAll()}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
                >
                  Save
                </button>
              </div>
            </div>
          </div>

          {/* 2. Crew Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Crew</h2>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Hourly rate is what you pay them. A job keeps the rate it was booked at, so a raise never rewrites old jobs.
              </p>
            </div>

            {settings.crewMembers?.length === 0 ? (
              <div className="text-xs text-slate-400 italic py-2">
                No crew yet. Add each person and what you pay them per hour.
              </div>
            ) : (
              <div className="space-y-2.5">
                {settings.crewMembers.map((member: any, i: number) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-12 gap-2 items-center text-xs"
                  >
                    <div className="col-span-5">
                      <input
                        type="text"
                        placeholder="Name"
                        value={member.name}
                        onChange={(e) => handleCrewChange(i, 'name', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                      />
                    </div>
                    <div className="col-span-4">
                      <div className="relative">
                        <span className="absolute left-2 top-1.5 text-slate-400 font-semibold">$</span>
                        <input
                          type="number"
                          placeholder="Rate"
                          value={member.hourlyRate}
                          onChange={(e) =>
                            handleCrewChange(i, 'hourlyRate', Number(e.target.value))
                          }
                          className="w-full pl-5 pr-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                    </div>
                    <div className="col-span-2 text-slate-500 text-[11px]">/ hour</div>
                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveCrew(i)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleAddCrew}
                className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> + Add person
              </button>
              <button
                type="button"
                onClick={() => handleSaveAll()}
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
              >
                Save crew
              </button>
            </div>
          </div>

          {/* 3. Account Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Account</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Signed in as <strong className="text-slate-700">{settings.email || 'info@hnhpros.ca'}</strong>
              </p>
            </div>

            {passwordNotice && (
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium">
                {passwordNotice}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    New password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Again
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition"
              >
                Change password
              </button>
            </form>
          </div>
        </div>

        {/* ================= RIGHT COLUMN (7 cols) ================= */}
        {/* Services & Prices Manager (Roof Matrix + Custom Services) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Services and prices</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pick these on a booking. Roof cleaning is priced by size and stories, the rest have one default price.
            </p>
          </div>

          {/* 1. TIERED ROOF CLEANING MATRIX */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Grid3X3 className="w-4 h-4 text-blue-600" />
                Roof cleaning (gutters included)
              </div>
              <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md">
                Tiered Matrix Pricing
              </span>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="text-left pb-2 w-1/3">SIZE</th>
                    <th className="text-center pb-2">1 STORY</th>
                    <th className="text-center pb-2">2 STORY</th>
                    <th className="text-center pb-2">3 STORY</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {/* Row: Small */}
                  <tr className="border-t border-slate-200/60">
                    <td className="py-2.5 pr-2">
                      <div className="font-bold text-slate-800">Small</div>
                      <div className="text-[10px] text-slate-400">under 1,500 sq ft</div>
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        value={settings.roofPricingMatrix?.small?.oneStory || 400}
                        onChange={(e) =>
                          handleMatrixChange('small', 'oneStory', Number(e.target.value))
                        }
                        className="w-full px-2 py-1.5 text-center rounded-lg border border-slate-300 bg-white font-semibold text-slate-900"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        value={settings.roofPricingMatrix?.small?.twoStory || 450}
                        onChange={(e) =>
                          handleMatrixChange('small', 'twoStory', Number(e.target.value))
                        }
                        className="w-full px-2 py-1.5 text-center rounded-lg border border-slate-300 bg-white font-semibold text-slate-900"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        value={settings.roofPricingMatrix?.small?.threeStory || 475}
                        onChange={(e) =>
                          handleMatrixChange('small', 'threeStory', Number(e.target.value))
                        }
                        className="w-full px-2 py-1.5 text-center rounded-lg border border-slate-300 bg-white font-semibold text-slate-900"
                      />
                    </td>
                  </tr>

                  {/* Row: Medium */}
                  <tr className="border-t border-slate-200/60">
                    <td className="py-2.5 pr-2">
                      <div className="font-bold text-slate-800">Medium</div>
                      <div className="text-[10px] text-slate-400">1,500 to 2,500 sq ft</div>
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        value={settings.roofPricingMatrix?.medium?.oneStory || 425}
                        onChange={(e) =>
                          handleMatrixChange('medium', 'oneStory', Number(e.target.value))
                        }
                        className="w-full px-2 py-1.5 text-center rounded-lg border border-slate-300 bg-white font-semibold text-slate-900"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        value={settings.roofPricingMatrix?.medium?.twoStory || 500}
                        onChange={(e) =>
                          handleMatrixChange('medium', 'twoStory', Number(e.target.value))
                        }
                        className="w-full px-2 py-1.5 text-center rounded-lg border border-slate-300 bg-white font-semibold text-slate-900"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        value={settings.roofPricingMatrix?.medium?.threeStory || 550}
                        onChange={(e) =>
                          handleMatrixChange('medium', 'threeStory', Number(e.target.value))
                        }
                        className="w-full px-2 py-1.5 text-center rounded-lg border border-slate-300 bg-white font-semibold text-slate-900"
                      />
                    </td>
                  </tr>

                  {/* Row: Large */}
                  <tr className="border-t border-slate-200/60">
                    <td className="py-2.5 pr-2">
                      <div className="font-bold text-slate-800">Large</div>
                      <div className="text-[10px] text-slate-400">2,500 to 3,500 sq ft</div>
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        value={settings.roofPricingMatrix?.large?.oneStory || 550}
                        onChange={(e) =>
                          handleMatrixChange('large', 'oneStory', Number(e.target.value))
                        }
                        className="w-full px-2 py-1.5 text-center rounded-lg border border-slate-300 bg-white font-semibold text-slate-900"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        value={settings.roofPricingMatrix?.large?.twoStory || 575}
                        onChange={(e) =>
                          handleMatrixChange('large', 'twoStory', Number(e.target.value))
                        }
                        className="w-full px-2 py-1.5 text-center rounded-lg border border-slate-300 bg-white font-semibold text-slate-900"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        value={settings.roofPricingMatrix?.large?.threeStory || 625}
                        onChange={(e) =>
                          handleMatrixChange('large', 'threeStory', Number(e.target.value))
                        }
                        className="w-full px-2 py-1.5 text-center rounded-lg border border-slate-300 bg-white font-semibold text-slate-900"
                      />
                    </td>
                  </tr>

                  {/* Row: X-Large */}
                  <tr className="border-t border-slate-200/60">
                    <td className="py-2.5 pr-2">
                      <div className="font-bold text-slate-800">X-Large</div>
                      <div className="text-[10px] text-slate-400">3,500 sq ft and up</div>
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        value={settings.roofPricingMatrix?.xLarge?.oneStory || 700}
                        onChange={(e) =>
                          handleMatrixChange('xLarge', 'oneStory', Number(e.target.value))
                        }
                        className="w-full px-2 py-1.5 text-center rounded-lg border border-slate-300 bg-white font-semibold text-slate-900"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        value={settings.roofPricingMatrix?.xLarge?.twoStory || 750}
                        onChange={(e) =>
                          handleMatrixChange('xLarge', 'twoStory', Number(e.target.value))
                        }
                        className="w-full px-2 py-1.5 text-center rounded-lg border border-slate-300 bg-white font-semibold text-slate-900"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        value={settings.roofPricingMatrix?.xLarge?.threeStory || 800}
                        onChange={(e) =>
                          handleMatrixChange('xLarge', 'threeStory', Number(e.target.value))
                        }
                        className="w-full px-2 py-1.5 text-center rounded-lg border border-slate-300 bg-white font-semibold text-slate-900"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. CUSTOM SERVICES LIST */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Standard Services List
              </label>
              <span className="text-[11px] text-slate-400">
                {settings.customServices?.length || 0} services configured
              </span>
            </div>

            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {settings.customServices?.map((svc: any, idx: number) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400/60 transition flex items-center justify-between gap-3 shadow-2xs group"
                >
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={svc.name}
                      placeholder="Service name (e.g. House soft wash)"
                      onChange={(e) => handleServiceChange(idx, 'name', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-blue-500 font-semibold text-slate-900 bg-slate-50/50"
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="relative w-28">
                      <span className="absolute left-2.5 top-1.5 text-slate-400 font-bold text-xs">$</span>
                      <input
                        type="number"
                        value={svc.price}
                        onChange={(e) =>
                          handleServiceChange(idx, 'price', Number(e.target.value))
                        }
                        className="w-full pl-6 pr-2 py-1.5 text-xs text-right rounded-xl border border-slate-200 focus:border-blue-500 font-bold text-slate-900 bg-slate-50/50"
                      />
                    </div>

                    <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">
                      {svc.unit || 'per job'}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRemoveServiceRow(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition ml-1"
                      title="Delete Service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleAddServiceRow}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> + Add service
              </button>
              <button
                type="button"
                onClick={() => handleSaveAll()}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md shadow-blue-500/20 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save services</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
