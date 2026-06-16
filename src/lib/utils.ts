import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, differenceInDays, parseISO, isToday } from 'date-fns';
import { ChecklistItem, DailyEntry, MoodType } from '@/store/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function today(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function currentMonth(): string {
  return format(new Date(), 'yyyy-MM');
}

export function getDayNumber(startDate: string): number {
  try {
    const start = parseISO(startDate);
    const now = new Date();
    return Math.min(Math.max(differenceInDays(now, start) + 1, 1), 90);
  } catch {
    return 1;
  }
}

export function calculateScore(checklist: ChecklistItem[]): number {
  const total = checklist.reduce((sum, item) => sum + item.weight, 0);
  const earned = checklist
    .filter(item => item.checked)
    .reduce((sum, item) => sum + item.weight, 0);
  return total > 0 ? Math.round((earned / total) * 100) : 0;
}

export function getDayRating(score: number): { label: string; color: string; bg: string } {
  if (score >= 90) return { label: 'Excellent Day', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
  if (score >= 70) return { label: 'Good Day', color: 'text-blue-400', bg: 'bg-blue-500/10' };
  if (score >= 40) return { label: 'Average Day', color: 'text-amber-400', bg: 'bg-amber-500/10' };
  return { label: 'Poor Day', color: 'text-red-400', bg: 'bg-red-500/10' };
}

export function calculateStreak(
  dailyEntries: Record<string, DailyEntry>,
  startDate: string
): number {
  let streak = 0;
  const now = new Date();

  for (let i = 0; i < 90; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = format(d, 'yyyy-MM-dd');

    if (dateStr < startDate) break;

    const entry = dailyEntries[dateStr];
    if (entry && entry.score >= 40) {
      streak++;
    } else if (i === 0) {
      // Today is allowed to be in-progress
      continue;
    } else {
      break;
    }
  }

  return streak;
}

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

export function formatMonth(monthStr: string): string {
  try {
    return format(parseISO(monthStr + '-01'), 'MMMM yyyy');
  } catch {
    return monthStr;
  }
}

export function getMoodEmoji(mood: MoodType | null): string {
  const emojis: Record<MoodType, string> = {
    bad: '😞',
    average: '😐',
    good: '🙂',
    excellent: '🔥',
  };
  return mood ? emojis[mood] : '—';
}

export function getMoodColor(mood: MoodType | null): string {
  const colors: Record<MoodType, string> = {
    bad: 'text-red-400',
    average: 'text-amber-400',
    good: 'text-blue-400',
    excellent: 'text-emerald-400',
  };
  return mood ? colors[mood] : 'text-zinc-500';
}

export function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(format(d, 'yyyy-MM-dd'));
  }
  return days;
}

export function getLast30Days(): string[] {
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(format(d, 'yyyy-MM-dd'));
  }
  return days;
}

export function getHabitCompletionRate(
  entries: Record<string, import('@/store/types').HabitEntry>,
  habit: keyof Omit<import('@/store/types').HabitEntry, 'date'>,
  days = 30
): number {
  const dates = getLast30Days().slice(-days);
  const completed = dates.filter(d => entries[d]?.[habit]).length;
  return dates.length > 0 ? Math.round((completed / dates.length) * 100) : 0;
}
