import { useState, useEffect, useCallback } from 'react';
import { HistoryItem, Tone } from '../types/types';

const STORAGE_KEY = 'ai-content-history';
const MAX_HISTORY_ITEMS = 50;

export const useContentHistory = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse history:', error);
      }
    }
  }, []);

  const saveToHistory = useCallback((
    topic: string,
    tone: Tone,
    keywords: string,
    contentLength: number,
    generatedContent: string
  ) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      topic,
      tone,
      keywords,
      contentLength,
      generatedContent,
      timestamp: Date.now(),
    };

    setHistory((prev) => {
      const updated = [newItem, ...prev].slice(0, MAX_HISTORY_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteHistoryItem = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const exportHistory = useCallback(() => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `content-history-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [history]);

  return {
    history,
    saveToHistory,
    deleteHistoryItem,
    clearHistory,
    exportHistory,
  };
};
