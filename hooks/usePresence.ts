
import { useState, useEffect, useCallback } from 'react';
import { Step, MemoRecord, SessionData } from '../types';
import { calculatePoints, STORAGE_KEYS, formatTimestamp } from '../services/presenceService';

export const usePresence = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.INTRO);
  const [currentMemo, setCurrentMemo] = useState<string>('');
  const [history, setHistory] = useState<MemoRecord[]>([]);
  const [accumulatedScore, setAccumulatedScore] = useState<number>(0);
  const [accumulatedCount, setAccumulatedCount] = useState<number>(0);
  const [emotionStats, setEmotionStats] = useState<Record<string, number>>({});
  const [sessionData, setSessionData] = useState<SessionData>({});

  // 초기 로드
  useEffect(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }

    const savedScore = localStorage.getItem(STORAGE_KEYS.ACC_SCORE);
    if (savedScore) setAccumulatedScore(parseInt(savedScore, 10));

    const savedCount = localStorage.getItem(STORAGE_KEYS.ACC_COUNT);
    if (savedCount) setAccumulatedCount(parseInt(savedCount, 10));

    const savedStats = localStorage.getItem(STORAGE_KEYS.EMOTION_STATS);
    if (savedStats) {
      try {
        setEmotionStats(JSON.parse(savedStats));
      } catch (e) {
        console.error("Failed to load stats", e);
      }
    }
  }, []);

  const saveToHistory = useCallback((memo: string, thoughtType: string, emotion: string, weight: number = 1.0) => {
    const newRecord: MemoRecord = {
      id: crypto.randomUUID(),
      timestamp: formatTimestamp(new Date()),
      content: memo,
      thoughtType,
      emotion,
      weight,
      isDeleted: false
    };

    const updatedHistory = [newRecord, ...history];
    setHistory(updatedHistory);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updatedHistory));

    const points = calculatePoints(emotion, weight);
    const newScore = accumulatedScore + points; 
    const newCount = accumulatedCount + 1; 
    const newStats = { ...emotionStats, [emotion]: (emotionStats[emotion] || 0) + 1 };
    
    setAccumulatedScore(newScore);
    setAccumulatedCount(newCount);
    setEmotionStats(newStats);
    
    localStorage.setItem(STORAGE_KEYS.ACC_SCORE, newScore.toString());
    localStorage.setItem(STORAGE_KEYS.ACC_COUNT, newCount.toString());
    localStorage.setItem(STORAGE_KEYS.EMOTION_STATS, JSON.stringify(newStats));
  }, [history, accumulatedScore, accumulatedCount, emotionStats]);

  const deleteFromHistory = useCallback((id: string) => {
    setHistory(prevHistory => {
      const updated = prevHistory.map(item => 
        item.id === id ? { ...item, isDeleted: true } : item
      );
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetAllData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    localStorage.removeItem(STORAGE_KEYS.ACC_SCORE);
    localStorage.removeItem(STORAGE_KEYS.ACC_COUNT);
    localStorage.removeItem(STORAGE_KEYS.EMOTION_STATS);
    
    setHistory([]);
    setAccumulatedScore(0);
    setAccumulatedCount(0);
    setEmotionStats({});
    setCurrentStep(Step.MEMO);
    setCurrentMemo('');
    setSessionData({});
    window.scrollTo(0, 0);
  }, []);

  const handleMemoComplete = useCallback((text: string) => {
    setCurrentMemo(text);
    setCurrentStep(Step.QUESTIONS);
  }, []);

  const handleQuestionsComplete = useCallback((thoughtType: string, emotion: string, weight: number) => {
    setSessionData({ thoughtType, emotion, weight });
    saveToHistory(currentMemo, thoughtType, emotion, weight);
    setCurrentStep(Step.ENDING);
  }, [currentMemo, saveToHistory]);

  const resetSession = useCallback(() => {
    setCurrentStep(Step.MEMO);
    setCurrentMemo('');
    setSessionData({});
    window.scrollTo(0, 0);
  }, []);

  return {
    currentStep,
    setCurrentStep,
    currentMemo,
    history,
    accumulatedScore,
    accumulatedCount,
    emotionStats,
    sessionData,
    handleMemoComplete,
    handleQuestionsComplete,
    deleteFromHistory,
    resetAllData,
    resetSession,
    saveToHistory
  };
};
