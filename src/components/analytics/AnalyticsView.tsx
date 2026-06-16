'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  BarChart,
  Bar,
} from 'recharts';
import {
  AreaChart,
  Area,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { useAppStore } from '@/store/useAppStore';
import { calculateStreak, getLast30Days } from '@/lib/utils';
import type { HabitEntry } from '@/store/types';

// ---- helpers ----------------------------------------------------------------

function getLast14Days(): string[] {
  const days: string[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(format(d, 'yyyy-MM-dd'));
  }
  return days;
}

function getLast6Months(): string[] {
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    months.push(format(d, 'yyyy-MM'));
  }
  return months;
}

function shortDay(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'EEE');
  } catch {
    return '';
  }
}

function shortMonth(monthStr: string): string {
  try {
    return format(parseISO(monthStr + '-01'), 'MMM');
  } catch {
    return monthStr;
  }
}

// ---- custom tooltip ---------------------------------------------------------

interface TooltipPayload {
  name?: string;
  value?: number;
  color?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function DarkTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs shadow-xl">
      {label && <p className="mb-1 text-zinc-400">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color ?? '#10b981' }}>
          {p.name ? `${p.name}: ` : ''}{p.value ?? 0}
        </p>
      ))}
    </div>
  );
}

// ---- stat card --------------------------------------------------------------

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}

function StatCard({ label, value, sub, color = 'text-emerald-400' }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 flex flex-col gap-1">
      <p className="text-xs text-zinc-500 uppercase tracking-widest">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-zinc-500">{sub}</p>}
    </div>
  );
}

// ---- section header ---------------------------------------------------------

interface SectionHeaderProps {
  dot: string;
  title: string;
}

function SectionHeader({ dot, title }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-widest">{title}</h2>
    </div>
  );
}

// ---- main component ---------------------------------------------------------

