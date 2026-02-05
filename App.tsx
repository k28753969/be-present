
import React, { useState, useEffect } from 'react';
import { Step, MemoRecord } from './types';
import MemoPage from './components/MemoPage';
import QuestionPage from './components/QuestionPage';
import EndingPage from './components/EndingPage';
import { EMOTION_SCORES } from './constants';

const REENTRY_LIMIT_MS = 5 * 60 * 1000; // 5분

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.MEMO);
  const [currentMemo, setCurrentMemo] = useState<string>('');
  const [history, setHistory] = useState<MemoRecord[]>([]);
  const [accumulatedScore, setAccumulatedScore] = useState<number>(0);
  const [accumulatedCount, setAccumulatedCount] = useState<number>(0);
  const [emotionStats, setEmotionStats] = useState<Record<string, number>>({});
  
  const [isExited, setIsExited] = useState(false);
  const [isRestricted, setIsRestricted] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [sessionData, setSessionData] = useState<{
    thoughtType?: string;
    emotion?: string;
    weight?: number;
  }>({});

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  // Service Worker Registration and PWA Install Handling
  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
          console.log('SW registered: ', registration);
        }).catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
      });
    }

    // Capture Install Prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBtn(false);
  };

  // 초기 로드 시 데이터 복원 및 제한 체크
  useEffect(() => {
    const lastExit = localStorage.getItem('presence_last_exit');
    if (lastExit) {
      const lastExitTime = parseInt(lastExit, 10);
      const now = Date.now();
      if (now - lastExitTime < REENTRY_LIMIT_MS) {
        setIsRestricted(true);
      }
    }

    const savedHistory = localStorage.getItem('presence_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }

    const savedScore = localStorage.getItem('presence_acc_score');
    if (savedScore) setAccumulatedScore(parseInt(savedScore, 10));

    const savedCount = localStorage.getItem('presence_acc_count');
    if (savedCount) setAccumulatedCount(parseInt(savedCount, 10));

    const savedStats = localStorage.getItem('presence_emotion_stats');
    if (savedStats) {
      try {
        setEmotionStats(JSON.parse(savedStats));
      } catch (e) {
        console.error("Failed to load stats", e);
      }
    }
  }, []);

  // 제한 화면에서의 카운트다운 로직
  useEffect(() => {
    let timer: number;
    if (isRestricted && countdown > 0) {
      timer = window.setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isRestricted && countdown === 0) {
      window.close();
      setIsExited(true);
    }
    return () => clearInterval(timer);
  }, [isRestricted, countdown]);

  const saveToHistory = (memo: string, thoughtType: string, emotion: string, weight: number = 1.0) => {
    const newRecord: MemoRecord = {
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      content: memo,
      thoughtType,
      emotion
    };

    const updatedHistory = [newRecord, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('presence_history', JSON.stringify(updatedHistory));

    const basePoints = EMOTION_SCORES[emotion] || 0;
    const points = Math.round(basePoints * weight);
    const newScore = accumulatedScore + points;
    const newCount = accumulatedCount + 1;
    const newStats = { ...emotionStats, [emotion]: (emotionStats[emotion] || 0) + 1 };
    
    setAccumulatedScore(newScore);
    setAccumulatedCount(newCount);
    setEmotionStats(newStats);
    
    localStorage.setItem('presence_acc_score', newScore.toString());
    localStorage.setItem('presence_acc_count', newCount.toString());
    localStorage.setItem('presence_emotion_stats', JSON.stringify(newStats));
  };

  const deleteFromHistory = (id: string) => {
    setHistory(prevHistory => {
      const updated = prevHistory.filter(item => item.id !== id);
      localStorage.setItem('presence_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleMemoComplete = (text: string) => {
    setCurrentMemo(text);
    setCurrentStep(Step.QUESTIONS);
  };

  const handleQuestionsComplete = (thoughtType: string, emotion: string, weight: number) => {
    setSessionData({ thoughtType, emotion, weight });
    saveToHistory(currentMemo, thoughtType, emotion, weight);
    setCurrentStep(Step.ENDING);
  };

  const handleReset = () => {
    setCurrentStep(Step.MEMO);
    setCurrentMemo('');
    setSessionData({});
  };

  const handleExit = () => {
    localStorage.setItem('presence_last_exit', Date.now().toString());
    setIsExited(true);
    setTimeout(() => {
      window.close();
    }, 3600);
  };

  if (isRestricted) {
    return (
      <div className="animated-bg min-h-screen w-full flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="glass-card p-12 rounded-[3rem] space-y-8 max-w-sm border-white/20 shadow-2xl fade-in">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
            <svg className="w-8 h-8 text-red-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="space-y-4">
            <p className="text-xl font-light leading-relaxed text-blue-100">
              반복 사용을 금지하기 위해<br />
              <span className="text-white font-normal">5분이 지난 후</span> 실행이 됩니다.
            </p>
            <p className="text-sm text-white/30 font-light">
              잠시 후 자동으로 앱이 종료됩니다... ({countdown})
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isExited) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-center p-6 z-[100] fade-in">
        <div className="space-y-6">
          <div className="w-1 h-20 bg-gradient-to-b from-blue-500/0 via-blue-500/100 to-blue-500/0 mx-auto animate-pulse"></div>
          <p className="text-xl font-light text-blue-100/80 tracking-widest leading-relaxed">
            현존의 빛이 <br />당신의 일상에 늘 함께하기를.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animated-bg min-h-screen w-full flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
      {/* PWA Install Button Overlay */}
      {showInstallBtn && (
        <button
          onClick={handleInstallClick}
          className="absolute top-8 right-8 z-50 px-4 py-2 bg-white/10 border border-white/20 backdrop-blur-md rounded-full text-xs font-light tracking-widest text-white/80 hover:bg-white/20 transition-all active:scale-95 shadow-lg"
        >
          Install App
        </button>
      )}

      <div className="max-w-md w-full z-10 py-12">
        <div key={currentStep} className="fade-in">
          {currentStep === Step.MEMO && (
            <MemoPage onComplete={handleMemoComplete} />
          )}
          {currentStep === Step.QUESTIONS && (
            <QuestionPage onComplete={handleQuestionsComplete} />
          )}
          {currentStep === Step.ENDING && (
            <EndingPage 
              history={history} 
              onReset={handleReset} 
              onExit={handleExit}
              onDeleteRecord={deleteFromHistory}
              totalScore={accumulatedScore}
              totalCount={accumulatedCount}
              emotionStats={emotionStats}
              lastEmotion={sessionData.emotion || '알 수 없음'}
            />
          )}
        </div>
      </div>

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-[10%] right-[10%] w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]"></div>
      </div>
      
      <footer className="absolute bottom-8 text-white/20 text-xs tracking-widest font-light uppercase">
        Presence Consciousness Activation
      </footer>
    </div>
  );
};

export default App;
