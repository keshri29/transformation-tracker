'use client';
import { motion } from 'framer-motion';
import { getDailyQuote } from '@/lib/quotes';
import { getDayNumber, calculateStreak } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { Flame } from 'lucide-react';

export function DayProgress() {
  const { startDate, dailyEntries } = useAppStore();
  const dayNum = getDayNumber(startDate);
  const streak = calculateStreak(dailyEntries, startDate);
  const progress = (dayNum / 90) * 100;
  const quote = getDailyQuote();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">90 Day Transformation</p>
          <h1 className="text-3xl font-bold text-white">Day {dayNum} <span className="text-zinc-500 text-xl">/ 90</span></h1>
        </div>
        <div className="flex items-center gap-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 px-3 py-2">
          <Flame size={16} className="text-orange-400" />
          <span className="text-sm font-bold text-orange-400">{streak}</span>
          <span className="text-xs text-zinc-500">streak</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-zinc-500">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/[0.08] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          />
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3">
        <div className="flex items-start gap-2">
          <span className="text-lg mt-0.5">💭</span>
          <p className="text-sm italic text-zinc-300 leading-relaxed">"{quote}"</p>
        </div>
      </div>
    </div>
  );
}
