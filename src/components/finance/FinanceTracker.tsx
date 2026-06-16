'use client';
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useAppStore } from '@/store/useAppStore';
import { currentMonth, formatMonth } from '@/lib/utils';

const SALARY = 25_000;
const SAVINGS_GOAL = 5_000;

interface Category {
  key: 'pgRent' | 'food' | 'transport' | 'savings' | 'otherExpenses';
  label: string;
  color: string;
  placeholder: string;
}

const CATEGORIES: Category[] = [
  { key: 'pgRent',        label: 'PG Rent',       color: '#ef4444', placeholder: '6000' },
  { key: 'food',          label: 'Food',           color: '#f59e0b', placeholder: '3000' },
  { key: 'transport',     label: 'Transport',      color: '#3b82f6', placeholder: '1000' },
  { key: 'savings',       label: 'Savings',        color: '#10b981', placeholder: '5000' },
  { key: 'otherExpenses', label: 'Other Expenses', color: '#8b5cf6', placeholder: '2000' },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-xs shadow-lg">
      <span style={{ color: item.payload.color }} className="font-semibold">{item.name}</span>
      <span className="ml-2 text-zinc-300">₹{item.value.toLocaleString('en-IN')}</span>
    </div>
  );
}

export function FinanceTracker() {
  const financeEntries = useAppStore(s => s.financeEntries);
  const updateFinanceEntry = useAppStore(s => s.updateFinanceEntry);

  const month = currentMonth();
  const entry = financeEntries.find(e => e.month === month);

  const values = {
    pgRent:        entry?.pgRent        ?? 0,
    food:          entry?.food          ?? 0,
    transport:     entry?.transport     ?? 0,
    savings:       entry?.savings       ?? 0,
    otherExpenses: entry?.otherExpenses ?? 0,
  };

  const totalSpent = values.pgRent + values.food + values.transport + values.savings + values.otherExpenses;
  const remaining  = SALARY - totalSpent;
  const savingsRate = Math.round((values.savings / SALARY) * 100);
  const savingsProgress = Math.min((values.savings / SAVINGS_GOAL) * 100, 100);

  const chartData = useMemo(() => {
    const items = CATEGORIES.map(cat => ({
      name:  cat.label,
      value: values[cat.key],
      color: cat.color,
    })).filter(d => d.value > 0);

    if (remaining > 0) {
      items.push({ name: 'Remaining', value: remaining, color: '#27272a' });
    }

    return items;
  }, [values, remaining]);

  function handleChange(key: Category['key'], raw: string) {
    const num = parseFloat(raw);
    updateFinanceEntry(month, { [key]: isNaN(num) ? 0 : Math.max(0, num) });
  }

  const remainingIsNegative = remaining < 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
            <Wallet size={16} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-100">Finance Tracker</h3>
            <p className="text-xs text-zinc-500">{formatMonth(month)}</p>
          </div>
        </div>

        {/* Salary badge */}
        <div className="flex flex-col items-end rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5">
          <span className="text-sm font-bold text-emerald-400">₹25,000</span>
          <span className="text-[9px] text-zinc-500 mt-0.5">SALARY</span>
        </div>
      </div>

      {/* Donut chart */}
      <div className="flex items-center gap-4">
        <div className="h-44 w-44 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData.length > 0 ? chartData : [{ name: 'Unallocated', value: SALARY, color: '#27272a' }]}
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="85%"
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {(chartData.length > 0 ? chartData : [{ name: 'Unallocated', value: SALARY, color: '#27272a' }]).map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          {CATEGORIES.map(cat => (
            <div key={cat.key} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="truncate text-[11px] text-zinc-400">{cat.label}</span>
              </div>
              <span className="text-[11px] font-medium text-zinc-300 flex-shrink-0">
                ₹{values[cat.key].toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Input fields */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-zinc-400">Monthly Budget Breakdown</p>
        <div className="grid grid-cols-1 gap-2">
          {CATEGORIES.map(cat => (
            <div key={cat.key} className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
              <span
                className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              <label className="w-28 flex-shrink-0 text-xs text-zinc-400">{cat.label}</label>
              <div className="flex flex-1 items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.06] px-2 py-1">
                <span className="text-xs text-zinc-500">₹</span>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={values[cat.key] || ''}
                  placeholder={cat.placeholder}
                  onChange={e => handleChange(cat.key, e.target.value)}
                  className="w-full bg-transparent text-right text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">

        {/* Remaining balance */}
        <div className={`flex flex-col items-center rounded-xl border px-2 py-3 ${
          remainingIsNegative
            ? 'border-red-500/20 bg-red-500/10'
            : 'border-emerald-500/20 bg-emerald-500/10'
        }`}>
          {remainingIsNegative
            ? <AlertTriangle size={14} className="text-red-400 mb-1" />
            : <TrendingUp size={14} className="text-emerald-400 mb-1" />
          }
          <span className={`text-sm font-bold ${remainingIsNegative ? 'text-red-400' : 'text-emerald-400'}`}>
            {remainingIsNegative ? '-' : '+'}₹{Math.abs(remaining).toLocaleString('en-IN')}
          </span>
          <span className="text-[9px] text-zinc-500 mt-0.5">REMAINING</span>
        </div>

        {/* Savings rate */}
        <div className="flex flex-col items-center rounded-xl border border-blue-500/20 bg-blue-500/10 px-2 py-3">
          <TrendingUp size={14} className="text-blue-400 mb-1" />
          <span className="text-sm font-bold text-blue-400">{savingsRate}%</span>
          <span className="text-[9px] text-zinc-500 mt-0.5">SAVE RATE</span>
        </div>

        {/* Total spent */}
        <div className="flex flex-col items-center rounded-xl border border-white/[0.08] bg-white/[0.04] px-2 py-3">
          <Wallet size={14} className="text-zinc-400 mb-1" />
          <span className="text-sm font-bold text-zinc-300">₹{totalSpent.toLocaleString('en-IN')}</span>
          <span className="text-[9px] text-zinc-500 mt-0.5">ALLOCATED</span>
        </div>
      </div>

      {/* Savings goal progress */}
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-3 space-y-2 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Target size={13} className="text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">Savings Goal</span>
          </div>
          <span className="text-xs text-zinc-400">
            ₹{values.savings.toLocaleString('en-IN')} / ₹{SAVINGS_GOAL.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
            initial={{ width: 0 }}
            animate={{ width: `${savingsProgress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-zinc-500">
            {savingsProgress >= 100 ? 'Goal reached!' : `${Math.round(savingsProgress)}% of ₹5,000 goal`}
          </span>
          <span className="text-[10px] text-emerald-400 font-medium">{savingsRate}% of salary saved</span>
        </div>
      </div>

    </div>
  );
}
