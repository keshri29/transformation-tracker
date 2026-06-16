import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: 'emerald' | 'blue' | 'purple' | 'amber' | 'none';
  onClick?: () => void;
}

export function GlassCard({ children, className, glow = 'none', onClick }: GlassCardProps) {
  const glowClass = {
    emerald: 'shadow-[0_0_20px_rgba(16,185,129,0.2)] border-emerald-500/20',
    blue: 'shadow-[0_0_20px_rgba(59,130,246,0.2)] border-blue-500/20',
    purple: 'shadow-[0_0_20px_rgba(139,92,246,0.2)] border-purple-500/20',
    amber: 'shadow-[0_0_20px_rgba(245,158,11,0.2)] border-amber-500/20',
    none: 'border-white/10',
  }[glow];

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl border bg-white/5 backdrop-blur-sm',
        glowClass,
        onClick && 'cursor-pointer active:scale-[0.99] transition-transform',
        className
      )}
    >
      {children}
    </div>
  );
}
