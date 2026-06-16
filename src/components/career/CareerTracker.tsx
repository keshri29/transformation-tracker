'use client';
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Plus, Minus, BookOpen, Hammer, Briefcase, MessageSquare } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { today, getLast7Days } from '@/lib/utils';
import { CareerEntry } from '@/store/types';

type CareerField = keyof Omit<CareerEntry, 'date'>;

interface FieldConfig {
  key: CareerField;
  label: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  bgColor: string;
  unit: string;
  step: number;
}

const FIELDS: FieldConfig[] = [
  {
    key: 'hoursLearned',
    label: 'Hours Learned',
    icon: <BookOpen size={14} />,
    color: 'text-blue-400',
    borderColor: 'border-blue-500/20',
    bgColor: 'bg-blue-500/10',
    unit: 'hrs',
    step: 0.5,
  },
  {
    key: 'hoursProductBuilt',
    label: 'Product Built',
    icon: <Hammer size={14} />,
    color: 'text-purple-400',
    borderColor: 'border-purple-500/20',
    bgColor: 'bg-purple-500/10',
    unit: 'hrs',
    step: 0.5,
  },
  {
    key: 'jobsApplied',
    label: 'Jobs Applied',
    icon: <Briefcase size={14} />,
    color: 'text-amber-400',
    borderColor: 'border-amber-500/20',
    bgColor: 'bg-amber-500/10',
    unit: 'jobs',
    step: 1,
  },
  {
    key: 'interviewsGiven',
    label: 'Interviews',
    icon: <MessageSquare size={14} />,
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/20',
    bgColor: 'bg-emerald-500/10',
    unit: 'intv',
    step: 1,
  },
];

function round(val: number, step: number): number {
  return Math.round(val / step) * step;
}

function fmt(val: number, step: number): string {
  return val.toFixed(step < 1 ? 1 : 0);
}

interface ProgressBarProps {
  value: number;
  goal: number;
  label: string;
  sublabel: string;
  color: string;
  trackColor: string;
}

