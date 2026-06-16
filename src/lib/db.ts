import { openDB, IDBPDatabase } from 'idb';
import { AppData } from '@/store/types';

const DB_NAME = 'transformation-tracker';
const DB_VERSION = 1;
const STORE_NAME = 'app-data';
const DATA_KEY = 'main';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

export async function saveData(data: AppData): Promise<void> {
  try {
    const db = await getDB();
    await db.put(STORE_NAME, data, DATA_KEY);
  } catch {
    try {
      localStorage.setItem('transformation-tracker', JSON.stringify(data));
    } catch {
      // silent fail
    }
  }
}

export async function loadData(): Promise<AppData | null> {
  try {
    const db = await getDB();
    const data = await db.get(STORE_NAME, DATA_KEY);
    return data || null;
  } catch {
    try {
      const stored = localStorage.getItem('transformation-tracker');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
}
