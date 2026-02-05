
import React, { useState, useEffect } from 'react';
import { Step, MemoRecord } from './types';
import MemoPage from './components/MemoPage';
import QuestionPage from './components/QuestionPage';
import EndingPage from './components/EndingPage';
import InstallPrompt from './components/InstallPrompt';
import { EMOTION_SCORES } from './constants';

const REENTRY_LIMIT_MS = 5 * 60 * 1000;

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.MEMO);
  const [currentMemo, setCurrentMemo] = useState('');
  const [history, setHistory] = useState<MemoRecord[]>([]);
  const [stats, setStats] = useState({ score: 0, count: 0, emotions: {} as Record<string, number> });
  const [isExited, setIsExited] = useState(false);
  const [isRestricted, setIsRestricted] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Check Restriction
    const lastExit = localStorage.getItem('presence_last_exit');
    if (lastExit && Date.now() - parseInt(lastExit, 10) < REENTRY_LIMIT_MS) {
      setIsRestricted(true);
    }

    // Load Data
    const savedHistory = localStorage.getItem('presence_history');
    const savedScore = localStorage.getItem('presence_acc_score');
    const savedCount = localStorage.getItem('presence_acc_count');
    const savedStats = localStorage.getItem('presence_emotion_stats');

    if (savedHistory) setHistory(JSON.parse(savedHistory));
    setStats({
      score: savedScore ? parseInt(savedScore, 10) : 0,
      count: savedCount ? parseInt(savedCount, 10) : 0,
      emotions: savedStats ? JSON.parse(savedStats) : {}
    });
  }, []);

  useEffect(() => {
    if (isRestricted && countdown > 0) {
      const timer = window.setInterval(() => setCountdown(c => c - 1), 1000);
      return () => clearInterval(timer);
    } else if (isRestricted && countdown === 0) {
      window.close();
      setIsExited(true);
    }
  }, [isRestricted, countdown]);

  const handleQuestionsComplete = (thoughtType: string, emotion: string, weight: number) => {
    const newRecord: MemoRecord = {
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleString('ko-KR', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      }),
      content: currentMemo,
      thoughtType,
      emotion
    };

    const updatedHistory = [newRecord, ...history];
    const points = Math.round((EMOTION_SCORES[emotion] || 0) * weight);
    const updatedStats = {
      score: stats.score + points,
      count: stats.count + 1,
      emotions: { ...stats.emotions, [emotion]: (stats.emotions[emotion] || 0) + 1 }
    };

    setHistory(updatedHistory);
    setStats(updatedStats);
    
    localStorage.setItem('presence_history', JSON.stringify(updatedHistory));
    localStorage.setItem('presence_acc_score', updatedStats.score.toString());
    localStorage.setItem('presence_acc_count', updatedStats.count.toString());
    localStorage.setItem('presence_emotion_stats', JSON.stringify(updatedStats.emotions));
    
    setCurrentStep(Step.ENDING);
  };

  const deleteFromHistory = (id: string) => {
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem('presence_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleExit = () => {
    localStorage.setItem('presence_last_exit', Date.now().toString());
    setIsExited(true);
    setTimeout(() => window.close(), 4500);
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
            <p className="text-xl font-light leading-relaxed text-blue-100">반복 사용을 금지하기 위해<br /><span className="text-white font-normal">5분이 지난 후</span> 실행이 됩니다.</p>
            <p className="text-sm text-white/30 font-light">잠시 후 자동으로 앱이 종료됩니다... ({countdown})</p>
          </div>
        </div>
      </div>
    );
  }

  if (isExited) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-center p-6 z-[100] fade-in">
        <div className="w-1 h-20 bg-gradient-to-b from-blue-500/0 via-blue-500/100 to-blue-500/0 mx-auto animate-pulse mb-6" />
        <p className="text-xl font-light text-blue-100/80 tracking-widest leading-relaxed">현존의 빛이 <br />당신의 일상에 늘 함께하기를.</p>
      </div>
    );
  }

  return (
    <div className="animated-bg min-h-screen w-full flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
      <div className="max-w-md w-full z-10 py-12">
        <div key={currentStep} className="fade-in">
          {currentStep === Step.MEMO && <MemoPage onComplete={(t) => { setCurrentMemo(t); setCurrentStep(Step.QUESTIONS); }} />}
          {currentStep === Step.QUESTIONS && <QuestionPage onComplete={handleQuestionsComplete} />}
          {currentStep === Step.ENDING && (
            <EndingPage 
              history={history} 
              onReset={() => { setCurrentStep(Step.MEMO); setCurrentMemo(''); }} 
              onExit={handleExit}
              onDeleteRecord={deleteFromHistory}
              totalScore={stats.score}
              totalCount={stats.count}
              emotionStats={stats.emotions}
            />
          )}
        </div>
      </div>
      <InstallPrompt />
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[10%] w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-[10%] right-[10%] w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]" />
      </div>
      <footer className="absolute bottom-8 text-white/20 text-xs tracking-widest font-light uppercase">Presence Consciousness Activation</footer>
    </div>
  );
};

export default App;
