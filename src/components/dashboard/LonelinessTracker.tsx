'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { today } from '@/lib/utils';

type LonelinessField = 'familyCall' | 'wentOutside' | 'talkedToSomeone';

const TOGGLES: {
  field: LonelinessField;
  label: string;
  iconOn: string;
  iconOff: string;
}[] = [
  {
    field: 'familyCall',
    label: 'Family Call Today?',
    iconOn: '📞',
    iconOff: '📵',
  },
  {
    field: 'wentOutside',
    label: 'Went Outside Today?',
    iconOn: '🚶',
    iconOff: '🏠',
  },
  {
    field: 'talkedToSomeone',
    label: 'Talked To Someone?',
    iconOn: '💬',
    iconOff: '🔇',
  },
];

function getScoreLabel(score: number): { label: string; color: string; bg: string } {
  if (score === 100) return { label: 'Excellent', color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/40' };
  if (score >= 66) return { label: 'Moderate', color: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/40' };
  if (score >= 33) return { label: 'Low', color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/40' };
  return { label: 'Poor', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/40' };
}

export default function LonelinessTracker() {
  const dailyEntries = useAppStore((s) => s.dailyEntries);
  const updateLoneliness = useAppStore((s) => s.updateLoneliness);

  const todayStr = today();
  const todayEntry = dailyEntries[todayStr];

  const values = {
    familyCall: todayEntry?.familyCall ?? false,
    wentOutside: todayEntry?.wentOutside ?? false,
    talkedToSomeone: todayEntry?.talkedToSomeone ?? false,
  };

  const checkedCount = Object.values(values).filter(Boolean).length;
  const scorePercent = Math.round((checkedCount / 3) * 100);
  const scoreInfo = getScoreLabel(scorePercent);

  function handleToggle(field: LonelinessField) {
    updateLoneliness(todayStr, field, !values[field]);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">❤️</span>
          <h2 className="text-zinc-100 font-semibold text-base">Social Health</h2>
        </div>
        {/* Score Badge */}
        <div className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ${scoreInfo.bg} ${scoreInfo.color}`}>
          <span>{scorePercent}%</span>
          <span className="text-zinc-400 font-normal">·</span>
          <span>{scoreInfo.label}</span>
        </div>
      </div>

      {/* Toggle Items */}
      <div className="flex flex-col gap-2">
        {TOGGLES.map((toggle) => {
          const isOn = values[toggle.field];
          return (
            <motion.button
              key={toggle.field}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleToggle(toggle.field)}
              className={[
                'flex items-center justify-between rounded-xl border px-4 py-3 transition-all duration-200 cursor-pointer w-full text-left',
                isOn
                  ? 'border-emerald-500/50 bg-emerald-500/10'
                  : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600 hover:bg-zinc-800',
              ].join(' ')}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl leading-none">
                  {isOn ? toggle.iconOn : toggle.iconOff}
                </span>
                <span
                  className={`text-sm font-medium ${
                    isOn ? 'text-emerald-400' : 'text-zinc-400'
                  }`}
                >
                  {toggle.label}
                </span>
              </div>

              {/* Toggle Switch Visual */}
              <div
                className={[
                  'relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 transition-colors duration-200',
                  isOn
                    ? 'border-emerald-500 bg-emerald-500'
                    : 'border-zinc-600 bg-zinc-700',
                ].join(' ')}
              >
                <span
                  className={[
                    'pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 mt-px',
                    isOn ? 'translate-x-3.5' : 'translate-x-0.5',
                  ].join(' ')}
                />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Progress Dots */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={[
              'h-2 w-2 rounded-full transition-all duration-300',
              i < checkedCount ? 'bg-emerald-500 scale-110' : 'bg-zinc-700',
            ].join(' ')}
          />
        ))}
      </div>
    </div>
  );
}
