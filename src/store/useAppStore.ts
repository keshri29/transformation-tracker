import { create } from 'zustand';
import { AppData, ChecklistItem, DailyEntry, HabitEntry, MoodType } from './types';
import { saveData, loadData } from '@/lib/db';
import { today, calculateScore } from '@/lib/utils';

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: 'wake-up', label: 'Wake up on time', checked: false, weight: 8 },
  { id: 'drink-water', label: 'Drink water', checked: false, weight: 5 },
  { id: 'morning-walk', label: 'Morning walk', checked: false, weight: 9 },
  { id: 'no-instagram', label: 'No Instagram first 30 min', checked: false, weight: 8 },
  { id: 'work-focus', label: 'Work focus completed', checked: false, weight: 12 },
  { id: 'lunch-walk', label: 'Lunch walk', checked: false, weight: 6 },
  { id: 'gym', label: 'Gym completed', checked: false, weight: 12 },
  { id: 'product-work', label: 'Product work completed', checked: false, weight: 12 },
  { id: 'learning', label: 'Learning completed', checked: false, weight: 10 },
  { id: 'journal', label: 'Journal completed', checked: false, weight: 8 },
  { id: 'sleep', label: 'Sleep before midnight', checked: false, weight: 10 },
];

const DEFAULT_MILESTONES = [
  { id: 'login', label: 'Login System', completed: false },
  { id: 'dashboard', label: 'Dashboard', completed: false },
  { id: 'employee', label: 'Employee Management', completed: false },
  { id: 'attendance', label: 'Attendance Module', completed: false },
  { id: 'payroll', label: 'Payroll Module', completed: false },
  { id: 'deployment', label: 'Deployment', completed: false },
];

function makeDailyEntry(date: string): DailyEntry {
  return {
    date,
    checklist: DEFAULT_CHECKLIST.map(i => ({ ...i, checked: false })),
    score: 0,
    mood: null,
    moodNote: '',
    familyCall: false,
    wentOutside: false,
    talkedToSomeone: false,
  };
}

function makeHabitEntry(date: string): HabitEntry {
  return { date, morningWalk: false, gym: false, productBuilding: false, learning: false, sleepBeforeMidnight: false, noPorn: false, noMindlessScrolling: false };
}

const DEFAULT_DATA: AppData = {
  startDate: today(),
  dailyEntries: {},
  habitEntries: {},
  bodyMeasurements: [],
  careerEntries: [],
  financeEntries: [],
  productMilestones: DEFAULT_MILESTONES,
  unlockedAchievements: [],
  darkMode: true,
};

interface AppStore extends AppData {
  isLoaded: boolean;
  initializeFromDB: () => Promise<void>;
  toggleChecklistItem: (date: string, itemId: string) => void;
  setMood: (date: string, mood: MoodType, note: string) => void;
  updateLoneliness: (date: string, field: 'familyCall' | 'wentOutside' | 'talkedToSomeone', value: boolean) => void;
  toggleHabit: (date: string, habit: keyof Omit<HabitEntry, 'date'>, value: boolean) => void;
  addBodyMeasurement: (m: Omit<import('./types').BodyMeasurement, 'date'>) => void;
  updateCareerEntry: (date: string, updates: Partial<Omit<import('./types').CareerEntry, 'date'>>) => void;
  updateFinanceEntry: (month: string, updates: Partial<Omit<import('./types').FinanceEntry, 'month'>>) => void;
  toggleMilestone: (id: string) => void;
  unlockAchievement: (id: string) => void;
  setDarkMode: (v: boolean) => void;
  exportData: () => string;
  importData: (json: string) => void;
  resetData: () => void;
}

function persist(state: AppData) {
  const d: AppData = { startDate: state.startDate, dailyEntries: state.dailyEntries, habitEntries: state.habitEntries, bodyMeasurements: state.bodyMeasurements, careerEntries: state.careerEntries, financeEntries: state.financeEntries, productMilestones: state.productMilestones, unlockedAchievements: state.unlockedAchievements, darkMode: state.darkMode };
  saveData(d);
}

