'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Circle, Layers } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { formatDate } from '@/lib/utils';
import { ProductMilestone } from '@/store/types';

function MilestoneCard({
  milestone,
  index,
  onToggle,
}: {
  milestone: ProductMilestone;
  index: number;
  onToggle: (id: string) => void;
}) {
  const { completed, completedDate } = milestone;

  return (
    <motion.button
      key={milestone.id}
      onClick={() => onToggle(milestone.id)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      whileTap={{ scale: 0.97 }}
      className={`w-full text-left rounded-xl border px-4 py-3.5 flex items-center gap-3 transition-all duration-300 cursor-pointer ${
        completed
          ? 'border-purple-500/40 bg-purple-500/15 shadow-[0_0_16px_rgba(139,92,246,0.2)]'
          : 'border-white/[0.08] bg-white/[0.03] hover:border-purple-500/25 hover:bg-purple-500/[0.06]'
      }`}
    >
      {/* Icon */}
      <AnimatePresence mode="wait">
        {completed ? (
          <motion.span
            key="checked"
            initial={{ scale: 0, rotate: -45, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="flex-shrink-0"
          >
            <CheckCircle size={22} className="text-purple-400" />
          </motion.span>
        ) : (
          <motion.span
            key="unchecked"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0"
          >
            <Circle size={22} className="text-zinc-600" />
          </motion.span>
        )}
      </AnimatePresence>

      {/* Label + date */}
      <div className="flex flex-col min-w-0">
        <span
          className={`text-sm font-medium leading-snug transition-colors duration-200 ${
            completed ? 'line-through text-purple-300/70' : 'text-zinc-200'
          }`}
        >
          {milestone.label}
        </span>
        <AnimatePresence>
          {completed && completedDate && (
            <motion.span
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="text-[10px] text-purple-400/70 mt-0.5"
            >
              Completed {formatDate(completedDate)}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Celebration burst on complete */}
      <AnimatePresence>
        {completed && (
          <motion.span
            key="burst"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="ml-auto flex-shrink-0 h-4 w-4 rounded-full bg-purple-400/30 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export function ProductBuilder() {
  const productMilestones = useAppStore(s => s.productMilestones);
  const toggleMilestone    = useAppStore(s => s.toggleMilestone);

  const total     = productMilestones.length;
  const completed = productMilestones.filter(m => m.completed).length;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;

  const pctColor =
    pct === 100 ? 'text-emerald-400' :
    pct >= 60   ? 'text-purple-400'  :
    pct >= 30   ? 'text-blue-400'    :
                  'text-zinc-400';

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
            <Layers size={16} className="text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-100">HRMS Product</h3>
            <p className="text-xs text-zinc-500">Milestone tracker</p>
          </div>
        </div>

        {/* Completion badge */}
        <motion.div
          key={pct}
          initial={{ scale: 0.85, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          className={`flex flex-col items-center rounded-xl border border-purple-500/20 bg-purple-500/10 px-3 py-1.5`}
        >
          <span className={`text-lg font-bold leading-none ${pctColor}`}>{pct}%</span>
          <span className="text-[9px] text-zinc-500 mt-0.5">COMPLETE</span>
        </motion.div>
      </div>

      {/* Large progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-400">Overall Progress</span>
          <span className="text-xs font-semibold text-purple-400">{completed}/{total} milestones</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-purple-700 via-purple-500 to-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-zinc-600">
            {pct === 0   ? 'Not started yet' :
             pct === 100 ? 'All milestones complete!' :
             `${total - completed} milestone${total - completed !== 1 ? 's' : ''} remaining`}
          </span>
          <span className="text-[10px] text-purple-400/70">{pct}%</span>
        </div>
      </div>

      {/* Milestone cards */}
      <div className="space-y-2">
        {productMilestones.map((milestone, i) => (
          <MilestoneCard
            key={milestone.id}
            milestone={milestone}
            index={i}
            onToggle={toggleMilestone}
          />
        ))}
      </div>

      {/* Footer summary */}
      {pct === 100 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-center"
        >
          <p className="text-sm font-semibold text-emerald-400">HRMS product is complete!</p>
          <p className="text-xs text-zinc-500 mt-0.5">All {total} milestones delivered.</p>
        </motion.div>
      )}
    </div>
  );
}
