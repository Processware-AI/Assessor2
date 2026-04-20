import { useState, useEffect } from "react";

const STORAGE_KEY = "aspice_history";
const MAX_ENTRIES = 50;

export function useHistory() {
  const [history, setHistory] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {}
  }, [history]);

  const addEntry = (entry) => {
    setHistory(prev => [entry, ...prev].slice(0, MAX_ENTRIES));
  };

  const removeEntry = (id) => {
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  const clearAll = () => setHistory([]);

  return { history, addEntry, removeEntry, clearAll };
}
