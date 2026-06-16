'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { today, getMoodEmoji, getMoodColor } from '@/lib/utils';
import { MoodType } from '@/store/types';

const MOODS: { type: MoodType; label: string; emoji: string; border: string; bg: string; text: string }[] = [
  {
    type: 'bad',
    label: 'Bad',
    emoji: '😞',
    border: 'border-red-500',
    bg: 'bg-red-500/20',
    text: 'text-red-400',
  },
  {
    type: 'average',
    label: 'Average',
    emoji: '😐',
    border: 'border-amber-500',
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
  },
  {
    type: 'good',
    label: 'Good',
    emoji: '🙂',
    border: 'border-blue-500',
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
  },
  {
    type: 'excellent',
    label: 'Excellent',
    emoji: '🔥',
    border: 'border-emerald-500',
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
  },
];

export default function MoodTracker() {
  const dailyEntries = useAppStore((s) => s.dailyEntries);
  const setMood = useAppStore((s) => s.setMood);

  const todayStr = today();
  const todayEntry = dailyEntries[todayStr];
  const currentMood = todayEntry?.mood ?? null;
  const currentNote = todayEntry?.moodNote ?? '';

  const [note, setNote] = useState<string>(currentNote);

  function handleMoodSelect(mood: MoodType) {
    setMood(todayStr, mood, note);
  }

  function handleNoteChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setNote(e.target.value);
    if (currentMood) {
      setMood(todayStr, currentMood, e.target.value);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌙</span>
          <h2 className="text-zinc-100 font-semibold text-base">Today's Mood</h2>
        </div>
        {currentMood && (
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getMoodEmoji(currentMood)}</span>
            <span className={`text-sm font-medium ${getMoodColor(currentMood)}`}>
              {currentMood.charAt(0).toUpperCase() + currentMood.slice(1)}
            </span>
          </div>
        )}
      </div>

      {/* Mood Buttons */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {MOODS.map((m) => {
          const isSelected = currentMood === m.type;
          return (
            <motion.button
              key={m.type}
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.04 }}
              onClick={() => handleMoodSelect(m.type)}
              className={[
                'flex flex-col items-center justify-center gap-1 rounded-xl border py-3 px-2 transition-all duration-200 cursor-pointer',
                isSelected
                  ? `${m.border} ${m.bg} ${m.text}`
                  : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800',
              ].join(' ')}
            >
              <span className="text-xl leading-none">{m.emoji}</span>
              <span className="text-xs font-medium leading-none">{m.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Mood Note Textarea */}
      <textarea
        value={note}
        onChange={handleNoteChange}
        placeholder="What's on your mind?"
        rows={3}
        className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 text-zinc-100 placeholder-zinc-500 text-sm px-3 py-2 resize-none focus:outline-none focus:border-zinc-500 transition-colors duration-200"
      />
    </div>
  );
}