export const useAppStore = create<AppStore>((set, get) => ({
  ...DEFAULT_DATA,
  isLoaded: false,

  initializeFromDB: async () => {
    const data = await loadData();
    if (data) {
      set({ ...DEFAULT_DATA, ...data, productMilestones: data.productMilestones?.length ? data.productMilestones : DEFAULT_MILESTONES, isLoaded: true });
    } else {
      set({ isLoaded: true });
    }
  },

  toggleChecklistItem: (date, itemId) => set(state => {
    const entry = state.dailyEntries[date] || makeDailyEntry(date);
    const checklist = entry.checklist.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i);
    const score = calculateScore(checklist);
    const updated = { ...entry, checklist, score };
    const habitEntry = state.habitEntries[date] || makeHabitEntry(date);
    const updatedHabit = { ...habitEntry };
    const find = (id: string) => checklist.find(i => i.id === id)?.checked || false;
    updatedHabit.morningWalk = find('morning-walk');
    updatedHabit.gym = find('gym');
    updatedHabit.productBuilding = find('product-work');
    updatedHabit.learning = find('learning');
    updatedHabit.sleepBeforeMidnight = find('sleep');
    const newState = { dailyEntries: { ...state.dailyEntries, [date]: updated }, habitEntries: { ...state.habitEntries, [date]: updatedHabit } };
    persist({ ...state, ...newState });
    return newState;
  }),

  setMood: (date, mood, note) => set(state => {
    const entry = state.dailyEntries[date] || makeDailyEntry(date);
    const newState = { dailyEntries: { ...state.dailyEntries, [date]: { ...entry, mood, moodNote: note } } };
    persist({ ...state, ...newState });
    return newState;
  }),

  updateLoneliness: (date, field, value) => set(state => {
    const entry = state.dailyEntries[date] || makeDailyEntry(date);
    const newState = { dailyEntries: { ...state.dailyEntries, [date]: { ...entry, [field]: value } } };
    persist({ ...state, ...newState });
    return newState;
  }),

  toggleHabit: (date, habit, value) => set(state => {
    const entry = state.habitEntries[date] || makeHabitEntry(date);
    const newState = { habitEntries: { ...state.habitEntries, [date]: { ...entry, [habit]: value } } };
    persist({ ...state, ...newState });
    return newState;
  }),

  addBodyMeasurement: (m) => set(state => {
    const measurement = { ...m, date: today() };
    const idx = state.bodyMeasurements.findIndex(b => b.date === today());
    const bodyMeasurements = idx >= 0 ? state.bodyMeasurements.map((b, i) => i === idx ? measurement : b) : [...state.bodyMeasurements, measurement];
    const newState = { bodyMeasurements };
    persist({ ...state, ...newState });
    return newState;
  }),

  updateCareerEntry: (date, updates) => set(state => {
    const existing = state.careerEntries.find(e => e.date === date);
    const updated = existing ? { ...existing, ...updates } : { date, hoursLearned: 0, hoursProductBuilt: 0, jobsApplied: 0, interviewsGiven: 0, ...updates };
    const careerEntries = existing ? state.careerEntries.map(e => e.date === date ? updated : e) : [...state.careerEntries, updated];
    const newState = { careerEntries };
    persist({ ...state, ...newState });
    return newState;
  }),

  updateFinanceEntry: (month, updates) => set(state => {
    const existing = state.financeEntries.find(e => e.month === month);
    const updated = existing ? { ...existing, ...updates } : { month, pgRent: 0, food: 0, transport: 0, savings: 0, otherExpenses: 0, ...updates };
    const financeEntries = existing ? state.financeEntries.map(e => e.month === month ? updated : e) : [...state.financeEntries, updated];
    const newState = { financeEntries };
    persist({ ...state, ...newState });
    return newState;
  }),

  toggleMilestone: (id) => set(state => {
    const productMilestones = state.productMilestones.map(m => m.id === id ? { ...m, completed: !m.completed, completedDate: !m.completed ? today() : undefined } : m);
    const newState = { productMilestones };
    persist({ ...state, ...newState });
    return newState;
  }),

  unlockAchievement: (id) => set(state => {
    if (state.unlockedAchievements.includes(id)) return state;
    const unlockedAchievements = [...state.unlockedAchievements, id];
    const newState = { unlockedAchievements };
    persist({ ...state, ...newState });
    return newState;
  }),

  setDarkMode: (v) => set(state => {
    const newState = { darkMode: v };
    persist({ ...state, ...newState });
    return newState;
  }),

  exportData: () => {
    const s = get();
    return JSON.stringify({ startDate: s.startDate, dailyEntries: s.dailyEntries, habitEntries: s.habitEntries, bodyMeasurements: s.bodyMeasurements, careerEntries: s.careerEntries, financeEntries: s.financeEntries, productMilestones: s.productMilestones, unlockedAchievements: s.unlockedAchievements, darkMode: s.darkMode }, null, 2);
  },

  importData: (json) => {
    try {
      const data = JSON.parse(json) as AppData;
      set({ ...data, isLoaded: true });
      saveData(data);
    } catch { /* ignore */ }
  },

  resetData: () => {
    const d = { ...DEFAULT_DATA, startDate: today() };
    set({ ...d, isLoaded: true });
    saveData(d);
  },
}));
