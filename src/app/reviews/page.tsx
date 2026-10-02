'use client';

import React, { useState, useEffect } from 'react';
import {
  Star,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  User,
  Phone,
  Clock,
  RefreshCw,
  Send,
  Sliders,
  Filter,
} from 'lucide-react';
import CommunicationSequenceModal from '@/components/CommunicationSequenceModal';

export default function ReviewsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reviews');
      const json = await res.json();
      if (json.success) setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, responseStatus: newStatus }),
      });
      fetchReviews();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const reviews = data?.reviews || [];
  const stats = data?.stats || {
    totalRequested: 0,
    totalReceived: 0,
    avgRating: 5.0,
    fiveStarCount: 0,
    privateFeedbackCount: 0,
    responseRatePercent: 0,
    googleConversionPercent: 0,
    statusBreakdown: { new: 0, reviewed: 0, contacted_client: 0, resolved: 0 },
  };

  const filteredReviews = reviews.filter((r: any) => {
    if (filterType === '5star') return r.rating === 5;
    if (filterType === 'private') return r.rating && r.rating < 5;
    if (filterType === 'pending') return !r.rating;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
            <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            Smart 5-Star Google Review Filter & Reputation Hub
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Review Request & Feedback Management
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Automatically funnels 5-Star reviews to your public Google Business profile while safeguarding customer satisfaction by routing private constructive feedback directly to H&H management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={data?.googleReviewUrl || 'https://search.google.com'}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
          >
            <span>Google Review Link</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs hover:from-amber-300 hover:to-amber-400 transition shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Review Request SMS</span>
          </button>
        </div>
      </div>

      {/* KPI Tracking Cards as required */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Reviews Requested */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Reviews Requested
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {stats.totalRequested}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Automated after invoice payment</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Send className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Reviews Received */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Reviews Received
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {stats.totalReceived}
            </div>
            <div className="text-xs text-emerald-600 font-semibold mt-0.5">
              {stats.responseRatePercent}% Response Rate
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Average Rating */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Average Rating
            </div>
            <div className="text-3xl font-extrabold text-amber-500 mt-1 flex items-center gap-1.5">
              <span>{stats.avgRating}</span>
              <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Out of 5.0 Stars</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: 5-Star Google Filter Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Google Funnel Rate
            </div>
            <div className="text-3xl font-extrabold text-indigo-600 mt-1">
              {stats.googleConversionPercent}%
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {stats.fiveStarCount} Google vs {stats.privateFeedbackCount} Private
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Response Status Tracking & Review Feed */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Customer Feedback & Response Status Pipeline
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Track customer ratings, Google redirects, and private feedback resolution
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white shadow'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({reviews.length})
            </button>
            <button
              onClick={() => setFilterType('5star')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                filterType === '5star'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              <Star className="w-3 h-3 fill-amber-400" /> 5-Star Google ({stats.fiveStarCount})
            </button>
            <button
              onClick={() => setFilterType('private')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterType === 'private'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
              }`}
            >
              Private Feedback ({stats.privateFeedbackCount})
            </button>
            <button
              onClick={fetchReviews}
              className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Review Cards Feed */}
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">Loading reviews...</div>
          ) : filteredReviews.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">No review records found.</div>
          ) : (
            filteredReviews.map((rev: any) => {
              const is5 = rev.rating === 5;
              return (
                <div
                  key={rev._id}
                  className="p-5 md:p-6 hover:bg-slate-50/70 transition flex flex-col md:flex-row md:items-start justify-between gap-4"
                >
                  <div className="space-y-2.5 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-slate-900 text-base">{rev.customerName}</span>
                      {rev.customerPhone && (
                        <span className="text-xs text-slate-400">{rev.customerPhone}</span>
                      )}

                      {/* Rating Stars */}
                      {rev.rating ? (
                        <div className="flex items-center gap-0.5 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= rev.rating
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                          <span className="text-xs font-bold text-amber-900 ml-1">
                            {rev.rating}.0
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                          Rating Pending
                        </span>
                      )}

                      {/* Action Taken Badge */}
                      {is5 ? (
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3" /> Redirected to Google Reviews
                        </span>
                      ) : rev.rating ? (
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 flex items-center gap-1 border border-amber-300">
                          <ShieldCheck className="w-3 h-3" /> Private Internal Feedback
                        </span>
                      ) : null}
                    </div>

                    {/* Customer feedback text */}
                    {rev.feedbackText && (
                      <div
                        className={`text-sm p-3.5 rounded-2xl border ${
                          is5
                            ? 'bg-amber-50/40 border-amber-200/60 text-slate-800'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        &ldquo;{rev.feedbackText}&rdquo;
                      </div>
                    )}

                    {/* Tags */}
                    {rev.customerExperienceTags?.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {rev.customerExperienceTags.map((tag: string) => (
                          <span
                            key={tag}
                            className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                          >
                            ✓ {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {rev.internalNotes && (
                      <div className="text-xs text-indigo-700 bg-indigo-50 p-2.5 rounded-xl border border-indigo-100 font-medium">
                        <span className="font-bold">Manager Note:</span> {rev.internalNotes}
                      </div>
                    )}
                  </div>

                  {/* Response Status Selector */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(rev.requestedAt).toLocaleDateString()}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">Response Status:</span>
                      <select
                        value={rev.responseStatus || 'new'}
                        disabled={updatingId === rev._id}
                        onChange={(e) => handleUpdateStatus(rev._id, e.target.value)}
                        className={`text-xs font-bold rounded-xl px-2.5 py-1.5 border transition focus:outline-none ${
                          rev.responseStatus === 'resolved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : rev.responseStatus === 'contacted_client'
                            ? 'bg-blue-50 text-blue-700 border-blue-300'
                            : rev.responseStatus === 'reviewed'
                            ? 'bg-slate-100 text-slate-700 border-slate-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        <option value="new">New / Unaddressed</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="contacted_client">Contacted Client</option>
                        <option value="resolved">Resolved</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    <a
                      href={`/review/${rev.customerId || rev._id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 mt-1"
                    >
                      View Live Review Link <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <CommunicationSequenceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          fetchReviews();
        }}
        defaultTrigger="review_request"
      />
    </div>
  );
}
