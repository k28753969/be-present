
import React, { useState, useEffect } from 'react';

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // IOS 여부 확인
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // 이미 설치되었는지 확인
    const isStandalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;

    // Chrome/Android 설치 이벤트 리스너
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isStandalone) setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // iOS의 경우 standalone이 아니면 설치 안내 표시
    if (ios && !isStandalone) {
      const hasShown = sessionStorage.getItem('pwa_prompt_shown');
      if (!hasShown) {
        setIsVisible(true);
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  const closePrompt = () => {
    setIsVisible(false);
    sessionStorage.setItem('pwa_prompt_shown', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 z-[100] animate-stagger-slow">
      <div className="glass-card p-5 rounded-[2rem] flex items-center justify-between gap-4 shadow-2xl border-white/20 bg-slate-900/40 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
            <img src="favicon.png" alt="App Icon" className="w-8 h-8 rounded-lg" onError={(e) => {
              (e.target as any).src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik05IDIxdjFhMSAxIDAgMCAxLTEgMUg3YTEgMSAwIDAgMS0xLTF2LTFhMiAyIDAgMCAwLTItMkgzYTEgMSAwIDAgMS0xLTF2LTJhMiAyIDAgMCAwLTItMmgtMS0yLTJNMTAsM2g0YTYsNiAwIDAgMSw2LDZ2NWE2LDYgMCAwIDEsLTYsNmgtNGE2LDYgMCAwIDEsLTYtNnYtNWE2LDYgMCAwIDEsNi02eiIvPjwvc3ZnPg==";
            }} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-white">현존하세요 설치</h3>
            <p className="text-[11px] text-white/50 leading-tight">
              {isIOS ? "공유 메뉴에서 '홈 화면에 추가'를 선택하세요" : "앱으로 설치하여 더 편하게 관리하세요"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!isIOS && (
            <button 
              onClick={handleInstall}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-full transition-colors"
            >
              설치
            </button>
          )}
          <button 
            onClick={closePrompt}
            className="p-2 text-white/30 hover:text-white/60 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
