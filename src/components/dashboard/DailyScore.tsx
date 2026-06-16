'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { getDayRating, today } from '@/lib/utils';
import { ProgressRing } from '@/components/common/ProgressRing';
import { Trophy } from 'lucide-react';

export function DailyScore() {
  const dailyEntries = useAppStore(s => s.dailyEntries);
  const entry = dailyEntries[today()];
  const score = entry?.score || 0;
  const rating = getDayRating(score);
  const colorMap: Record<string, string> = {
    'text-emerald-400': '#10b981',
    'text-blue-400': '#3b82f6',
    'text-amber-400': '#f59e0b',
    'text-red-400': '#ef4444',
  };
  const ringColor = colorMap[rating.color] || '#10b981';

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-white">Today's Score</h3>
          <p className="text-xs text-zinc-500">Based on checklist completion</p>
        </div>
        <Trophy size={18} className="text-amber-400" />
      </div>
      <div className="flex items-center gap-6">
        <ProgressRing value={score} size={90} strokeWidth={7} color={ringColor} label={`${score}`} sublabel="pts" />
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={rating.label}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${rating.bg} ${rating.color}`}
            >
              {rating.label}
            </motion.div>
          </AnimatePresence>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              { label: '0-40', desc: 'Poor', color: 'bg-red-500/20' },
              { label: '40-70', desc: 'Average', color: 'bg-amber-500/20' },
              { label: '70-90', desc: 'Good', color: 'bg-blue-500/20' },
              { label: '90+', desc: 'Excellent', color: 'bg-emerald-500/20' },
            ].map(r => (
              <div key={r.label} className={`rounded-lg px-2 py-1 ${r.color}`}>
                <p className="text-[10px] text-zinc-400">{r.label}</p>
                <p className="text-xs font-medium text-zinc-300">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
