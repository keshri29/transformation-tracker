'use client';
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { today, formatDate } from '@/lib/utils';
import { HabitEntry } from '@/store/types';
import {
  Footprints,
  Dumbbell,
  Code2,
  BookOpen,
  Moon,
  Shield,
  WifiOff,
  Activity,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { format, parseISO, subDays } from 'date-fns';

// ─── Habit definitions ────────────────────────────────────────────────────────

type HabitKey = keyof Omit<HabitEntry, 'date'>;

interface HabitDef {
  key: HabitKey;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgActive: string;
  borderActive: string;
  glowColor: string;
}

const HABITS: HabitDef[] = [
  {
    key: 'morningWalk',
    label: 'Morning Walk',
    description: 'Start the day with movement',
    icon: Footprints,
    color: 'text-emerald-400',
    bgActive: 'bg-emerald-500/15',
    borderActive: 'border-emerald-500/40',
    glowColor: 'shadow-[0_0_16px_rgba(16,185,129,0.25)]',
  },
  {
    key: 'gym',
    label: 'Gym',
    description: 'Push your physical limits',
    icon: Dumbbell,
    color: 'text-blue-400',
    bgActive: 'bg-blue-500/15',
    borderActive: 'border-blue-500/40',
    glowColor: 'shadow-[0_0_16px_rgba(59,130,246,0.25)]',
  },
  {
    key: 'productBuilding',
    label: 'Product Building',
    description: 'Build something meaningful',
    icon: Code2,
    color: 'text-purple-400',
    bgActive: 'bg-purple-500/15',
    borderActive: 'border-purple-500/40',
    glowColor: 'shadow-[0_0_16px_rgba(139,92,246,0.25)]',
  },
  {
    key: 'learning',
    label: 'Learning',
    description: 'Expand your knowledge',
    icon: BookOpen,
    color: 'text-amber-400',
    bgActive: 'bg-amber-500/15',
    borderActive: 'border-amber-500/40',
    glowColor: 'shadow-[0_0_16px_rgba(245,158,11,0.25)]',
  },
  {
    key: 'sleepBeforeMidnight',
    label: 'Sleep Before Midnight',
    description: 'Rest and recover well',
    icon: Moon,
    color: 'text-indigo-400',
    bgActive: 'bg-indigo-500/15',
    borderActive: 'border-indigo-500/40',
    glowColor: 'shadow-[0_0_16px_rgba(99,102,241,0.25)]',
  },
  {
    key: 'noPorn',
    label: 'No Porn',
    description: 'Protect your mental energy',
    icon: Shield,
    color: 'text-rose-400',
    bgActive: 'bg-rose-500/15',
    borderActive: 'border-rose-500/40',
    glowColor: 'shadow-[0_0_16px_rgba(244,63,94,0.25)]',
  },
  {
    key: 'noMindlessScrolling',
    label: 'No Mindless Scrolling',
    description: 'Guard your attention',
    icon: WifiOff,
    color: 'text-teal-400',
    bgActive: 'bg-teal-500/15',
    borderActive: 'border-teal-500/40',
    glowColor: 'shadow-[0_0_16px_rgba(20,184,166,0.25)]',
  },
];

// ─── Streak calculation per habit ─────────────────────────────────────────────

function calcHabitStreak(
  habitEntries: Record<string, HabitEntry>,
  habitKey: HabitKey
): number {
  let streak = 0;
  const now = new Date();

  for (let i = 0; i < 90; i++) {
    const d = subDays(now, i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const entry = habitEntries[dateStr];

    // Allow today to be "in progress" — skip day 0 if not done
    if (i === 0) {
      if (entry?.[habitKey]) streak++;
      continue;
    }

    if (entry?.[habitKey]) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// ─── Single habit card ────────────────────────────────────────────────────────

interface HabitCardProps {
  habit: HabitDef;
  isOn: boolean;
  streak: number;
  onToggle: () => void;
}

function HabitCard({ habit, isOn, streak, onToggle }: HabitCardProps) {
  const Icon = habit.icon;

  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={[
        'w-full text-left rounded-2xl border p-4 transition-all duration-300',
        isOn
          ? `${habit.bgActive} ${habit.borderActive} ${habit.glowColor}`
          : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06]',
      ].join(' ')}
    >
      <div className="flex items-center gap-3">
        {/* Icon container */}
        <div
          className={[
            'flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300',
            isOn ? `${habit.bgActive} border ${habit.borderActive}` : 'bg-white/[0.06] border border-white/[0.08]',
          ].join(' ')}
        >
          <Icon
            size={20}
            className={isOn ? habit.color : 'text-zinc-500'}
          />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold truncate transition-colors duration-200 ${isOn ? 'text-zinc-100' : 'text-zinc-400'}`}>
            {habit.label}
          </p>
          <p className="text-xs text-zinc-600 truncate mt-0.5">{habit.description}</p>
        </div>

        {/* Right side: streak + toggle */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Streak badge */}
          {streak > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={[
                'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold',
                isOn
                  ? `${habit.bgActive} ${habit.color}`
                  : 'bg-white/[0.06] text-zinc-500',
              ].join(' ')}
            >
              <span>{streak}</span>
              <span className="opacity-70">d</span>
            </motion.div>
          )}

          {/* Toggle indicator */}
          <AnimatePresence mode="wait">
            {isOn ? (
              <motion.div
                key="on"
                initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              >
                <CheckCircle2 size={22} className={habit.color} />
              </motion.div>
            ) : (
              <motion.div
                key="off"
                initial={{ scale: 0.5, opacity: 0, rotate: 90 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.5, opacity: 0, rotate: -90 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              >
                <Circle size={22} className="text-zinc-700" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.button>
  );
}

// ─── Main HabitTracker component ──────────────────────────────────────────────

export function HabitTracker() {
  const habitEntries = useAppStore(s => s.habitEntries);
  const toggleHabit = useAppStore(s => s.toggleHabit);

  const todayStr = today();
  const todayEntry = habitEntries[todayStr];

  // Completed count
  const completedCount = useMemo(() => {
    if (!todayEntry) return 0;
    return HABITS.filter(h => todayEntry[h.key]).length;
  }, [todayEntry]);

  // Per-habit streaks
  const streaks = useMemo(
    () =>
      HABITS.reduce<Record<HabitKey, number>>((acc, h) => {
        acc[h.key] = calcHabitStreak(habitEntries, h.key);
        return acc;
      }, {} as Record<HabitKey, number>),
    [habitEntries]
  );

  const progressPercent = (completedCount / HABITS.length) * 100;

  const handleToggle = (key: HabitKey) => {
    const current = todayEntry?.[key] ?? false;
    toggleHabit(todayStr, key, !current);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-emerald-400" />
          <h3 className="font-semibold text-white">Daily Habits</h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Date label */}
          <span className="text-xs text-zinc-500 hidden sm:block">
            {formatDate(todayStr)}
          </span>
          {/* Progress badge */}
          <div
            className={[
              'flex items-center gap-1 rounded-full px-3 py-1 border text-sm font-bold transition-all duration-300',
              completedCount === HABITS.length
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'bg-white/[0.06] border-white/10 text-zinc-300',
            ].join(' ')}
          >
            <span>{completedCount}</span>
            <span className="text-zinc-500 font-normal text-xs">/ {HABITS.length}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-zinc-500">
          <span>
            {completedCount === HABITS.length
              ? 'All habits done! Incredible.'
              : `${HABITS.length - completedCount} remaining`}
          </span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Habit cards */}
      <div className="space-y-2">
        {HABITS.map((habit, idx) => (
          <motion.div
            key={habit.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
          >
            <HabitCard
              habit={habit}
              isOn={todayEntry?.[habit.key] ?? false}
              streak={streaks[habit.key]}
              onToggle={() => handleToggle(habit.key)}
            />
          </motion.div>
        ))}
      </div>

      {/* All-done celebration */}
      <AnimatePresence>
        {completedCount === HABITS.length && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-center shadow-[0_0_20px_rgba(16,185,129,0.15)]"
          >
            <p className="text-sm font-semibold text-emerald-400">
              Perfect habit day! All 7 complete.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
