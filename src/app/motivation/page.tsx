'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { motion } from 'framer-motion';

const goals = [
  { icon: '💪', title: 'Better Body', desc: 'Transform physically — lean, strong, disciplined', color: 'from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/30' },
  { icon: '💼', title: 'Better Career', desc: 'Land a high-paying software engineering role', color: 'from-blue-500/20 to-blue-500/5', border: 'border-blue-500/30' },
  { icon: '🏢', title: 'Own Company', desc: 'Build a profitable SaaS business from scratch', color: 'from-purple-500/20 to-purple-500/5', border: 'border-purple-500/30' },
  { icon: '💰', title: 'Financial Freedom', desc: 'No financial stress, build wealth consistently', color: 'from-amber-500/20 to-amber-500/5', border: 'border-amber-500/30' },
  { icon: '👨‍👩‍👦', title: 'Help Family', desc: 'Give your family a better life', color: 'from-pink-500/20 to-pink-500/5', border: 'border-pink-500/30' },
  { icon: '🐕', title: 'Own Dogs', desc: 'Build a home where dogs can live freely', color: 'from-orange-500/20 to-orange-500/5', border: 'border-orange-500/30' },
  { icon: '🚀', title: 'Build SaaS Products', desc: 'Create multiple products that generate passive income', color: 'from-cyan-500/20 to-cyan-500/5', border: 'border-cyan-500/30' },
];

export default function MotivationPage() {
  return (
    <PageWrapper>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-2">Your Why</p>
          <h1 className="text-3xl font-bold gradient-text mb-3">Remember Why</h1>
          <h2 className="text-3xl font-bold text-white mb-4">You Started</h2>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-xs mx-auto">Every day you show up is a vote for the person you want to become. Keep going.</p>
        </motion.div>

        <div className="space-y-3">
          {goals.map((goal, i) => (
            <motion.div
              key={goal.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-2xl border ${goal.border} bg-gradient-to-r ${goal.color} p-4`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{goal.icon}</span>
                <div>
                  <h3 className="font-semibold text-white">{goal.title}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{goal.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center"
        >
          <p className="text-4xl mb-3">🔥</p>
          <p className="text-lg font-bold gradient-text-gold">"Your future is built by what you do today."</p>
          <p className="text-xs text-zinc-500 mt-2">90 days. All in. No excuses.</p>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
