'use client';

import React, { useRef, useState } from 'react';
import { Settings, Moon, Download, Upload, Trash2, Calendar, Clock } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { today, getDayNumber, formatDate } from '@/lib/utils';

export function SettingsPanel() {
  const { startDate, exportData, importData, resetData } = useAppStore();
  const [confirmReset, setConfirmReset] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dayNumber = getDayNumber(startDate);
  const daysRemaining = Math.max(0, 90 - dayNumber + 1);

  function handleExport() {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transformation-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    setImportSuccess(false);
    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target?.result as string;
      try {
        importData(json);
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 3000);
      } catch {
        setImportError('Invalid backup file. Please select a valid transformation-backup.json.');
      }
    };
    reader.readAsText(file);
    // Reset the input so the same file can be re-imported if needed
    e.target.value = '';
  }

  function handleResetClick() {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    resetData();
    setConfirmReset(false);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Settings className="w-4 h-4 text-zinc-400" />
        <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-widest">Settings</h2>
      </div>

      {/* Dark Mode Toggle (always on, disabled) */}
      <div className="flex items-center justify-between py-2 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Moon className="w-4 h-4 text-zinc-400" />
          <div>
            <p className="text-sm font-medium text-zinc-100">Dark Mode</p>
            <p className="text-xs text-zinc-500">Always enabled</p>
          </div>
        </div>
        <button
          disabled
          aria-label="Dark mode toggle (always on)"
          className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-500 opacity-60 cursor-not-allowed transition-colors"
        >
          <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white shadow transition-transform" />
        </button>
      </div>

      {/* Export Data */}
      <div className="flex items-center justify-between py-2 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Download className="w-4 h-4 text-zinc-400" />
          <div>
            <p className="text-sm font-medium text-zinc-100">Export Data</p>
            <p className="text-xs text-zinc-500">Download a JSON backup</p>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-100 border border-white/10 transition-colors"
        >
          Export
        </button>
      </div>

      {/* Import Backup */}
      <div className="flex items-center justify-between py-2 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Upload className="w-4 h-4 text-zinc-400" />
          <div>
            <p className="text-sm font-medium text-zinc-100">Import Backup</p>
            <p className="text-xs text-zinc-500">Restore from a JSON file</p>
          </div>
        </div>
        <button
          onClick={handleImportClick}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-100 border border-white/10 transition-colors"
        >
          Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Import feedback */}
      {importSuccess && (
        <p className="text-xs text-emerald-400 -mt-2 px-1">Backup imported successfully.</p>
      )}
      {importError && (
        <p className="text-xs text-red-400 -mt-2 px-1">{importError}</p>
      )}

      {/* Reset All Data */}
      <div className="flex items-center justify-between py-2 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Trash2 className="w-4 h-4 text-red-400" />
          <div>
            <p className="text-sm font-medium text-red-400">Reset All Data</p>
            <p className="text-xs text-zinc-500">Erase everything permanently</p>
          </div>
        </div>
        <button
          onClick={handleResetClick}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            confirmReset
              ? 'bg-red-500 hover:bg-red-600 text-white border-red-400'
              : 'bg-zinc-800 hover:bg-red-900/40 text-red-400 border-red-900/50'
          }`}
        >
          {confirmReset ? 'Confirm?' : 'Reset'}
        </button>
      </div>

      {confirmReset && (
        <p className="text-xs text-amber-400 -mt-2 px-1">
          Are you sure? Tap "Confirm?" again to permanently delete all data.
        </p>
      )}

      {/* Journey Info */}
      <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-3 space-y-2">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>Started: <span className="text-zinc-300">{formatDate(startDate)}</span></span>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Clock className="w-3.5 h-3.5" />
          <span>
            Day <span className="text-emerald-400 font-semibold">{dayNumber}</span> of 90 ·{' '}
            <span className="text-zinc-300">{daysRemaining} days remaining</span>
          </span>
        </div>
      </div>

      {/* App version */}
      <p className="text-center text-xs text-zinc-600">v1.0.0 · 90 Day Transformation</p>
    </div>
  );
}
