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
  AlertCircle,
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
  Server,
  Lock,
  Send,
  Eye,
  EyeOff,
  Smartphone,
  Radio,
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
    // SMTP Email Settings
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    smtpSecure: false,
    smtpFromName: 'H&H House Maintenance',
    smtpFromEmail: 'info@hnhpros.ca',
    smtpEnabled: true,
    // Twilio SMS Settings
    twilioAccountSid: '',
    twilioAuthToken: '',
    twilioPhoneNumber: '',
    twilioMessagingServiceSid: '',
    twilioEnabled: true,
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

  // SMTP Testing states
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState('');
  const [smtpTestResult, setSmtpTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Twilio Testing states
  const [showTwilioToken, setShowTwilioToken] = useState(false);
  const [testingTwilio, setTestingTwilio] = useState(false);
  const [testPhoneRecipient, setTestPhoneRecipient] = useState('');
  const [twilioTestResult, setTwilioTestResult] = useState<{ success: boolean; message: string } | null>(null);

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
          if (data.data.email) {
            setTestEmailRecipient(data.data.email);
          }
          if (data.data.phone) {
            setTestPhoneRecipient(data.data.phone);
          }
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
        setNotice('All settings, Twilio API, SMTP configuration & pricing matrix saved successfully!');
        setTimeout(() => setNotice(null), 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Test SMTP connection & test email
  const handleTestSmtp = async () => {
    if (!settings.smtpHost || !settings.smtpUser) {
      setSmtpTestResult({
        success: false,
        message: 'Please enter SMTP Host and Username/Email before testing.',
      });
      return;
    }

    setTestingSmtp(true);
    setSmtpTestResult(null);

    try {
      const res = await fetch('/api/settings/test-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: settings.smtpHost,
          port: settings.smtpPort,
          user: settings.smtpUser,
          pass: settings.smtpPass,
          secure: settings.smtpSecure,
          fromName: settings.smtpFromName,
          fromEmail: settings.smtpFromEmail,
          testRecipient: testEmailRecipient || settings.email,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSmtpTestResult({
          success: true,
          message: data.message || 'SMTP Connection & credentials verified successfully!',
        });
      } else {
        setSmtpTestResult({
          success: false,
          message: data.error || 'SMTP Connection failed. Please check host, port, or password.',
        });
      }
    } catch (err: any) {
      setSmtpTestResult({
        success: false,
        message: err.message || 'Network error while testing SMTP connection.',
      });
    } finally {
      setTestingSmtp(false);
    }
  };

  // Test Twilio connection & test SMS
  const handleTestTwilio = async () => {
    if (!settings.twilioAccountSid || !settings.twilioAuthToken) {
      setTwilioTestResult({
        success: false,
        message: 'Please enter Twilio Account SID and Auth Token before testing.',
      });
      return;
    }

    setTestingTwilio(true);
    setTwilioTestResult(null);

    try {
      const res = await fetch('/api/settings/test-twilio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountSid: settings.twilioAccountSid,
          authToken: settings.twilioAuthToken,
          phoneNumber: settings.twilioPhoneNumber,
          messagingServiceSid: settings.twilioMessagingServiceSid,
          testRecipientPhone: testPhoneRecipient || settings.phone,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTwilioTestResult({
          success: true,
          message: data.message || 'Twilio connection & API credentials verified successfully!',
        });
      } else {
        setTwilioTestResult({
          success: false,
          message: data.error || 'Twilio API verification failed. Please check Account SID & Auth Token.',
        });
      }
    } catch (err: any) {
      setTwilioTestResult({
        success: false,
        message: err.message || 'Network error while validating Twilio API.',
      });
    } finally {
      setTestingTwilio(false);
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      setPasswordNotice('Passwords do not match or are empty.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordNotice('Password must be at least 6 characters.');
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setPasswordNotice('Password updated successfully in database!');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordNotice(data.error || 'Failed to update password.');
      }
    } catch (err: any) {
      setPasswordNotice('Network error while updating password.');
    } finally {
      setTimeout(() => setPasswordNotice(null), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            Business Settings, Twilio SMS & SMTP
          </h1>
          <p className="text-xs text-slate-500">
            Configure Twilio SMS Gateway, Outgoing SMTP Mail Server, Pricing Matrix, and Company Profile
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
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Two-Column Grid: Left (Twilio, SMTP, Business, Crew, Account) vs Right (Roof Matrix & Services) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT COLUMN (6 cols) ================= */}
        <div className="lg:col-span-6 space-y-6">
          {/* 1. TWILIO SMS GATEWAY CONFIGURATION CARD */}
          <div className="bg-white rounded-3xl border-2 border-emerald-200 p-6 shadow-xs space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Twilio SMS Gateway API</h2>
                  <p className="text-[11px] text-slate-400">Canadian & US text messaging service</p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Live SMS Engine
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Customer notifications (Estimate alerts, Crew en-route, Invoices, Review links, Seasonal Reminders) will be sent via this Twilio account.
            </p>

            <div className="space-y-3">
              {/* Account SID */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Twilio Account SID
                </label>
                <input
                  type="text"
                  value={settings.twilioAccountSid || ''}
                  onChange={(e) => setSettings({ ...settings, twilioAccountSid: e.target.value })}
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-mono font-medium"
                />
              </div>

              {/* Auth Token */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Twilio Auth Token
                </label>
                <div className="relative">
                  <input
                    type={showTwilioToken ? 'text' : 'password'}
                    value={settings.twilioAuthToken || ''}
                    onChange={(e) => setSettings({ ...settings, twilioAuthToken: e.target.value })}
                    placeholder="••••••••••••••••••••••••••••••••"
                    className="w-full pl-3 pr-9 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTwilioToken(!showTwilioToken)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                  >
                    {showTwilioToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Phone Number & Messaging Service SID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Twilio Phone Number
                  </label>
                  <input
                    type="text"
                    value={settings.twilioPhoneNumber || ''}
                    onChange={(e) => setSettings({ ...settings, twilioPhoneNumber: e.target.value })}
                    placeholder="+16045550199"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-mono font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Messaging Service SID <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={settings.twilioMessagingServiceSid || ''}
                    onChange={(e) => setSettings({ ...settings, twilioMessagingServiceSid: e.target.value })}
                    placeholder="MGxxxxxxxxxxxxxxx"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Live Test Twilio Section */}
              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 space-y-2">
                <label className="text-[11px] font-bold text-emerald-950 block">
                  Verify Twilio API & Send Test SMS
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Recipient phone (e.g. +16045550199)"
                    value={testPhoneRecipient}
                    onChange={(e) => setTestPhoneRecipient(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-emerald-200 bg-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleTestTwilio}
                    disabled={testingTwilio}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50 shadow-xs"
                  >
                    {testingTwilio ? (
                      <>
                        <Clock className="w-3.5 h-3.5 animate-spin" /> Verifying...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" /> Test SMS
                      </>
                    )}
                  </button>
                </div>

                {twilioTestResult && (
                  <div
                    className={`p-2.5 rounded-lg text-xs flex items-start gap-1.5 font-medium ${
                      twilioTestResult.success
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-rose-100 text-rose-900 border border-rose-300'
                    }`}
                  >
                    {twilioTestResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span>{twilioTestResult.message}</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleSaveAll()}
                className="w-full py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
              >
                Save Twilio Settings
              </button>
            </div>
          </div>

          {/* 2. SMTP EMAIL SERVER CONFIGURATION CARD */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">SMTP Email Server</h2>
                  <p className="text-[11px] text-slate-400">Outgoing email dispatch settings</p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                Email Dispatch
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Estimates, invoices, and seasonal reminders will be delivered from your company address via this SMTP mail server.
            </p>

            <div className="space-y-3">
              {/* Host & Port */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    SMTP Host / Server
                  </label>
                  <input
                    type="text"
                    value={settings.smtpHost || ''}
                    onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                    placeholder="e.g. smtp.gmail.com"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-medium font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Port
                  </label>
                  <input
                    type="number"
                    value={settings.smtpPort || 587}
                    onChange={(e) => setSettings({ ...settings, smtpPort: Number(e.target.value) })}
                    placeholder="587"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-mono font-medium"
                  />
                </div>
              </div>

              {/* Username & Password */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  SMTP Username / Email
                </label>
                <input
                  type="text"
                  value={settings.smtpUser || ''}
                  onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                  placeholder="e.g. info@hnhpros.ca"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  SMTP Password / App Password
                </label>
                <div className="relative">
                  <input
                    type={showSmtpPassword ? 'text' : 'password'}
                    value={settings.smtpPass || ''}
                    onChange={(e) => setSettings({ ...settings, smtpPass: e.target.value })}
                    placeholder="••••••••••••••••"
                    className="w-full pl-3 pr-9 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                  >
                    {showSmtpPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* From Name & From Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    From Sender Name
                  </label>
                  <input
                    type="text"
                    value={settings.smtpFromName || ''}
                    onChange={(e) => setSettings({ ...settings, smtpFromName: e.target.value })}
                    placeholder="H&H House Maintenance"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    From Sender Email
                  </label>
                  <input
                    type="email"
                    value={settings.smtpFromEmail || ''}
                    onChange={(e) => setSettings({ ...settings, smtpFromEmail: e.target.value })}
                    placeholder="info@hnhpros.ca"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              {/* SSL/TLS Toggle */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <div className="text-xs font-semibold text-slate-700">SSL / TLS Encryption</div>
                  <div className="text-[10px] text-slate-400">Turn on for Port 465 (SSL) or off for Port 587 (TLS/STARTTLS)</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(settings.smtpSecure)}
                    onChange={(e) => setSettings({ ...settings, smtpSecure: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Test Email Section */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 space-y-2">
                <label className="text-[11px] font-bold text-blue-900 block">
                  Test SMTP Connection & Send Verification Email
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    placeholder="Recipient email (e.g. your@gmail.com)"
                    value={testEmailRecipient}
                    onChange={(e) => setTestEmailRecipient(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-blue-200 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleTestSmtp}
                    disabled={testingSmtp}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
                  >
                    {testingSmtp ? (
                      <>
                        <Clock className="w-3.5 h-3.5 animate-spin" /> Testing...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" /> Test Connection
                      </>
                    )}
                  </button>
                </div>

                {smtpTestResult && (
                  <div
                    className={`p-2.5 rounded-lg text-xs flex items-start gap-1.5 font-medium ${
                      smtpTestResult.success
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-rose-100 text-rose-900 border border-rose-300'
                    }`}
                  >
                    {smtpTestResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span>{smtpTestResult.message}</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleSaveAll()}
                className="w-full py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
              >
                Save SMTP Settings
              </button>
            </div>
          </div>

          {/* 3. Business Profile Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Business Profile</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Shows on estimates, invoices, and customer communications.
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            </div>
          </div>

          {/* 4. Crew Members Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Crew Members</h2>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Hourly rate is what you pay them. A job keeps the rate it was booked at.
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
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:grid sm:grid-cols-12 gap-2 items-center text-xs"
                  >
                    <div className="w-full sm:col-span-5">
                      <input
                        type="text"
                        placeholder="Name"
                        value={member.name}
                        onChange={(e) => handleCrewChange(i, 'name', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                      />
                    </div>
                    <div className="w-full sm:col-span-4 flex items-center gap-2">
                      <div className="relative flex-1">
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
                      <span className="sm:hidden text-slate-500 text-[11px]">/ hour</span>
                    </div>
                    <div className="hidden sm:block sm:col-span-2 text-slate-500 text-[11px]">/ hour</div>
                    <div className="w-full sm:w-auto sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveCrew(i)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
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

          {/* 5. Account Password Card */}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

        {/* ================= RIGHT COLUMN (6 cols) ================= */}
        {/* Services & Prices Manager (Roof Matrix + Custom Services) */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
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
