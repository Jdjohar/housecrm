'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Calendar,
  Send,
  Users,
  CheckCircle2,
  Clock,
  Flame,
  Sun,
  CloudRain,
  Snowflake,
  Flower2,
  Leaf,
  ShieldCheck,
  Percent,
  ArrowRight,
  TrendingUp,
  Mail,
  Smartphone,
  Layers,
  Edit3,
  Eye,
  Check,
} from 'lucide-react';

interface Campaign {
  _id: string;
  season: 'Spring' | 'Summer' | 'Fall' | 'Winter';
  title: string;
  description: string;
  recommendedServices: string[];
  suggestedMonths: string;
  discountOffer: string;
  defaultSmsTemplate: string;
  defaultEmailTemplate: string;
  targetCount: number;
  sentCount: number;
  responseCount: number;
  status: string;
  lastRunAt?: string;
}

export default function SeasonalRemindersPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [counts, setCounts] = useState<any>({ Spring: 0, Summer: 0, Fall: 0, TotalOptIn: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState<'Spring' | 'Summer' | 'Fall'>('Spring');
  const [channel, setChannel] = useState<'both' | 'email' | 'sms'>('both');
  const [customDiscount, setCustomDiscount] = useState('10% Early Bird Spring Special');
  
  // Custom message states
  const [customSubject, setCustomSubject] = useState('');
  const [customEmailBody, setCustomEmailBody] = useState('');
  const [customSmsText, setCustomSmsText] = useState('');
  const [activePreviewTab, setActivePreviewTab] = useState<'email' | 'sms'>('email');

  const [launching, setLaunching] = useState(false);
  const [launchResult, setLaunchResult] = useState<any>(null);

  const fetchSeasonal = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/seasonal');
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.data);
        setCounts(data.eligibleCounts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeasonal();
  }, []);

  // Update default templates when season or discount changes
  useEffect(() => {
    if (selectedSeason === 'Spring') {
      setCustomDiscount('10% Early Bird Spring Special');
      setCustomSubject('🌸 Spring Exterior Care Checklist & Special Offer - H&H House Maintenance');
      setCustomEmailBody(
        `Hi {{First_Name}},\n\nSpring has arrived in BC, and it's the optimal time to protect your home from winter buildup:\n• Full Gutter Cleaning & Downspout Debris Removal\n• Vinyl Siding & Soft House Wash (eliminate mold/mildew)\n• Driveway & Concrete Surface Power Washing\n• Exterior Window Glass Cleaning\n\n🎁 Special Offer: 10% Early Bird Spring Special for returning customers!\n\nSlots fill rapidly as the weather warms up. Reply to this email or call (604) 555-0199 to claim your priority schedule.\n\nBest regards,\nThe H&H House Maintenance Team (hnhpros.ca)`
      );
      setCustomSmsText(
        `Hi {{First_Name}}, spring is here! Time to clear winter debris. Book your H&H Gutter Cleaning, House Wash & Driveway power washing before slots fill up. Special: 10% Early Bird Discount! Call (604) 555-0199`
      );
    } else if (selectedSeason === 'Summer') {
      setCustomDiscount('Free Walkway Scrub with BBQ Patio Wash');
      setCustomSubject('☀️ Summer Exterior Revival & Pressure Washing - H&H House Maintenance');
      setCustomEmailBody(
        `Hi {{First_Name}},\n\nGet your outdoor spaces shining and ready for summer living!\n• High-Pressure Patio & Driveway Cleaning\n• Deck & Wooden Fence Wash & Restoration\n• Sparkling Exterior Window Cleaning\n\n🎁 Seasonal Incentive: Free Walkway Scrub with BBQ Patio Wash!\n\nCall/text (604) 555-0199 or reply directly to book your preferred summer date.\n\nBest regards,\nH&H House Maintenance Team`
      );
      setCustomSmsText(
        `Hi {{First_Name}}, get your patio & outdoor spaces shining for summer! H&H Pressure washing, fence & deck restoration. Special: Free Walkway Scrub! Call (604) 555-0199`
      );
    } else if (selectedSeason === 'Fall') {
      setCustomDiscount('15% Off Roof De-Mossing with Gutter Package');
      setCustomSubject('🍂 Essential Fall Home Defense: Gutter & Roof Moss Treatment - H&H House Maintenance');
      setCustomEmailBody(
        `Hi {{First_Name}},\n\nHeavy BC rains and fall leaves are on the way. Prevent costly roof leaks and overflow damage:\n• Thorough Gutter Cleaning & Downspout Water Flow Test\n• Roof De-Mossing & Zinc/Eco Anti-Fungal Treatment\n• Exterior Siding Wash\n\n🎁 Fall Special: 15% Off Roof De-Mossing with Gutter Package!\n\nProtect your home before the storm season. Reply or call (604) 555-0199 to lock in your date.\n\nBest regards,\nH&H House Maintenance (hnhpros.ca)`
      );
      setCustomSmsText(
        `Hi {{First_Name}}, fall leaves are falling! Protect your roof with H&H Gutter Cleaning & Roof Moss Treatment. Special: 15% Off Roof De-Mossing! Call (604) 555-0199`
      );
    }
  }, [selectedSeason]);

  const currentCampaign = campaigns.find((c) => c.season === selectedSeason);

  const handleLaunchCampaign = async () => {
    setLaunching(true);
    setLaunchResult(null);
    try {
      const res = await fetch('/api/seasonal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          season: selectedSeason,
          channel: channel,
          discountOffer: customDiscount,
          customSubject,
          customEmailBody,
          customSmsText,
        }),
      });
      const data = await res.json();
      setLaunchResult(data);
      fetchSeasonal();
    } catch (e) {
      console.error(e);
    } finally {
      setLaunching(false);
    }
  };

  const getSeasonIcon = (season: string) => {
    switch (season) {
      case 'Spring':
        return <Flower2 className="w-5 h-5 text-emerald-500" />;
      case 'Summer':
        return <Sun className="w-5 h-5 text-amber-500" />;
      case 'Fall':
        return <Leaf className="w-5 h-5 text-orange-500" />;
      default:
        return <Snowflake className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-400/20 text-teal-300 text-xs font-bold border border-teal-400/30">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            Predictive Re-Engagement Engine
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            Seasonal Reminders & Marketing Blasts
          </h1>
          <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed">
            Dispatch customized seasonal offers via <strong className="text-teal-300">Email</strong>, <strong className="text-teal-300">SMS</strong>, or <strong className="text-teal-300">Both</strong> to past clients for Spring house washing, Summer pressure washing, and Fall gutter/moss clearing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-800/80 px-5 py-3 rounded-2xl border border-slate-700 text-center shadow-lg">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total Repeat Pool</div>
            <div className="text-2xl font-black text-white">{counts.TotalOptIn || 5} Customers</div>
          </div>
        </div>
      </div>

      {/* Season Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* SPRING */}
        <button
          type="button"
          onClick={() => setSelectedSeason('Spring')}
          className={`p-6 rounded-3xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
            selectedSeason === 'Spring'
              ? 'bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 hover:border-emerald-300 shadow-xs'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <Flower2 className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                March - May
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">🌸 Spring Campaign</h3>
              <p className="text-xs text-slate-500 mt-1">
                Post-winter revitalization, mold removal & clean window glass
              </p>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-700">
              <div className="font-bold text-[11px] uppercase tracking-wider text-emerald-700">
                Included Services:
              </div>
              <div className="flex items-center gap-1.5">✓ Gutter cleaning</div>
              <div className="flex items-center gap-1.5">✓ House wash (vinyl siding)</div>
              <div className="flex items-center gap-1.5">✓ Driveway power wash</div>
              <div className="flex items-center gap-1.5">✓ Window cleaning</div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
            <span>{counts.Spring || 5} Eligible Customers</span>
            <span className="flex items-center gap-1">
              Select <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </button>

        {/* SUMMER */}
        <button
          type="button"
          onClick={() => setSelectedSeason('Summer')}
          className={`p-6 rounded-3xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
            selectedSeason === 'Summer'
              ? 'bg-gradient-to-br from-amber-50 via-white to-amber-50/30 border-amber-500 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200 hover:border-amber-300 shadow-xs'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center">
                <Sun className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                June - August
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">☀️ Summer Campaign</h3>
              <p className="text-xs text-slate-500 mt-1">
                Outdoor living prep, BBQ patio cleaning, fence & deck care
              </p>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-700">
              <div className="font-bold text-[11px] uppercase tracking-wider text-amber-700">
                Included Services:
              </div>
              <div className="flex items-center gap-1.5">✓ Pressure washing (patio/walkway)</div>
              <div className="flex items-center gap-1.5">✓ Lawn care & edging</div>
              <div className="flex items-center gap-1.5">✓ Fence wash & stain prep</div>
              <div className="flex items-center gap-1.5">✓ Deck restoration</div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600">
            <span>{counts.Summer || 5} Eligible Customers</span>
            <span className="flex items-center gap-1">
              Select <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </button>

        {/* FALL */}
        <button
          type="button"
          onClick={() => setSelectedSeason('Fall')}
          className={`p-6 rounded-3xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
            selectedSeason === 'Fall'
              ? 'bg-gradient-to-br from-orange-50 via-white to-orange-50/30 border-orange-500 shadow-lg shadow-orange-500/10 ring-2 ring-orange-500/20'
              : 'bg-white border-slate-200 hover:border-orange-300 shadow-xs'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800">
                Sept - November
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">🍂 Fall Campaign</h3>
              <p className="text-xs text-slate-500 mt-1">
                Storm defense, gutter unblocking & roof moss eradication
              </p>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-700">
              <div className="font-bold text-[11px] uppercase tracking-wider text-orange-700">
                Included Services:
              </div>
              <div className="flex items-center gap-1.5">✓ Gutter cleaning (leaf blockages)</div>
              <div className="flex items-center gap-1.5">✓ Roof cleaning</div>
              <div className="flex items-center gap-1.5">✓ Moss treatment & prevention</div>
              <div className="flex items-center gap-1.5">✓ Downspout water flow test</div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-orange-600">
            <span>{counts.Fall || 5} Eligible Customers</span>
            <span className="flex items-center gap-1">
              Select <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </button>
      </div>

      {/* Selected Season Campaign Launchpad */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
        {/* Header & Launch Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              {getSeasonIcon(selectedSeason)}
              <span>Configuring {selectedSeason} Campaign Blast</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1">
              {currentCampaign?.title || `${selectedSeason} Maintenance Blast`}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentCampaign?.description || 'Send targeted seasonal reminders directly to client phones and inboxes.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLaunchCampaign}
              disabled={launching}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm transition shadow-lg shadow-blue-500/25 flex items-center gap-2 disabled:opacity-50"
            >
              {launching ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" /> Dispatching Messages...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> 1-Click Launch {selectedSeason} Reminders
                </>
              )}
            </button>
          </div>
        </div>

        {/* Launch confirmation notification */}
        {launchResult && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="font-semibold">{launchResult.message}</span>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              {launchResult.totalDispatched} Delivered
            </span>
          </div>
        )}

        {/* Delivery Channel Selector */}
        <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            1. Select Delivery Channel (ਕਿਸ ਮਾਧਿਅਮ ਰਾਹੀਂ ਭੇਜਣਾ ਹੈ)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Both (SMS + Email) */}
            <button
              type="button"
              onClick={() => setChannel('both')}
              className={`p-3.5 rounded-xl border text-left transition flex items-center gap-3 ${
                channel === 'both'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className={`p-2 rounded-lg ${channel === 'both' ? 'bg-white/20' : 'bg-blue-50 text-blue-600'}`}>
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold">SMS + Email (Both)</div>
                <div className={`text-[10px] ${channel === 'both' ? 'text-blue-100' : 'text-slate-400'}`}>
                  Highest conversion & reach
                </div>
              </div>
            </button>

            {/* Email Only */}
            <button
              type="button"
              onClick={() => {
                setChannel('email');
                setActivePreviewTab('email');
              }}
              className={`p-3.5 rounded-xl border text-left transition flex items-center gap-3 ${
                channel === 'email'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className={`p-2 rounded-lg ${channel === 'email' ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'}`}>
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Email Blast Only</div>
                <div className={`text-[10px] ${channel === 'email' ? 'text-blue-100' : 'text-slate-400'}`}>
                  Via SMTP Mail Server
                </div>
              </div>
            </button>

            {/* SMS Only */}
            <button
              type="button"
              onClick={() => {
                setChannel('sms');
                setActivePreviewTab('sms');
              }}
              className={`p-3.5 rounded-xl border text-left transition flex items-center gap-3 ${
                channel === 'sms'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className={`p-2 rounded-lg ${channel === 'sms' ? 'bg-white/20' : 'bg-emerald-50 text-emerald-600'}`}>
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold">SMS Text Only</div>
                <div className={`text-[10px] ${channel === 'sms' ? 'text-blue-100' : 'text-slate-400'}`}>
                  Direct to customer phone
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Campaign Configuration & Preview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Custom Offer & Message Editor (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-blue-600" />
              2. Customize Offer & Message Copy
            </h3>

            {/* Offer Input */}
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">
                Special Seasonal Discount / Incentive Headline
              </label>
              <input
                type="text"
                value={customDiscount}
                onChange={(e) => setCustomDiscount(e.target.value)}
                placeholder="e.g. 10% Early Bird Special"
                className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            {/* Email Subject (if email or both is enabled) */}
            {(channel === 'email' || channel === 'both') && (
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">
                  Email Subject Line
                </label>
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            )}

            {/* Email Body Editor */}
            {(channel === 'email' || channel === 'both') && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-600">Email Message Body</label>
                  <span className="text-[10px] text-slate-400">Supports &#123;&#123;First_Name&#125;&#125;</span>
                </div>
                <textarea
                  rows={6}
                  value={customEmailBody}
                  onChange={(e) => setCustomEmailBody(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-normal leading-relaxed"
                />
              </div>
            )}

            {/* SMS Copy Editor */}
            {(channel === 'sms' || channel === 'both') && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-600">SMS Text Message</label>
                  <span className="text-[10px] text-slate-400">{customSmsText.length} characters</span>
                </div>
                <textarea
                  rows={3}
                  value={customSmsText}
                  onChange={(e) => setCustomSmsText(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-normal leading-relaxed"
                />
              </div>
            )}
          </div>

          {/* RIGHT: Live Customer Preview (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                3. Live Customer Preview
              </h3>

              {/* Toggle preview mode */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('email')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    activePreviewTab === 'email'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" /> Email
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('sms')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    activePreviewTab === 'sms'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> SMS
                </button>
              </div>
            </div>

            {/* Email Preview */}
            {activePreviewTab === 'email' ? (
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                <div className="p-3 bg-slate-100 border-b border-slate-200 text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500 text-[11px] w-12">From:</span>
                    <span className="text-slate-800 font-medium">H&H House Maintenance &lt;info@hnhpros.ca&gt;</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500 text-[11px] w-12">Subject:</span>
                    <span className="text-slate-900 font-bold">{customSubject}</span>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="text-center pb-3 border-b border-slate-100">
                    <div className="font-black text-slate-900 text-sm">H&H House Maintenance Ltd.</div>
                    <div className="text-[10px] text-slate-400">Surrey / Vancouver, BC • (604) 555-0199</div>
                  </div>

                  <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">
                    {customEmailBody.replace('{{First_Name}}', 'John')}
                  </div>

                  <div className="pt-2 text-center">
                    <span className="inline-block bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl">
                      Book Online / Call Now: (604) 555-0199
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* SMS Preview */
              <div className="p-5 bg-slate-900 text-white rounded-2xl text-xs space-y-3 leading-relaxed font-sans shadow-lg">
                <div className="text-[11px] text-slate-400 border-b border-slate-800 pb-2 flex justify-between items-center">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Smartphone className="w-3.5 h-3.5 text-blue-400" /> H&H SMS Dispatch
                  </span>
                  <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px]">{selectedSeason} Blast</span>
                </div>
                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 text-slate-100">
                  {customSmsText.replace('{{First_Name}}', 'John')}
                </div>
                <div className="text-[10px] text-slate-500 text-right">
                  Standard carrier rates apply • Reply STOP to unsubscribe
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
