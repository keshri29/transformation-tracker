export type MoodType = 'bad' | 'average' | 'good' | 'excellent';

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  weight: number;
}

export interface DailyEntry {
  date: string;
  checklist: ChecklistItem[];
  score: number;
  mood: MoodType | null;
  moodNote: string;
  familyCall: boolean;
  wentOutside: boolean;
  talkedToSomeone: boolean;
}

export interface HabitEntry {
  date: string;
  morningWalk: boolean;
  gym: boolean;
  productBuilding: boolean;
  learning: boolean;
  sleepBeforeMidnight: boolean;
  noPorn: boolean;
  noMindlessScrolling: boolean;
}

export interface BodyMeasurement {
  date: string;
  weight: number;
  waist: number;
  chest: number;
  arms: number;
}

export interface CareerEntry {
  date: string;
  hoursLearned: number;
  hoursProductBuilt: number;
  jobsApplied: number;
  interviewsGiven: number;
}

export interface FinanceEntry {
  month: string;
  pgRent: number;
  food: number;
  transport: number;
  savings: number;
  otherExpenses: number;
}

export interface ProductMilestone {
  id: string;
  label: string;
  completed: boolean;
  completedDate?: string;
}

export interface AppData {
  startDate: string;
  dailyEntries: Record<string, DailyEntry>;
  habitEntries: Record<string, HabitEntry>;
  bodyMeasurements: BodyMeasurement[];
  careerEntries: CareerEntry[];
  financeEntries: FinanceEntry[];
  productMilestones: ProductMilestone[];
  unlockedAchievements: string[];
  darkMode: boolean;
}
