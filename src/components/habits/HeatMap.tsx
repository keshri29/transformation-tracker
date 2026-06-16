'use client';
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { getLast30Days } from '@/lib/utils';
import { HabitEntry } from '@/store/types';
import { format, parseISO, getDay } from 'date-fns';
import {
  Footprints,
  Dumbbell,
  Code2,
  BookOpen,
  Moon,
  Shield,
  WifiOff,
} from 'lucide-react';

// ─── Habit definitions (mirrors HabitTracker) ─────────────────────────────────

type HabitKey = keyof Omit<HabitEntry, 'date'>;

interface HabitTab {
  key: HabitKey;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  activeColor: string;
  activeBg: string;
  squareOn: string;
  squareOnFaint: string;
}

const HABIT_TABS: HabitTab[] = [
  {
    key: 'morningWalk',
    label: 'Morning Walk',
    shortLabel: 'Walk',
    icon: Footprints,
    activeColor: 'text-emerald-400',
    activeBg: 'bg-emerald-500/15 border-emerald-500/30',
    squareOn: 'bg-emerald-500',
    squareOnFaint: 'bg-emerald-500/20',
  },
  {
    key: 'gym',
    label: 'Gym',
    shortLabel: 'Gym',
    icon: Dumbbell,
    activeColor: 'text-blue-400',
    activeBg: 'bg-blue-500/15 border-blue-500/30',
    squareOn: 'bg-blue-500',
    squareOnFaint: 'bg-blue-500/20',
  },
  {
    key: 'productBuilding',
    label: 'Product Building',
    shortLabel: 'Product',
    icon: Code2,
    activeColor: 'text-purple-400',
    activeBg: 'bg-purple-500/15 border-purple-500/30',
    squareOn: 'bg-purple-500',
    squareOnFaint: 'bg-purple-500/20',
  },
  {
    key: 'learning',
    label: 'Learning',
    shortLabel: 'Learn',
    icon: BookOpen,
    activeColor: 'text-amber-400',
    activeBg: 'bg-amber-500/15 border-amber-500/30',
    squareOn: 'bg-amber-500',
    squareOnFaint: 'bg-amber-500/20',
  },
  {
    key: 'sleepBeforeMidnight',
    label: 'Sleep Before Midnight',
    shortLabel: 'Sleep',
    icon: Moon,
    activeColor: 'text-indigo-400',
    activeBg: 'bg-indigo-500/15 border-indigo-500/30',
    squareOn: 'bg-indigo-500',
    squareOnFaint: 'bg-indigo-500/20',
  },
  {
    key: 'noPorn',
    label: 'No Porn',
    shortLabel: 'Shield',
    icon: Shield,
    activeColor: 'text-rose-400',
    activeBg: 'bg-rose-500/15 border-rose-500/30',
    squareOn: 'bg-rose-500',
    squareOnFaint: 'bg-rose-500/20',
  },
  {
    key: 'noMindlessScrolling',
    label: 'No Mindless Scrolling',
    shortLabel: 'Focus',
    icon: WifiOff,
    activeColor: 'text-teal-400',
    activeBg: 'bg-teal-500/15 border-teal-500/30',
    squareOn: 'bg-teal-500',
    squareOnFaint: 'bg-teal-500/20',
  },
];

// Day-of-week labels — Sun=0 … Sat=6
const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── Grid cell ─────────────────────────────────────────────────────────────────

interface CellProps {
  dateStr: string;
  done: boolean;
  tab: HabitTab;
  index: number;
}

