'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Activity, Package, BarChart3, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const tabs = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/habits', icon: Activity, label: 'Habits' },
  { href: '/product', icon: Package, label: 'Product' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/8 bg-zinc-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className="relative flex flex-col items-center gap-0.5 px-4 py-2 min-w-0">
              {active && (
                <motion.div layoutId="nav-pill" className="absolute inset-0 rounded-xl bg-emerald-500/10" transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }} />
              )}
              <Icon size={20} className={cn('relative z-10 transition-colors duration-200', active ? 'text-emerald-400' : 'text-zinc-500')} />
              <span className={cn('relative z-10 text-[10px] font-medium transition-colors duration-200', active ? 'text-emerald-400' : 'text-zinc-600')}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