export function AnalyticsView() {
  const {
    dailyEntries,
    habitEntries,
    careerEntries,
    financeEntries,
    startDate,
  } = useAppStore();

  // ---- streak stats ---------------------------------------------------------
  const currentStreak = useMemo(
    () => calculateStreak(dailyEntries, startDate),
    [dailyEntries, startDate]
  );

  const bestStreak = useMemo(() => {
    const allDates = Object.keys(dailyEntries).sort();
    let best = 0;
    let run = 0;
    for (const d of allDates) {
      if (dailyEntries[d]?.score >= 40) {
        run++;
        if (run > best) best = run;
      } else {
        run = 0;
      }
    }
    return best;
  }, [dailyEntries]);

  const daysCompleted = useMemo(
    () => Object.values(dailyEntries).filter(e => e.score >= 40).length,
    [dailyEntries]
  );

  // ---- weekly score chart (14 days) ----------------------------------------
  const scoreChartData = useMemo(() => {
    return getLast14Days().map(dateStr => ({
      day: shortDay(dateStr),
      score: dailyEntries[dateStr]?.score ?? 0,
    }));
  }, [dailyEntries]);

  // ---- habit completion rates (30 days) ------------------------------------
  type HabitKey = keyof Omit<HabitEntry, 'date'>;
  const habitKeys: { key: HabitKey; label: string }[] = [
    { key: 'morningWalk', label: 'Walk' },
    { key: 'gym', label: 'Gym' },
    { key: 'productBuilding', label: 'Build' },
    { key: 'learning', label: 'Learn' },
    { key: 'sleepBeforeMidnight', label: 'Sleep' },
    { key: 'noPorn', label: 'NoPorn' },
    { key: 'noMindlessScrolling', label: 'NoScroll' },
  ];

  const habitChartData = useMemo(() => {
    const days = getLast30Days();
    return habitKeys.map(({ key, label }) => {
      const completed = days.filter(d => habitEntries[d]?.[key]).length;
      const rate = days.length > 0 ? Math.round((completed / days.length) * 100) : 0;
      return { habit: label, rate };
    });
  }, [habitEntries]);

  // ---- summary stats --------------------------------------------------------
  const totalProductHours = useMemo(
    () => careerEntries.reduce((s, e) => s + (e.hoursProductBuilt ?? 0), 0),
    [careerEntries]
  );

  const totalLearningHours = useMemo(
    () => careerEntries.reduce((s, e) => s + (e.hoursLearned ?? 0), 0),
    [careerEntries]
  );

  const totalJobsApplied = useMemo(
    () => careerEntries.reduce((s, e) => s + (e.jobsApplied ?? 0), 0),
    [careerEntries]
  );

  const currentMonthSavings = useMemo(() => {
    const month = format(new Date(), 'yyyy-MM');
    return financeEntries.find(f => f.month === month)?.savings ?? 0;
  }, [financeEntries]);

  // ---- monthly avg score (area chart) --------------------------------------
  const monthlyScoreData = useMemo(() => {
    return getLast6Months().map(monthStr => {
      const entries = Object.entries(dailyEntries).filter(
        ([d]) => d.startsWith(monthStr)
      );
      const avg =
        entries.length > 0
          ? Math.round(entries.reduce((s, [, e]) => s + e.score, 0) / entries.length)
          : 0;
      return { month: shortMonth(monthStr), avg };
    });
  }, [dailyEntries]);

  // ---- emerald gradient id --------------------------------------------------
  const gradientId = 'emeraldGrad';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* ---- streak stats row ---- */}
      <div>
        <SectionHeader dot="bg-emerald-500" title="Streak & Completion" />
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Streak" value={currentStreak} sub="current days" color="text-emerald-400" />
          <StatCard label="Best" value={bestStreak} sub="streak" color="text-blue-400" />
          <StatCard label="Days Done" value={daysCompleted} sub="score ≥ 40" color="text-amber-400" />
        </div>
      </div>

      {/* ---- weekly score line chart ---- */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
        <SectionHeader dot="bg-emerald-500" title="Daily Score — Last 14 Days" />
        <ResponsiveContainer width="100%" height={190}>
          <LineChart data={scoreChartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fill: '#71717a', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#71717a', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<DarkTooltip />} />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#10b981', strokeWidth: 0 }}
              isAnimationActive={true}
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ---- habit completion bar chart ---- */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
        <SectionHeader dot="bg-purple-500" title="Habit Completion — Last 30 Days" />
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={habitChartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="habit"
              tick={{ fill: '#71717a', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#71717a', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip
              content={<DarkTooltip />}
              formatter={(value) => [`${Number(value)}%`, 'Rate']}
            />
            <Bar
              dataKey="rate"
              name="Rate"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              isAnimationActive={true}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ---- summary cards ---- */}
      <div>
        <SectionHeader dot="bg-blue-500" title="Career Summary" />
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Product Hours"
            value={totalProductHours.toFixed(1)}
            sub="total built"
            color="text-purple-400"
          />
          <StatCard
            label="Learning Hours"
            value={totalLearningHours.toFixed(1)}
            sub="total learned"
            color="text-blue-400"
          />
          <StatCard
            label="Jobs Applied"
            value={totalJobsApplied}
            sub="total applications"
            color="text-amber-400"
          />
          <StatCard
            label="Savings"
            value={`₹${currentMonthSavings.toLocaleString('en-IN')}`}
            sub="this month"
            color="text-emerald-400"
          />
        </div>
      </div>

      {/* ---- monthly score area chart ---- */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
        <SectionHeader dot="bg-emerald-500" title="Monthly Avg Score" />
        <ResponsiveContainer width="100%" height={190}>
          <AreaChart data={monthlyScoreData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: '#71717a', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#71717a', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<DarkTooltip />} />
            <Area
              type="monotone"
              dataKey="avg"
              name="Avg Score"
              stroke="#10b981"
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#10b981', strokeWidth: 0 }}
              isAnimationActive={true}
              animationDuration={900}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