function GridCell({ dateStr, done, tab, index }: CellProps) {
  const [hovered, setHovered] = useState(false);
  const label = format(parseISO(dateStr), 'MMM d');

  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, delay: index * 0.01 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={[
          'w-7 h-7 rounded-md cursor-default transition-all duration-200',
          done
            ? `${tab.squareOn} shadow-sm`
            : `${tab.squareOnFaint} border border-white/[0.06]`,
        ].join(' ')}
      />
      {/* Tooltip */}
      {hovered && (
        <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="rounded-lg bg-zinc-800 border border-white/10 px-2 py-1 text-xs text-zinc-200 whitespace-nowrap shadow-xl">
            {label} — {done ? 'Done' : 'Not done'}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── HeatMap component ────────────────────────────────────────────────────────

export function HeatMap() {
  const habitEntries = useAppStore(s => s.habitEntries);
  const [selectedKey, setSelectedKey] = useState<HabitKey>('morningWalk');

  const activeTab = HABIT_TABS.find(t => t.key === selectedKey)!;

  // Last 30 days sorted oldest → newest
  const days = useMemo(() => getLast30Days(), []);

  // Completion flags for the selected habit
  const flags = useMemo(
    () => days.map(d => ({ date: d, done: habitEntries[d]?.[selectedKey] ?? false })),
    [days, habitEntries, selectedKey]
  );

  // Completion percentage
  const completionPct = useMemo(() => {
    const done = flags.filter(f => f.done).length;
    return Math.round((done / flags.length) * 100);
  }, [flags]);

  // Build a grid: pad the start so columns align to day-of-week
  // We want rows × 7 columns (Sun-Sat)
  const firstDow = getDay(parseISO(days[0])); // 0=Sun
  const paddedCells: (null | { date: string; done: boolean })[] = [
    ...Array(firstDow).fill(null),
    ...flags,
  ];
  // Round up to full rows
  while (paddedCells.length % 7 !== 0) paddedCells.push(null);

  // Build row chunks
  const rows: (null | { date: string; done: boolean })[][] = [];
  for (let i = 0; i < paddedCells.length; i += 7) {
    rows.push(paddedCells.slice(i, i + 7));
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <activeTab.icon size={18} className={activeTab.activeColor} />
          <h3 className="font-semibold text-white">30-Day Heatmap</h3>
        </div>

        {/* Completion badge */}
        <div
          className={[
            'flex items-center gap-1 rounded-full px-3 py-1 border text-sm font-bold',
            activeTab.activeBg,
            activeTab.activeColor,
          ].join(' ')}
        >
          {completionPct}%
        </div>
      </div>

      {/* Habit selector tabs — scrollable on small screens */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {HABIT_TABS.map(tab => {
          const TabIcon = tab.icon;
          const isActive = tab.key === selectedKey;
          return (
            <button
              key={tab.key}
              onClick={() => setSelectedKey(tab.key)}
              className={[
                'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-200',
                isActive
                  ? `${tab.activeBg} ${tab.activeColor}`
                  : 'bg-white/[0.04] border-white/[0.08] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.07]',
              ].join(' ')}
            >
              <TabIcon size={13} />
              <span>{tab.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Selected habit label + streak info */}
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span className={activeTab.activeColor + ' font-medium'}>{activeTab.label}</span>
        <span>
          {flags.filter(f => f.done).length} / {flags.length} days completed
        </span>
      </div>

      {/* Day-of-week header */}
      <div className="grid grid-cols-7 gap-1">
        {DOW_LABELS.map(d => (
          <div key={d} className="text-center text-[10px] text-zinc-600 font-medium">
            {d}
          </div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="space-y-1">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="grid grid-cols-7 gap-1">
            {row.map((cell, colIdx) => {
              const globalIdx = rowIdx * 7 + colIdx - firstDow;
              if (!cell) {
                // Empty padding cell
                return <div key={colIdx} className="w-7 h-7" />;
              }
              return (
                <GridCell
                  key={cell.date}
                  dateStr={cell.date}
                  done={cell.done}
                  tab={activeTab}
                  index={globalIdx >= 0 ? globalIdx : 0}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-3 pt-1">
        <div className="flex items-center gap-1.5">
          <div className={`w-3 h-3 rounded-sm ${activeTab.squareOnFaint} border border-white/[0.06]`} />
          <span className="text-[10px] text-zinc-600">Not done</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-3 h-3 rounded-sm ${activeTab.squareOn}`} />
          <span className="text-[10px] text-zinc-600">Done</span>
        </div>
      </div>

      {/* Completion bar */}
      <div className="space-y-1">
        <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
          <motion.div
            key={selectedKey}
            className={`h-full rounded-full ${activeTab.squareOn}`}
            initial={{ width: 0 }}
            animate={{ width: `${completionPct}%` }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        </div>
        <p className="text-xs text-zinc-600 text-right">{completionPct}% over last 30 days</p>
      </div>
    </div>
  );
}
