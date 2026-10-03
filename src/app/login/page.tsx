'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('admin@hnhpros.ca');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        // Successful login, navigate to redirected page or dashboard
        router.push(redirectPath);
        router.refresh();
      } else {
        setError(data.error || 'Invalid email or password.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Failed to connect to authentication server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-400 text-white font-black text-2xl shadow-lg shadow-blue-500/25 mb-1">
          H&H
        </div>
        <h1 className="text-xl font-black text-white tracking-tight">
          H&H House Maintenance
        </h1>
        <p className="text-xs text-slate-400">
          Admin CRM & Smart Operations Center
        </p>
      </div>

      {/* Error notification */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 block">
            Admin Email
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-3 text-slate-500">
              <Mail className="w-4 h-4" />
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@hnhpros.ca"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Password field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">
              Password
            </label>
          </div>
          <div className="relative">
            <span className="absolute left-3.5 top-3 text-slate-500">
              <Lock className="w-4 h-4" />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
        >
          {loading ? (
            <>
              <Clock className="w-4 h-4 animate-spin" />
              <span>Authenticating Admin...</span>
            </>
          ) : (
            <>
              <span>Sign In to CRM Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Quick Credentials Helper Card */}
      <div className="p-3.5 bg-slate-800/50 rounded-2xl border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Default Admin Credentials:</span>
        </div>
        <div className="flex justify-between font-mono bg-slate-900/60 p-2 rounded-lg border border-slate-800 text-slate-300">
          <span>Email: <strong className="text-blue-400">admin@hnhpros.ca</strong></span>
          <span>Pass: <strong className="text-amber-400">Admin@123</strong></span>
        </div>
        <p className="text-[10px] text-slate-500 pt-0.5">
          You can change your password anytime inside <strong>Settings &gt; Account</strong>.
        </p>
      </div>

      {/* Footer info */}
      <div className="pt-2 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
        <span>H&H House Maintenance Ltd.</span>
        <span>•</span>
        <a
          href="https://hnhpros.ca"
          target="_blank"
          rel="noreferrer"
          className="text-blue-400 hover:underline inline-flex items-center gap-1"
        >
          hnhpros.ca <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden select-none">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      <Suspense fallback={<div className="text-white text-xs">Loading authentication...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
