import type { StateStorage } from 'zustand/middleware';

// In-memory fallback if localStorage is blocked or fails (e.g. QuotaExceededError or private browsing)
const memoryStore = new Map<string, string>();

/**
 * Bulletproof localStorage wrapper for Zustand persist and browser code.
 * - Safely handles SSR (window === 'undefined')
 * - Protects against SecurityError / blocked storage
 * - Protects against QuotaExceededError on setItem
 * - Handles corrupt or 'undefined' values on getItem without throwing SyntaxError
 */
export const safeLocalStorage: StateStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return memoryStore.get(key) ?? null;
      }
      const val = window.localStorage.getItem(key);
      if (val === null || val === 'undefined' || val === 'null') {
        return memoryStore.get(key) ?? null;
      }
      return val;
    } catch (err) {
      console.warn(`[SafeStorage] Failed to read "${key}" from localStorage:`, err);
      return memoryStore.get(key) ?? null;
    }
  },

  setItem: (key: string, value: string): void => {
    memoryStore.set(key, value);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (err) {
      console.warn(`[SafeStorage] Failed to write "${key}" to localStorage:`, err);
    }
  },

  removeItem: (key: string): void => {
    memoryStore.delete(key);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (err) {
      console.warn(`[SafeStorage] Failed to remove "${key}" from localStorage:`, err);
    }
  },
};
