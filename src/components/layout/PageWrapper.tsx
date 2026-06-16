'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageWrapperProps { children: ReactNode; className?: string; }

export function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`mx-auto max-w-lg px-4 py-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}
