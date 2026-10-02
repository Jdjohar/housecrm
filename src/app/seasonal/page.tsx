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
  const [customDiscount, setCustomDiscount] = useState('10% Early Bird Special');
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
          discountOffer: customDiscount,
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
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-400/20 text-teal-300 text-xs font-bold border border-teal-400/30">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            Predictive Maintenance Engine
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Automatic Seasonal Reminders
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Re-engage previous H&H House Maintenance customers at the exact optimal time for their home exterior services (Spring house washes, Summer pressure washing, Fall gutter & moss clearing).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700 text-center">
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Total Repeat Pool</div>
            <div className="text-xl font-black text-white">{counts.TotalOptIn || 5} Customers</div>
          </div>
        </div>
      </div>

      {/* Season Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* SPRING */}
        <button
          type="button"
          onClick={() => {
            setSelectedSeason('Spring');
            setCustomDiscount('10% Early Bird Spring Special');
          }}
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

            {/* Checklist */}
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
          onClick={() => {
            setSelectedSeason('Summer');
            setCustomDiscount('Complimentary Walkway Scrub with Patio Wash');
          }}
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

            {/* Checklist */}
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
          onClick={() => {
            setSelectedSeason('Fall');
            setCustomDiscount('15% Off Roof De-Mossing with Gutter Clean');
          }}
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

            {/* Checklist */}
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              {getSeasonIcon(selectedSeason)}
              <span>Configuring {selectedSeason} Reminder Blast</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1">
              {currentCampaign?.title || `${selectedSeason} Maintenance Blast`}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentCampaign?.description}
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
                  <Clock className="w-4 h-4 animate-spin" /> Dispatching Reminders...
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
              <span>{launchResult.message}</span>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              {launchResult.totalDispatched} Delivered
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Custom Offer & Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Percent className="w-4 h-4 text-blue-600" />
              Campaign Offer & Incentive
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">
                Special Seasonal Discount Headline
              </label>
              <input
                type="text"
                value={customDiscount}
                onChange={(e) => setCustomDiscount(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-700">Target Customer Criteria:</div>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                <li>Previous customers with completed service &gt;4 months ago</li>
                <li>Homes tagged for {selectedSeason} services (Gutter, Roof, Power Wash)</li>
                <li>Customers with SMS notifications enabled</li>
              </ul>
            </div>
          </div>

          {/* SMS & Email Copy Preview */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-600" />
              Personalized Customer SMS Template
            </h3>

            <div className="p-4 bg-slate-900 text-white rounded-2xl text-xs space-y-2 leading-relaxed font-sans shadow-inner">
              <div className="text-[11px] text-slate-400 border-b border-slate-800 pb-1.5 flex justify-between">
                <span>H&H House Maintenance Auto-SMS</span>
                <span>{selectedSeason} Blast</span>
              </div>
              <p className="pt-1 text-slate-200">
                {selectedSeason === 'Spring' && (
                  <>
                    Hi <span className="text-amber-300 font-bold">&#123;&#123;First_Name&#125;&#125;</span>, spring is here! Time to clear winter debris. Book your H&H Gutter Cleaning, House Wash & Driveway power washing before slots fill up: (604) 555-0199
                  </>
                )}
                {selectedSeason === 'Summer' && (
                  <>
                    Hi <span className="text-amber-300 font-bold">&#123;&#123;First_Name&#125;&#125;</span>, get your patio & outdoor spaces shining for summer! H&H Pressure washing, fence & deck restoration: (604) 555-0199
                  </>
                )}
                {selectedSeason === 'Fall' && (
                  <>
                    Hi <span className="text-amber-300 font-bold">&#123;&#123;First_Name&#125;&#125;</span>, fall leaves are falling! Protect your home with H&H Gutter Cleaning, Roof De-mossing & Moss Treatment: (604) 555-0199
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
