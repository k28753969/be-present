
import React, { useState, useEffect } from 'react';
import { Step, MemoRecord } from './types';
import MemoPage from './components/MemoPage';
import QuestionPage from './components/QuestionPage';
import EndingPage from './components/EndingPage';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.MEMO);
  const [currentMemo, setCurrentMemo] = useState<string>('');
  const [history, setHistory] = useState<MemoRecord[]>([]);
  const [sessionData, setSessionData] = useState<{
    thoughtType?: string;
    emotion?: string;
  }>({});

  useEffect(() => {
    const saved = localStorage.getItem('presence_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const saveToHistory = (memo: string, thoughtType: string, emotion: string) => {
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
  };

  const handleMemoComplete = (text: string) => {
    setCurrentMemo(text);
    setCurrentStep(Step.QUESTIONS);
  };

  const handleQuestionsComplete = (thoughtType: string, emotion: string) => {
    setSessionData({ thoughtType, emotion });
    saveToHistory(currentMemo, thoughtType, emotion);
    setCurrentStep(Step.ENDING);
  };

  const handleReset = () => {
    setCurrentStep(Step.MEMO);
    setCurrentMemo('');
    setSessionData({});
  };

  return (
    <div className="animated-bg min-h-screen w-full flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
      <div className="max-w-md w-full z-10 py-12">
        {/* Step-based conditional rendering with fade-in effect */}
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
              lastEmotion={sessionData.emotion || '알 수 없음'}
            />
          )}
        </div>
      </div>

      {/* Background Decorative Accents */}
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
