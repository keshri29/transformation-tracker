'use client';
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, Plus, Minus, Save, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { useAppStore } from '@/store/useAppStore';
import { today, formatDate } from '@/lib/utils';

type MeasurementField = 'weight' | 'waist' | 'chest' | 'arms';

interface FieldConfig {
  key: MeasurementField;
  label: string;
  unit: string;
  step: number;
  color: string;
}

const FIELDS: FieldConfig[] = [
  { key: 'weight', label: 'Weight', unit: 'kg', step: 0.1, color: 'text-emerald-400' },
  { key: 'waist',  label: 'Waist',  unit: 'cm', step: 0.5, color: 'text-amber-400' },
  { key: 'chest',  label: 'Chest',  unit: 'cm', step: 0.5, color: 'text-blue-400' },
  { key: 'arms',   label: 'Arms',   unit: 'cm', step: 0.5, color: 'text-purple-400' },
];

function round(val: number, step: number): number {
  return Math.round(val / step) * step;
}

function fmt(val: number, step: number): string {
  const decimals = step < 1 ? 1 : 0;
  return val.toFixed(decimals);
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function WeightTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-zinc-900 px-2.5 py-1.5 text-xs">
      <p className="text-zinc-400">{label}</p>
      <p className="font-semibold text-emerald-400">{payload[0].value} kg</p>
    </div>
  );
}

export function BodyTracker() {
  const bodyMeasurements = useAppStore(s => s.bodyMeasurements);
  const addBodyMeasurement = useAppStore(s => s.addBodyMeasurement);

  const latest = bodyMeasurements[bodyMeasurements.length - 1];
  const initial = bodyMeasurements[0];

  const [values, setValues] = useState<Record<MeasurementField, number>>({
    weight: latest?.weight ?? 70,
    waist:  latest?.waist  ?? 80,
    chest:  latest?.chest  ?? 90,
    arms:   latest?.arms   ?? 32,
  });

  const [saved, setSaved] = useState(false);

  function adjust(field: MeasurementField, delta: number) {
    const config = FIELDS.find(f => f.key === field)!;
    setValues(prev => {
      const next = round(prev[field] + delta, config.step);
      return { ...prev, [field]: Math.max(0, next) };
    });
  }

  function handleSave() {
    addBodyMeasurement(values);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const weightChartData = useMemo(() => {
    return bodyMeasurements.slice(-10).map(m => ({
      date: formatDate(m.date).split(',')[0],
      weight: m.weight,
    }));
  }, [bodyMeasurements]);

  function getDelta(field: MeasurementField): number | null {
    if (!initial || !latest) return null;
    return round(latest[field] - initial[field], 0.1);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
          <Activity size={16} className="text-emerald-400" />
        </div>
        <div>
          <h3 className="font-semibold text-zinc-100">Body Transformation</h3>
          {bodyMeasurements.length > 0 && (
            <p className="text-xs text-zinc-500">
              Last updated {formatDate(latest.date)}
            </p>
          )}
        </div>
      </div>

      {/* Measurement inputs */}
      <div className="grid grid-cols-2 gap-3">
        {FIELDS.map(field => {
          const delta = getDelta(field.key);
          const isPositive = delta !== null && delta > 0;
          const isNegative = delta !== null && delta < 0;

          return (
            <div
              key={field.key}
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">{field.label}</span>
                {delta !== null && delta !== 0 && (
                  <div className={`flex items-center gap-0.5 text-[10px] font-medium ${isNegative ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isNegative ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
                    {isPositive ? '+' : ''}{fmt(delta, 0.1)} {field.unit}
                  </div>
                )}
              </div>

              {/* Stepper */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjust(field.key, -field.step)}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-zinc-300 transition-colors hover:bg-white/[0.12] active:scale-95"
                >
                  <Minus size={14} />
                </button>
                <div className="flex flex-1 flex-col items-center">
                  <span className={`text-lg font-bold ${field.color}`}>
                    {fmt(values[field.key], field.step)}
                  </span>
                  <span className="text-[10px] text-zinc-500">{field.unit}</span>
                </div>
                <button
                  onClick={() => adjust(field.key, field.step)}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-zinc-300 transition-colors hover:bg-white/[0.12] active:scale-95"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Initial comparison */}
              {initial && (
                <p className="text-center text-[10px] text-zinc-600">
                  Start: {fmt(initial[field.key], field.step)} {field.unit}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Save button */}
      <motion.button
        onClick={handleSave}
        whileTap={{ scale: 0.97 }}
        className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-300 ${
          saved
            ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
            : 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
        }`}
      >
        <Save size={15} />
        {saved ? 'Saved!' : "Save Today's Measurements"}
      </motion.button>

      {/* Weight trend chart */}
      {weightChartData.length >= 2 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Weight Trend</span>
            <span className="text-xs text-zinc-500">last {weightChartData.length} entries</span>
          </div>
          <div className="h-24 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightChartData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                <Tooltip content={<WeightTooltip />} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 3, strokeWidth: 0 }}
                  activeDot={{ fill: '#10b981', r: 4, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* No data state */}
      {bodyMeasurements.length === 0 && (
        <p className="text-center text-xs text-zinc-600 pb-1">
          No measurements yet — save your first entry above.
        </p>
      )}
    </div>
  );
}
