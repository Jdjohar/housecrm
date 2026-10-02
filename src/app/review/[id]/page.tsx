'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Star,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  MessageSquare,
  ThumbsUp,
  Heart,
  Send,
  Building2,
  Phone,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SmartReviewPage() {
  const params = useParams();
  const id = params?.id as string;

  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [googleReviewUrl, setGoogleReviewUrl] = useState(
    'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4'
  );
  const [customerName, setCustomerName] = useState('Valued Customer');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch settings / review record
    fetch('/api/settings')
      .then((res) => res.json())
      .then((d) => {
        if (d.data?.googleReviewUrl) {
          setGoogleReviewUrl(d.data.googleReviewUrl);
        }
      })
      .catch((e) => console.error(e));

    if (id && id !== 'demo') {
      fetch(`/api/customers/${id}`)
        .then((res) => res.json())
        .then((d) => {
          if (d.data?.customer?.name) {
            setCustomerName(d.data.customer.name);
          }
        })
        .catch((e) => console.log('Customer fetch:', e));
    }
  }, [id]);

  const handleSelectRating = (selected: number) => {
    setRating(selected);
    if (selected === 5) {
      // Trigger confetti celebration!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#f59e0b', '#10b981', '#6366f1'],
      });
    }
  };

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!rating) return;

    setLoading(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: id,
          rating,
          feedbackText,
          experienceTags: selectedTags,
        }),
      });
      const data = await res.json();
      if (data.googleReviewUrl) {
        setGoogleReviewUrl(data.googleReviewUrl);
      }
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const isFiveStar = rating === 5;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-100 flex flex-col justify-between p-4 md:p-8">
      {/* Brand Header */}
      <header className="max-w-xl mx-auto w-full flex items-center justify-between py-4 border-b border-slate-700/60 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-400 flex items-center justify-center font-black text-white text-lg shadow-lg">
            H&H
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight">H&H House Maintenance</h1>
            <p className="text-xs text-blue-300">Vancouver & Lower Mainland • hnhpros.ca</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verified Client</span>
        </div>
      </header>

      {/* Main Review Card */}
      <main className="max-w-xl mx-auto w-full flex-1 flex items-center">
        <div className="w-full bg-slate-800/90 backdrop-blur-md rounded-3xl border border-slate-700 p-6 md:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle glow background */}
          <div className="absolute -right-20 -top-20 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {!submitted ? (
            <div className="space-y-6">
              {/* Question Headline */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" /> Service Completion Feedback
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                  ⭐ How did we do?
                </h2>
                <p className="text-sm text-slate-300">
                  Hi <span className="font-semibold text-white">{customerName}</span>, how was your experience with H&H House Maintenance?
                </p>
              </div>

              {/* Quick Choice Buttons as specified by user */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleSelectRating(5)}
                  className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center text-center group ${
                    rating === 5
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 border-amber-400 shadow-lg shadow-amber-500/25 scale-[1.02]'
                      : 'bg-slate-700/60 hover:bg-slate-700 text-white border-slate-600 hover:border-amber-400/60'
                  }`}
                >
                  <div className="flex items-center text-amber-300 mb-1.5 group-hover:scale-110 transition-transform">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-5 h-5 fill-amber-300 text-amber-300" />
                    ))}
                  </div>
                  <div className="font-bold text-base">⭐⭐⭐⭐⭐ Excellent</div>
                  <div className="text-xs text-slate-300 mt-0.5">Top-notch service & results</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRating(3)}
                  className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center text-center group ${
                    rating !== null && rating < 5
                      ? 'bg-blue-900/60 text-white border-blue-500 shadow-md scale-[1.02]'
                      : 'bg-slate-700/60 hover:bg-slate-700 text-white border-slate-600 hover:border-blue-400/60'
                  }`}
                >
                  <MessageSquare className="w-6 h-6 text-blue-400 mb-1.5 group-hover:scale-110 transition-transform" />
                  <div className="font-bold text-base">Other feedback</div>
                  <div className="text-xs text-slate-300 mt-0.5">Tell us how we can improve</div>
                </button>
              </div>

              {/* Individual Star selector */}
              <div className="pt-2 border-t border-slate-700/60 text-center">
                <div className="text-xs text-slate-400 mb-2 font-medium">Or select exact rating:</div>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (hoverRating || rating || 0) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        onClick={() => handleSelectRating(star)}
                        className="p-1 text-slate-600 hover:scale-125 transition-transform"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            isFilled
                              ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                              : 'text-slate-600 hover:text-slate-400'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Branch: 5 STARS vs LOWER RATING */}
              {rating === 5 && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-blue-500/10 to-transparent border border-amber-400/30 space-y-4 animate-in fade-in zoom-in-95">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                    <Heart className="w-4 h-4 fill-amber-300 text-amber-300" />
                    Thank you so much!
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Local word-of-mouth means everything to our team at H&H House Maintenance. We’d be thrilled if you could post this on our official Google Business page!
                  </p>

                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {['Friendly Crew', 'Sparkling Clean', 'On-Time', 'Great Price', 'Careful with Property'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className={`px-2.5 py-1 rounded-full border transition ${
                          selectedTags.includes(tag)
                            ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                            : 'bg-slate-800 text-slate-300 border-slate-600 hover:border-slate-500'
                        }`}
                      >
                        ✓ {tag}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 hover:from-amber-300 hover:to-amber-500 transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 text-sm"
                  >
                    <span>Proceed to Google Review Page</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              )}

              {rating !== null && rating < 5 && (
                <div className="p-5 rounded-2xl bg-blue-950/40 border border-blue-500/30 space-y-3 animate-in fade-in zoom-in-95">
                  <div className="flex items-center gap-2 text-blue-300 font-bold text-sm">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    Send Private Feedback to H&H Management
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    We take pride in our 100% satisfaction guarantee. Please let our leadership know how we can make this right for you.
                  </p>

                  <textarea
                    rows={3}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Tell us what could have gone better..."
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={loading}
                    className="w-full py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white transition shadow-md flex items-center justify-center gap-2 text-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Private Feedback to Owner</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Post-Submission State */
            <div className="text-center py-8 space-y-5 animate-in fade-in zoom-in-95">
              {isFiveStar ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-400 flex items-center justify-center mx-auto">
                    <Star className="w-8 h-8 fill-amber-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white">Thank You for the 5-Star Rating!</h3>
                    <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                      Your feedback has been logged in our system. To finalize your review on Google, click the button below:
                    </p>
                  </div>

                  <a
                    href={googleReviewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-amber-400 transition shadow-xl shadow-amber-500/20 text-sm"
                  >
                    <span>Open Google Review in New Tab</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white">Private Feedback Received</h3>
                    <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                      Thank you for your honesty. Your note has been delivered directly to our management team for prompt review and resolution.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-slate-400 text-left max-w-md mx-auto">
                    <div className="font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-blue-400" /> Direct Support
                    </div>
                    If you require immediate assistance, call us directly at <span className="text-blue-300 font-semibold">(604) 555-0199</span>.
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-xl mx-auto w-full text-center py-4 text-xs text-slate-500">
        © {new Date().getFullYear()} H&H House Maintenance. Vancouver • Surrey • Burnaby • Richmond • Langley
      </footer>
    </div>
  );
}