function ProgressBar({ value, goal, label, sublabel, color, trackColor }: ProgressBarProps) {
  const pct = Math.min((value / goal) * 100, 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400">{label}</span>
        <span className={`text-xs font-semibold ${color}`}>
          {fmt(value, 0.5)}h / {goal}h
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${trackColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <p className="text-[10px] text-zinc-600">{sublabel}</p>
    </div>
  );
}

export function CareerTracker() {
  const careerEntries = useAppStore(s => s.careerEntries);
  const updateCareerEntry = useAppStore(s => s.updateCareerEntry);

  const todayStr = today();
  const todayEntry = careerEntries.find(e => e.date === todayStr);

  const todayValues: Omit<CareerEntry, 'date'> = {
    hoursLearned: todayEntry?.hoursLearned ?? 0,
    hoursProductBuilt: todayEntry?.hoursProductBuilt ?? 0,
    jobsApplied: todayEntry?.jobsApplied ?? 0,
    interviewsGiven: todayEntry?.interviewsGiven ?? 0,
  };

  const weeklyTotals = useMemo(() => {
    const last7 = getLast7Days();
    const totals: Omit<CareerEntry, 'date'> = {
      hoursLearned: 0,
      hoursProductBuilt: 0,
      jobsApplied: 0,
      interviewsGiven: 0,
    };
    for (const d of last7) {
      const e = careerEntries.find(entry => entry.date === d);
      if (e) {
        totals.hoursLearned += e.hoursLearned;
        totals.hoursProductBuilt += e.hoursProductBuilt;
        totals.jobsApplied += e.jobsApplied;
        totals.interviewsGiven += e.interviewsGiven;
      }
    }
    return totals;
  }, [careerEntries]);

  const growthScore = useMemo(() => {
    const raw =
      weeklyTotals.hoursLearned * 5 +
      weeklyTotals.hoursProductBuilt * 5 +
      weeklyTotals.jobsApplied * 2 +
      weeklyTotals.interviewsGiven * 10;
    return Math.min(Math.round(raw / 10), 100);
  }, [weeklyTotals]);

  function adjust(field: CareerField, delta: number) {
    const config = FIELDS.find(f => f.key === field)!;
    const current = todayValues[field];
    const next = Math.max(0, round(current + delta, config.step));
    updateCareerEntry(todayStr, { [field]: next });
  }

  const scoreColor =
    growthScore >= 80
      ? 'text-emerald-400'
      : growthScore >= 50
      ? 'text-blue-400'
      : growthScore >= 25
      ? 'text-amber-400'
      : 'text-zinc-400';

  const scoreBg =
    growthScore >= 80
      ? 'bg-emerald-500/10 border-emerald-500/20'
      : growthScore >= 50
      ? 'bg-blue-500/10 border-blue-500/20'
      : growthScore >= 25
      ? 'bg-amber-500/10 border-amber-500/20'
      : 'bg-white/[0.04] border-white/10';

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
            <TrendingUp size={16} className="text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-100">Career Tracker</h3>
            <p className="text-xs text-zinc-500">Today's progress</p>
          </div>
        </div>

        {/* Growth score badge */}
        <div className={`flex flex-col items-center rounded-xl border px-3 py-1.5 ${scoreBg}`}>
          <span className={`text-lg font-bold leading-none ${scoreColor}`}>{growthScore}</span>
          <span className="text-[9px] text-zinc-500 mt-0.5">GROWTH</span>
        </div>
      </div>

      {/* Today's input fields */}
      <div className="grid grid-cols-2 gap-3">
        {FIELDS.map(field => {
          const val = todayValues[field.key];
          return (
            <div
              key={field.key}
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 space-y-2"
            >
              <div className={`flex items-center gap-1.5 text-xs font-medium ${field.color}`}>
                {field.icon}
                <span>{field.label}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjust(field.key, -field.step)}
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-zinc-300 transition-colors hover:bg-white/[0.12] active:scale-95"
                >
                  <Minus size={12} />
                </button>
                <div className="flex flex-1 flex-col items-center">
                  <span className={`text-xl font-bold leading-none ${field.color}`}>
                    {fmt(val, field.step)}
                  </span>
                  <span className="text-[10px] text-zinc-500 mt-0.5">{field.unit}</span>
                </div>
                <button
                  onClick={() => adjust(field.key, field.step)}
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-zinc-300 transition-colors hover:bg-white/[0.12] active:scale-95"
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Weekly total */}
              <p className="text-center text-[10px] text-zinc-600">
                Week: {fmt(weeklyTotals[field.key], field.step)} {field.unit}
              </p>
            </div>
          );
        })}
      </div>

      {/* Weekly progress bars */}
      <div className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
        <p className="text-xs font-medium text-zinc-400">Weekly Goals</p>

        <ProgressBar
          value={weeklyTotals.hoursLearned}
          goal={14}
          label="Learning Hours"
          sublabel="Goal: 14 hrs / week (2 hrs/day)"
          color="text-blue-400"
          trackColor="bg-gradient-to-r from-blue-600 to-blue-400"
        />

        <ProgressBar
          value={weeklyTotals.hoursProductBuilt}
          goal={14}
          label="Product Building"
          sublabel="Goal: 14 hrs / week (2 hrs/day)"
          color="text-purple-400"
          trackColor="bg-gradient-to-r from-purple-600 to-purple-400"
        />
      </div>

      {/* Weekly summary row */}
      <div className="grid grid-cols-4 gap-2">
        {FIELDS.map(field => (
          <div key={field.key} className="flex flex-col items-center rounded-lg border border-white/[0.06] bg-white/[0.03] py-2 px-1">
            <span className={`text-sm font-bold ${field.color}`}>
              {fmt(weeklyTotals[field.key], field.step)}
            </span>
            <span className="text-[9px] text-zinc-600 text-center leading-tight mt-0.5">
              {field.key === 'hoursLearned'
                ? 'Learn'
                : field.key === 'hoursProductBuilt'
                ? 'Build'
                : field.key === 'jobsApplied'
                ? 'Apply'
                : 'Intv'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
