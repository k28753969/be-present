
import React, { useState, useEffect } from 'react';

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');

  useEffect(() => {
    // Detect Platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;

    if (isIos) {
      setPlatform('ios');
      // Show iOS prompt if not standalone after 3 seconds
      if (!isStandalone) {
        const timer = setTimeout(() => setIsVisible(true), 3000);
        return () => clearTimeout(timer);
      }
    } else {
      setPlatform('android');
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        // Show after 2 seconds
        setTimeout(() => setIsVisible(true), 2000);
      };

      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-10 left-6 right-6 z-[200] animate-bounce-in">
      <div className="glass-card p-6 rounded-[2rem] border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden shadow-lg border border-white/10">
            <img src="favicon.png" alt="App Icon" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg">현존하세요 설치</h3>
            <p className="text-white/60 text-sm leading-relaxed">
              {platform === 'ios' 
                ? '브라우저 하단의 [공유] 버튼을 누르고 [홈 화면에 추가]를 선택해주세요.' 
                : '홈 화면에 추가하여 더 빠르고 편하게 현존의식을 깨워보세요.'}
            </p>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-white/30 p-1 hover:text-white/60 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {platform !== 'ios' && (
          <button
            onClick={handleInstallClick}
            className="w-full bg-white text-slate-900 py-3 rounded-xl font-medium shadow-xl active:scale-95 transition-all"
          >
            앱 설치하기
          </button>
        )}
      </div>
    </div>
  );
};

export default InstallPrompt;
