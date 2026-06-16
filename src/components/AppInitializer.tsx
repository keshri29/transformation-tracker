'use client';
import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

export function AppInitializer() {
  const initializeFromDB = useAppStore(s => s.initializeFromDB);
  useEffect(() => {
    initializeFromDB();
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, [initializeFromDB]);
  return null;
}
