
import React, { useState, useEffect } from 'react';
import { Step, BeforeInstallPromptEvent } from './types';
import MemoPage from './components/MemoPage';
import QuestionPage from './components/QuestionPage';
import EndingPage from './components/EndingPage';
import IntroPage from './components/IntroPage';
import { usePresence } from './hooks/usePresence';
import { STORAGE_KEYS } from './services/presenceService';

const REENTRY_LIMIT_MS = 5 * 60 * 1000; // 5분

const App: React.FC = () => {
  const {
    currentStep,
    setCurrentStep,
    history,
    accumulatedScore,
    accumulatedCount,
    emotionStats,
    sessionData,
    handleMemoComplete,
    handleQuestionsComplete,
    deleteFromHistory,
    resetAllData,
    resetSession
  } = usePresence();

  const [isExited, setIsExited] = useState(false);
  const [isRestricted, setIsRestricted] = useState(false);
  const [countdown, setCountdown] = useState(3);
  
  // PWA 및 iOS 설치 관련 상태
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showIosInstallGuide, setShowIosInstallGuide] = useState(false);

  // 인트로 자동 전환
  useEffect(() => {
    if (currentStep === Step.INTRO) {
      const timer = setTimeout(() => {
        setCurrentStep(Step.MEMO);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, setCurrentStep]);

  // PWA 설치 및 Service Worker 등록 로직
  useEffect(() => {
    // 독립형 모드 및 기기 환경 체크
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
                      || (window.navigator as any).standalone 
                      || document.referrer.includes('android-app://');
    
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        // public 폴더의 sw.js는 루트 /sw.js로 서빙됨을 가정합니다.
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          })
          .catch((err) => {
            console.error('ServiceWorker registration failed: ', err);
          });
      });
    }

    // Android/Chrome용 beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      if (isStandalone) return;
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowInstallBanner(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // iOS Safari 사용자 안내 (Standalone이 아닐 때만)
    if (isIos && isSafari && !isStandalone) {
      setTimeout(() => setShowIosInstallGuide(true), 4000);
    }

    // 설치 완료 이벤트 감지
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    setShowInstallBanner(false);
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response: ${outcome}`);
    setDeferredPrompt(null);
  };

  const closeInstallBanner = () => setShowInstallBanner(false);
  const closeIosGuide = () => setShowIosInstallGuide(false);

  // 재진입 제한 로직
  useEffect(() => {
    const lastExit = localStorage.getItem(STORAGE_KEYS.LAST_EXIT);
    if (lastExit) {
      const lastExitTime = parseInt(lastExit, 10);
      const now = Date.now();
      if (now - lastExitTime < REENTRY_LIMIT_MS) {
        setIsRestricted(true);
      }
    }
  }, []);

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

  const handleExit = () => {
    localStorage.setItem(STORAGE_KEYS.LAST_EXIT, Date.now().toString());
    setIsExited(true);
    setTimeout(() => {
      window.close();
    }, 3600);
  };

  if (isRestricted) {
    return (
      <div className="animated-bg min-h-screen w-full flex flex-col items-center justify-center p-6 text-white text-center overflow-y-auto">
        <div className="glass-card p-12 rounded-[3rem] space-y-8 max-w-sm border-white/20 shadow-2xl fade-in my-8">
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
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-center p-6 z-[100] fade-in overflow-y-auto">
        <div className="space-y-6">
          <div className="w-1 h-20 bg-gradient-to-b from-blue-500/0 via-blue-500/100 to-blue-500/0 mx-auto animate-pulse"></div>
          <p className="text-xl font-light text-blue-100/80 tracking-widest leading-relaxed">
            현존의 빛이 <br />당신의 일상에 늘 함께하기를...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animated-bg min-h-screen w-full flex flex-col items-center p-4 text-white relative overflow-y-auto overflow-x-hidden scroll-smooth">
      
      {/* PWA Floating Install Banner (Android/Chrome) */}
      {showInstallBanner && (
        <div className="fixed bottom-8 left-4 right-4 z-[100] animate-stagger-slow">
          <div className="glass-card p-5 rounded-[2rem] border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shrink-0">
                <span className="text-white font-bold text-xs">現</span>
              </div>
              <div className="overflow-hidden">
                <h4 className="text-sm font-semibold text-white truncate">현존하세요 설치</h4>
                <p className="text-[10px] text-white/50 truncate">더 빠르고 편리하게 현존을 경험하세요</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={closeInstallBanner} className="px-3 py-2 text-[10px] font-light text-white/30">닫기</button>
              <button onClick={handleInstallClick} className="bg-white text-slate-900 px-5 py-2.5 rounded-full text-xs font-semibold shadow-lg active:scale-95 transition-all">설치</button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Safari Install Guide Overlay */}
      {showIosInstallGuide && (
        <div className="fixed bottom-8 left-4 right-4 z-[100] animate-stagger-slow">
          <div className="glass-card p-6 rounded-[2.5rem] border-white/20 shadow-2xl relative">
            <button onClick={closeIosGuide} className="absolute top-4 right-4 text-white/20">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2}/></svg>
            </button>
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-2 border border-indigo-500/30">
                <svg className="w-6 h-6 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <p className="text-sm font-light text-blue-50 leading-relaxed">
                Safari 하단의 <span className="font-semibold text-white">공유 버튼</span>을 누른 후<br />
                <span className="font-semibold text-white">[홈 화면에 추가]</span>를 눌러주세요.
              </p>
              <div className="pt-2">
                <div className="w-1 h-4 bg-gradient-to-b from-indigo-500/50 to-transparent mx-auto animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md w-full z-10 py-4 flex flex-col flex-1">
        <div key={currentStep} className="fade-in flex-1 flex flex-col">
          {currentStep === Step.INTRO && <IntroPage />}
          {currentStep === Step.MEMO && <MemoPage onComplete={handleMemoComplete} />}
          {currentStep === Step.QUESTIONS && <QuestionPage onComplete={handleQuestionsComplete} />}
          {currentStep === Step.ENDING && (
            <EndingPage 
              history={history} 
              onReset={resetAllData} 
              onExit={handleExit}
              onDeleteRecord={deleteFromHistory}
              totalScore={accumulatedScore}
              totalCount={accumulatedCount}
              emotionStats={emotionStats}
              lastEmotion={sessionData.emotion || '알 수 없음'}
            />
          )}
        </div>
        {currentStep !== Step.INTRO && (
          <footer className="mt-8 mb-4 text-white/10 text-[9px] tracking-[0.4em] font-light uppercase text-center w-full">
            Presence Consciousness Activation
          </footer>
        )}
      </div>

      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[10%] left-[10%] w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-[10%] right-[10%] w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]"></div>
      </div>
    </div>
  );
};

export default App;
