'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { calculateStreak } from '@/lib/utils';

const ACHIEVEMENTS = [
  { id: '7-day-streak', title: '7 Day Streak', description: 'Complete 7 consecutive days', icon: '🔥', condition: '7+ day streak' },
  { id: '30-day-streak', title: '30 Day Streak', description: 'Unstoppable! 30 days straight', icon: '⚡', condition: '30+ day streak' },
  { id: 'first-5kg', title: 'First 5 Kg Lost', description: 'Lost 5kg from starting weight', icon: '💪', condition: '5kg weight loss' },
  { id: 'saved-5000', title: 'Saved ₹5,000', description: 'Reached your monthly savings goal', icon: '💰', condition: '₹5000 saved' },
  { id: '50-jobs', title: '50 Jobs Applied', description: 'Applied to 50+ positions', icon: '🎯', condition: '50 jobs applied' },
  { id: 'product-20h', title: 'Product 20 Hours', description: 'Built your product for 20+ hours', icon: '🚀', condition: '20h product built' },
  { id: 'no-porn-30', title: '30 Days Clean', description: 'No porn for 30 consecutive days', icon: '🛡️', condition: '30 days no porn' },
  { id: 'gym-30', title: 'Gym Warrior', description: 'Hit the gym 30 times', icon: '🏋️', condition: '30 gym sessions' },
  { id: 'perfect-week', title: 'Perfect Week', description: 'Score 90+ every day for a week', icon: '⭐', condition: '7 days 90+ score' },
  { id: 'early-bird', title: 'Early Bird', description: 'Wake up on time for 14 days', icon: '🌅', condition: '14 days wake up' },
];

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
}

function generateConfetti(count: number): ConfettiPiece[] {
  const colors = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#f97316'];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 0.5,
    duration: 0.8 + Math.random() * 0.6,
  }));
}

