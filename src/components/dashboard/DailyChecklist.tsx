'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { today } from '@/lib/utils';
import { ChecklistItem } from '@/store/types';
import { CheckCircle2, Circle, ClipboardList } from 'lucide-react';

export function DailyChecklist() {
  const dailyEntries = useAppStore(s => s.dailyEntries);
  const toggleChecklistItem = useAppStore(s => s.toggleChecklistItem);
  const todayStr = today();
  const entry = dailyEntries[todayStr];
  const checklist: ChecklistItem[] = entry?.checklist ?? [];
  const total = checklist.length;
  const completed = checklist.filter(i => i.checked).length;
  const progressPercent = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ClipboardList size={18} className="text-emerald-400" />
          <h3 className="font-semibold text-white">Daily Checklist</h3>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1">
          <span className="text-sm font-bold text-emerald-400">{completed}</span>
          <span className="text-xs text-zinc-500">/ {total === 0 ? 11 : total}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4 space-y-1">
        <div className="flex justify-between text-xs text-zinc-500">
          <span>
            {completed === total && total > 0
              ? 'All done!'
              : `${total - completed} remaining`}
          </span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Checklist items */}
      <div className="divide-y divide-white/[0.05]">
        {checklist.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-4">
            No checklist items for today.
          </p>
        ) : (
          checklist.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => toggleChecklistItem(todayStr, item.id)}
              whileTap={{ scale: 0.97 }}
              className="flex w-full items-center gap-3 px-2 py-2.5 text-left transition-colors hover:bg-white/[0.05] active:bg-white/[0.08] first:rounded-t-lg last:rounded-b-lg"
            >
              {/* Animated circle checkbox */}
              <div className="relative flex-shrink-0 w-5 h-5">
                <AnimatePresence mode="wait">
                  {item.checked ? (
                    <motion.div
                      key="checked"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className="absolute inset-0"
                    >
                      <CheckCircle2 size={20} className="text-emerald-400" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="unchecked"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className="absolute inset-0"
                    >
                      <Circle size={20} className="text-zinc-600" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Label */}
              <span
                className={`flex-1 text-sm transition-all duration-200 ${
                  item.checked
                    ? 'line-through text-emerald-400/60'
                    : 'text-zinc-300'
                }`}
              >
                {item.label}
              </span>

              {/* Weight badge */}
              <span
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md flex-shrink-0 ${
                  item.checked
                    ? 'bg-emerald-500/15 text-emerald-400/70'
                    : 'bg-white/[0.06] text-zinc-500'
                }`}
              >
                +{item.weight}pts
              </span>
            </motion.button>
          ))
        )}
      </div>

      {/* Completion celebration */}
      <AnimatePresence>
        {completed === total && total > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-center"
          >
            <p className="text-sm font-semibold text-emerald-400">
              Perfect day! All tasks complete.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
