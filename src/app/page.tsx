'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
  TrendingUp,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  User,
  Flame,
  FileText,
  Calendar as CalendarIcon,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default function DashboardPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Calendar State
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [jobRes, invRes, custRes] = await Promise.all([
          fetch('/api/jobs'),
          fetch('/api/invoices'),
          fetch('/api/customers'),
        ]);

        const [jobData, invData, custData] = await Promise.all([
          jobRes.json(),
          invRes.json(),
          custRes.json(),
        ]);

        if (jobData.data) setJobs(jobData.data);
        if (invData.data) setInvoices(invData.data);
        if (custData.data) setCustomers(custData.data);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  // 1. TODAY'S METRICS & BOOKINGS
  const todayStr = new Date().toISOString().split('T')[0];
  const todayDateObj = new Date();

  const todayBookings = useMemo(() => {
    return jobs.filter((job) => {
      if (!job.scheduledDate) return false;
      const jobDate = new Date(job.scheduledDate).toISOString().split('T')[0];
      return jobDate === todayStr && job.status !== 'cancelled';
    });
  }, [jobs, todayStr]);

  const todayTotalPrice = useMemo(() => {
    return todayBookings.reduce((sum, job) => sum + (Number(job.totalAmount) || 0), 0);
  }, [todayBookings]);

  // 2. CURRENT WEEK METRICS
  const currentWeekBookings = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    const startOfWeek = new Date(now);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return jobs.filter((job) => {
      if (!job.scheduledDate || job.status === 'cancelled') return false;
      const jobDate = new Date(job.scheduledDate);
      return jobDate >= startOfWeek && jobDate <= endOfWeek;
    });
  }, [jobs]);

  const currentWeekTotalPrice = useMemo(() => {
    return currentWeekBookings.reduce((sum, job) => sum + (Number(job.totalAmount) || 0), 0);
  }, [currentWeekBookings]);

  // 3. WAITING ON PAYMENT (UNPAID JOBS & INVOICES)
  const unpaidJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (job.status === 'cancelled') return false;
      const balance =
        job.balanceDue !== undefined
          ? Number(job.balanceDue)
          : (Number(job.totalAmount) || 0) - (Number(job.depositPaid) || 0);
      return balance > 0.01;
    });
  }, [jobs]);

  const unpaidTotalAmount = useMemo(() => {
    return unpaidJobs.reduce((sum, job) => {
      const balance =
        job.balanceDue !== undefined
          ? Number(job.balanceDue)
          : (Number(job.totalAmount) || 0) - (Number(job.depositPaid) || 0);
      return sum + balance;
    }, 0);
  }, [unpaidJobs]);

  // 4. TOTAL REVENUE COLLECTED
  const totalRevenue = useMemo(() => {
    // Sum of all payments received across invoices + deposits recorded
    const invRevenue = invoices.reduce((sum, inv) => {
      const paid = Number(inv.amountPaid) || (inv.status === 'paid' ? Number(inv.total) : 0);
      return sum + paid;
    }, 0);

    if (invRevenue > 0) return invRevenue;

    // Fallback if invoices not yet generated: sum deposits + completed jobs
    const jobRevenue = jobs.reduce((sum, job) => {
      const deposit = Number(job.depositPaid) || 0;
      const isPaid = job.status === 'completed' && job.balanceDue <= 0.01;
      return sum + deposit + (isPaid ? (Number(job.totalAmount) || 0) - deposit : 0);
    }, 0);

    return jobRevenue;
  }, [invoices, jobs]);

  // CALENDAR HELPER FUNCTIONS
  const calendarYear = currentCalendarDate.getFullYear();
  const calendarMonth = currentCalendarDate.getMonth(); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const prevMonth = () => {
    setCurrentCalendarDate(new Date(calendarYear, calendarMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentCalendarDate(new Date(calendarYear, calendarMonth + 1, 1));
  };

  const jumpToToday = () => {
    const today = new Date();
    setCurrentCalendarDate(today);
    setSelectedDate(today.toISOString().split('T')[0]);
  };

  // Calendar grid computation
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay();
    const totalDaysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const prevMonthDays = new Date(calendarYear, calendarMonth, 0).getDate();

    const days: Array<{
      dayNumber: number;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      bookings: any[];
    }> = [];

    // Previous month padding days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const prevM = calendarMonth === 0 ? 11 : calendarMonth - 1;
      const prevY = calendarMonth === 0 ? calendarYear - 1 : calendarYear;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        dayNumber: dayNum,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        bookings: jobs.filter((j) => {
          if (!j.scheduledDate) return false;
          return new Date(j.scheduledDate).toISOString().split('T')[0] === dateStr;
        }),
      });
    }

    // Current month days
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        dayNumber: i,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        bookings: jobs.filter((j) => {
          if (!j.scheduledDate) return false;
          return new Date(j.scheduledDate).toISOString().split('T')[0] === dateStr;
        }),
      });
    }

    // Next month padding days to complete grid (up to multiple of 7)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= (remainingDays > 7 ? remainingDays - 7 : remainingDays); i++) {
      const nextM = calendarMonth === 11 ? 0 : calendarMonth + 1;
      const nextY = calendarMonth === 11 ? calendarYear + 1 : calendarYear;
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        dayNumber: i,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        bookings: jobs.filter((j) => {
          if (!j.scheduledDate) return false;
          return new Date(j.scheduledDate).toISOString().split('T')[0] === dateStr;
        }),
      });
    }

    return days;
  }, [calendarYear, calendarMonth, jobs, todayStr]);

  // Selected date bookings
  const selectedDateBookings = useMemo(() => {
    return jobs.filter((job) => {
      if (!job.scheduledDate) return false;
      const dateStr = new Date(job.scheduledDate).toISOString().split('T')[0];
      return dateStr === selectedDate;
    });
  }, [jobs, selectedDate]);

  return (
    <div className="space-y-6">
      {/* 1. TOP 4 METRIC BOXES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* BOX 1: Today Total Bookings & Total Price */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-5 rounded-3xl shadow-md shadow-blue-500/10 border border-blue-500/30 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-100 uppercase tracking-wider">
              Today&apos;s Bookings
            </span>
            <div className="w-9 h-9 rounded-2xl bg-white/15 text-white flex items-center justify-center backdrop-blur-xs">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black tracking-tight">
              ${todayTotalPrice.toFixed(2)}
            </div>
            <div className="text-xs text-blue-100 font-semibold mt-1 flex items-center gap-1.5">
              <span className="bg-white/20 px-2 py-0.5 rounded-md font-bold">
                {todayBookings.length} {todayBookings.length === 1 ? 'Job' : 'Jobs'} Scheduled
              </span>
              <span>today</span>
            </div>
          </div>
        </div>

        {/* BOX 2: Current Week Total Bookings & Total Price */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-5 rounded-3xl shadow-md shadow-indigo-500/10 border border-indigo-500/30 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-100 uppercase tracking-wider">
              This Week&apos;s Bookings
            </span>
            <div className="w-9 h-9 rounded-2xl bg-white/15 text-white flex items-center justify-center backdrop-blur-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black tracking-tight">
              ${currentWeekTotalPrice.toFixed(2)}
            </div>
            <div className="text-xs text-indigo-100 font-semibold mt-1 flex items-center gap-1.5">
              <span className="bg-white/20 px-2 py-0.5 rounded-md font-bold">
                {currentWeekBookings.length} {currentWeekBookings.length === 1 ? 'Booking' : 'Bookings'}
              </span>
              <span>current week</span>
            </div>
          </div>
        </div>

        {/* BOX 3: Waiting on Payment, Total Price & Count */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-700 text-white p-5 rounded-3xl shadow-md shadow-amber-500/10 border border-amber-400/30 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-100 uppercase tracking-wider">
              Waiting on Payment
            </span>
            <div className="w-9 h-9 rounded-2xl bg-white/15 text-white flex items-center justify-center backdrop-blur-xs">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black tracking-tight">
              ${unpaidTotalAmount.toFixed(2)}
            </div>
            <div className="text-xs text-amber-100 font-semibold mt-1 flex items-center gap-1.5">
              <span className="bg-white/20 px-2 py-0.5 rounded-md font-bold">
                {unpaidJobs.length} {unpaidJobs.length === 1 ? 'Job' : 'Jobs'} Unpaid
              </span>
              <span>balance due</span>
            </div>
          </div>
        </div>

        {/* BOX 4: Total Revenue */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-800 text-white p-5 rounded-3xl shadow-md shadow-emerald-500/10 border border-emerald-500/30 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-9 h-9 rounded-2xl bg-white/15 text-white flex items-center justify-center backdrop-blur-xs">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black tracking-tight">
              ${totalRevenue.toFixed(2)}
            </div>
            <div className="text-xs text-emerald-100 font-semibold mt-1 flex items-center gap-1.5">
              <span className="bg-white/20 px-2 py-0.5 rounded-md font-bold">
                All-Time
              </span>
              <span>payments &amp; collected funds</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TODAY'S BOOKINGS SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">
                  Today&apos;s Bookings &amp; Service Schedule
                </h2>
                <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Live list of property services scheduled for execution today
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/jobs"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Booking</span>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading today&apos;s jobs...</div>
        ) : todayBookings.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <CalendarCheck className="w-8 h-8 mx-auto text-slate-300" />
            <div className="font-semibold text-slate-600 text-sm">No bookings scheduled for today.</div>
            <p className="text-slate-400 max-w-sm mx-auto text-[11px]">
              Crew is clear for today or you can schedule a new booking now.
            </p>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline pt-1"
            >
              <span>+ Schedule a Booking</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayBookings.map((job) => {
              const isCompleted = job.status === 'completed';
              const isEnRoute = job.status === 'en_route';
              const balanceDue =
                job.balanceDue !== undefined
                  ? Number(job.balanceDue)
                  : Math.max(0, (Number(job.totalAmount) || 0) - (Number(job.depositPaid) || 0));

              return (
                <div
                  key={job._id}
                  className="bg-slate-50/80 hover:bg-white rounded-2xl border border-slate-200 p-4 transition shadow-xs hover:shadow-md space-y-3 flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {job.jobNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : isEnRoute
                            ? 'bg-orange-100 text-orange-800 animate-pulse'
                            : job.status === 'in_progress'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {isEnRoute ? `En Route (${job.etaMinutes || 25}m)` : job.status?.toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition">
                        {job.customerName}
                      </h4>
                      <div className="text-xs font-medium text-slate-600 mt-0.5 line-clamp-1">
                        {job.title}
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 space-y-1 pt-1 border-t border-slate-200/60">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-semibold text-slate-800">{job.scheduledTime}</span>
                        <span>(~{job.durationHours || 2.5} hrs)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{job.address}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Crew: {job.assignedCrew}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400">Total Price</div>
                      <div className="font-black text-slate-900 text-sm">
                        ${(Number(job.totalAmount) || 0).toFixed(2)}
                      </div>
                      {balanceDue > 0.01 && (
                        <div className="text-[10px] font-bold text-amber-700">
                          Due: ${balanceDue.toFixed(2)}
                        </div>
                      )}
                    </div>

                    <Link
                      href="/jobs"
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold transition shadow-xs flex items-center gap-1"
                    >
                      <span>Manage</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. INTERACTIVE CALENDAR SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
        {/* Calendar Header & Month Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Service Calendar &amp; Bookings Schedule
              </h2>
              <p className="text-xs text-slate-500">
                Visual monthly calendar with scheduled bookings, job values &amp; dispatch dates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-black text-sm text-slate-900 px-3 min-w-[140px] text-center">
              {monthNames[calendarMonth]} {calendarYear}
            </span>

            <button
              onClick={nextMonth}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={jumpToToday}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer ml-1"
            >
              Today
            </button>
          </div>
        </div>

        {/* 7-Column Calendar Grid */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-100 shadow-inner">
          {/* Weekday Labels */}
          <div className="grid grid-cols-7 text-center bg-slate-50 border-b border-slate-200 py-2.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
            {daysOfWeek.map((day, idx) => (
              <div key={idx} className={idx === 0 || idx === 6 ? 'text-slate-400' : ''}>
                {day}
              </div>
            ))}
          </div>

          {/* Day Cells Grid */}
          <div className="grid grid-cols-7 gap-px bg-slate-200">
            {calendarDays.map((cell, idx) => {
              const isSelected = cell.dateStr === selectedDate;
              const hasBookings = cell.bookings.length > 0;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className={`min-h-[90px] sm:min-h-[105px] p-2 transition cursor-pointer flex flex-col justify-between ${
                    cell.isCurrentMonth ? 'bg-white' : 'bg-slate-50/60 text-slate-400'
                  } ${cell.isToday ? 'bg-blue-50/40' : ''} ${
                    isSelected ? 'ring-2 ring-blue-600 ring-inset bg-blue-50/60' : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Top Day Header */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold rounded-lg w-6 h-6 flex items-center justify-center ${
                        cell.isToday
                          ? 'bg-blue-600 text-white font-black shadow-xs'
                          : cell.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {hasBookings && (
                      <span className="text-[10px] font-black bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full">
                        {cell.bookings.length}
                      </span>
                    )}
                  </div>

                  {/* Booking Chips inside Day */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {cell.bookings.slice(0, 2).map((bk: any, bIdx: number) => {
                      const isCompleted = bk.status === 'completed';
                      const isEnRoute = bk.status === 'en_route';

                      return (
                        <div
                          key={bIdx}
                          className={`text-[10px] p-1 rounded-md font-semibold truncate border ${
                            isCompleted
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : isEnRoute
                              ? 'bg-orange-50 text-orange-800 border-orange-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}
                          title={`${bk.scheduledTime} - ${bk.customerName} (${bk.title})`}
                        >
                          <span className="font-bold">{bk.scheduledTime?.split(' ')[0]}:</span> {bk.customerName}
                        </div>
                      );
                    })}

                    {cell.bookings.length > 2 && (
                      <div className="text-[9px] font-bold text-slate-500 pl-1">
                        +{cell.bookings.length - 2} more
                      </div>
                    )}
                  </div>

                  {/* Total Value for day */}
                  {hasBookings ? (
                    <div className="text-[10px] font-bold text-slate-600 text-right mt-1">
                      ${cell.bookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0).toFixed(0)}
                    </div>
                  ) : (
                    <div></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Detail Drawer */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-xs text-slate-800">
                Bookings on {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}:
              </span>
            </div>
            <span className="text-xs font-bold text-slate-600">
              {selectedDateBookings.length} {selectedDateBookings.length === 1 ? 'Job' : 'Jobs'} Scheduled
            </span>
          </div>

          {selectedDateBookings.length === 0 ? (
            <div className="text-xs text-slate-400 py-3 text-center bg-white rounded-xl border border-slate-200">
              No bookings scheduled for this date. Click &quot;+ New Booking&quot; to add a job for this day.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedDateBookings.map((job) => (
                <div
                  key={job._id}
                  className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">{job.customerName}</span>
                      <span className="text-[10px] font-mono text-slate-500">({job.jobNumber})</span>
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{job.title}</div>
                    <div className="text-[11px] text-blue-700 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{job.scheduledTime}</span>
                      <span className="text-slate-400 font-normal">• ${Number(job.totalAmount).toFixed(2)}</span>
                    </div>
                  </div>

                  <Link
                    href="/jobs"
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-[11px] hover:bg-blue-700 shrink-0"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