function ConfettiOverlay({ active }: { active: boolean }) {
  const [pieces] = useState(() => generateConfetti(24));

  return (
    <AnimatePresence>
      {active && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl z-10">
          {pieces.map((piece) => (
            <motion.div
              key={piece.id}
              className="absolute w-2 h-2 rounded-sm"
              style={{
                left: `${piece.x}%`,
                top: '-8px',
                backgroundColor: piece.color,
              }}
              initial={{ y: -8, opacity: 1, rotate: 0, scale: 1 }}
              animate={{ y: 140, opacity: 0, rotate: 360 * (Math.random() > 0.5 ? 1 : -1), scale: 0.5 }}
              transition={{
                duration: piece.duration,
                delay: piece.delay,
                ease: 'easeIn',
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

function checkPerfectWeek(dailyEntries: Record<string, import('@/store/types').DailyEntry>): boolean {
  const now = new Date();
  for (let offset = 0; offset <= 30; offset++) {
    let streak = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - offset - i);
      const dateStr = d.toISOString().split('T')[0];
      const entry = dailyEntries[dateStr];
      if (entry && entry.score >= 90) {
        streak++;
      } else {
        break;
      }
    }
    if (streak >= 7) return true;
  }
  return false;
}

function checkNoPorn30(habitEntries: Record<string, import('@/store/types').HabitEntry>): boolean {
  const now = new Date();
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const entry = habitEntries[dateStr];
    if (entry && entry.noPorn) {
      streak++;
    } else {
      break;
    }
  }
  return streak >= 30;
}

function checkEarlyBird(dailyEntries: Record<string, import('@/store/types').DailyEntry>): boolean {
  const now = new Date();
  let count = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const entry = dailyEntries[dateStr];
    if (entry) {
      const wakeUpItem = entry.checklist.find((c) => c.id === 'wake-up');
      if (wakeUpItem?.checked) {
        count++;
        if (count >= 14) return true;
      }
    }
  }
  return false;
}

export default function AchievementSystem() {
  const {
    dailyEntries,
    habitEntries,
    bodyMeasurements,
    careerEntries,
    financeEntries,
    startDate,
    unlockedAchievements,
    unlockAchievement,
  } = useAppStore();

  const prevUnlockedRef = useRef<string[]>([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState<string | null>(null);

  useEffect(() => {
    const streak = calculateStreak(dailyEntries, startDate);

    const sortedMeasurements = [...bodyMeasurements].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const firstWeight = sortedMeasurements[0]?.weight ?? null;
    const latestWeight = sortedMeasurements[sortedMeasurements.length - 1]?.weight ?? null;
    const weightLost = firstWeight != null && latestWeight != null ? firstWeight - latestWeight : 0;

    const maxSavings = financeEntries.reduce((max, e) => Math.max(max, e.savings ?? 0), 0);
    const totalJobsApplied = careerEntries.reduce((sum, e) => sum + (e.jobsApplied ?? 0), 0);
    const totalProductHours = careerEntries.reduce((sum, e) => sum + (e.hoursProductBuilt ?? 0), 0);
    const gymCount = Object.values(habitEntries).filter((e) => e.gym).length;

    const conditions: Record<string, boolean> = {
      '7-day-streak': streak >= 7,
      '30-day-streak': streak >= 30,
      'first-5kg': weightLost >= 5,
      'saved-5000': maxSavings >= 5000,
      '50-jobs': totalJobsApplied >= 50,
      'product-20h': totalProductHours >= 20,
      'no-porn-30': checkNoPorn30(habitEntries),
      'gym-30': gymCount >= 30,
      'perfect-week': checkPerfectWeek(dailyEntries),
      'early-bird': checkEarlyBird(dailyEntries),
    };

    for (const [id, met] of Object.entries(conditions)) {
      if (met && !unlockedAchievements.includes(id)) {
        unlockAchievement(id);
      }
    }
  }, [dailyEntries, habitEntries, bodyMeasurements, careerEntries, financeEntries, startDate, unlockedAchievements, unlockAchievement]);

  useEffect(() => {
    const prev = prevUnlockedRef.current;
    const added = unlockedAchievements.find((id) => !prev.includes(id));
    if (added) {
      setNewlyUnlocked(added);
      const timer = setTimeout(() => setNewlyUnlocked(null), 2000);
      prevUnlockedRef.current = unlockedAchievements;
      return () => clearTimeout(timer);
    }
    prevUnlockedRef.current = unlockedAchievements;
  }, [unlockedAchievements]);

  const unlockedCount = unlockedAchievements.length;
  const totalCount = ACHIEVEMENTS.length;

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          <h2 className="text-xl font-bold text-zinc-100">Achievements</h2>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1">
          <span className="text-amber-400 text-sm font-semibold">{unlockedCount}/{totalCount}</span>
          <span className="text-zinc-500 text-xs">unlocked</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-zinc-400 text-sm">Overall Progress</span>
          <span className="text-amber-400 text-sm font-semibold">
            {Math.round((unlockedCount / totalCount) * 100)}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400"
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-2 gap-3">
        {ACHIEVEMENTS.map((achievement, index) => {
          const isUnlocked = unlockedAchievements.includes(achievement.id);
          const isNew = newlyUnlocked === achievement.id;

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.35 }}
              className="relative"
            >
              <div
                className={[
                  'relative overflow-hidden rounded-2xl border backdrop-blur-sm p-4 transition-all duration-300',
                  isUnlocked
                    ? 'border-amber-500/40 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                    : 'border-white/10 bg-white/5',
                ].join(' ')}
              >
                {/* Confetti overlay for newly unlocked */}
                <ConfettiOverlay active={isNew} />

                {/* Icon */}
                <div className="flex items-start justify-between mb-2">
                  <motion.span
                    className="text-3xl leading-none"
                    animate={isUnlocked ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                    transition={isUnlocked ? { duration: 0.5, ease: 'easeInOut' } : {}}
                    style={isUnlocked ? {} : { filter: 'grayscale(1) brightness(0.4)' }}
                  >
                    {achievement.icon}
                  </motion.span>

                  {isUnlocked && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                      className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0"
                    >
                      <svg className="w-3 h-3 text-zinc-900" fill="none" viewBox="0 0 12 12">
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </motion.div>
                  )}

                  {!isUnlocked && (
                    <div className="w-5 h-5 rounded-full border border-zinc-700 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-zinc-600" fill="none" viewBox="0 0 12 12">
                        <path
                          d="M5 4V5.5a1 1 0 002 0V4a2 2 0 10-4 0"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                        <rect x="2.5" y="5.5" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Title */}
                <p
                  className={[
                    'text-sm font-semibold leading-tight mb-1',
                    isUnlocked ? 'text-amber-300' : 'text-zinc-500',
                  ].join(' ')}
                >
                  {achievement.title}
                </p>

                {/* Description */}
                <p
                  className={[
                    'text-xs leading-snug',
                    isUnlocked ? 'text-zinc-300' : 'text-zinc-600',
                  ].join(' ')}
                >
                  {achievement.description}
                </p>

                {/* Condition tag */}
                <div
                  className={[
                    'mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs',
                    isUnlocked
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-zinc-800/60 text-zinc-600',
                  ].join(' ')}
                >
                  {achievement.condition}
                </div>

                {/* Gold shimmer overlay for unlocked */}
                {isUnlocked && (
                  <motion.div
                    className="pointer-events-none absolute inset-0 rounded-2xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, transparent 60%)',
                    }}
                  />
                )}

                {/* Newly unlocked flash */}
                <AnimatePresence>
                  {isNew && (
                    <motion.div
                      className="pointer-events-none absolute inset-0 rounded-2xl bg-amber-400/20"
                      initial={{ opacity: 0.8 }}
                      animate={{ opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.2 }}
                    />
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Completion banner */}
      <AnimatePresence>
        {unlockedCount === totalCount && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-2xl border border-amber-500/40 bg-amber-500/10 backdrop-blur-sm p-4 text-center shadow-[0_0_30px_rgba(245,158,11,0.3)]"
          >
            <p className="text-2xl mb-1">🎉</p>
            <p className="text-amber-300 font-bold text-sm">All achievements unlocked!</p>
            <p className="text-zinc-400 text-xs mt-0.5">You are unstoppable. Keep going.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
