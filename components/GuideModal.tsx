
import React, { useState } from 'react';

const GUIDE_MESSAGES = [
  "'현존하세요'에 오신 것을 진심으로 환영합니다. \n\n 이 어플 사용법은 정말 간단합니다.",
  "현재 올라온 마음속 생각을 그 즉시 기록하는 것이 전부입니다.",
  "'내가 지금 이런 생각을 하고 있었구나..' 하고 알아차리는 것이죠.",
  "중요한 건, 생각이 일어난 바로 그 순간 기록해야 한다는 겁니다.",
  "시간이 조금이라도 지난 후에 하면 효과가 많이 떨어져요.",
  "마치 현행범을 현장에서 체포하는 그런 느낌으로 해야 해요.",
  "맹금류가 사냥감을 순식간에 잡아채는 모습을 연상해도 좋아요.",
  "이런걸 왜 해야 하냐구요? \n\n 무슨 일기장 같은 거냐구요?",
  "아닙니다...",
  "이 어플은 실로 엄청난 힘을 가지고 있습니다.",
  "바로 현존의식의 힘이라는 것입니다.",
  "현존의식이란 '내가 현재 여기 존재함'을 그 순간 알아차리는 의식상태입니다.",
  "다시 말해, 현재 순간에 어떤 생각에 홀려 있었는지 명확히 인지하는 것입니다.",
  "나도 모르게 수시로 떠오르는 골치 아픈 생각들로 머리 속이 이리저리 복잡할 때, 이 어플을 즉시 실행하세요.",
  "이 어플에 생각을 기록하고 감정을 살펴보는 순간이 바로 현존의식이 발동한 순간이고, 그 즉시 당신을 괴롭히는 그 잡생각들이 서서히 힘을 잃고 사라져 갑니다.",
  "물론 얼마후 다시 찾아오겠죠. \n\n 그러면 똑같이 또 하면 됩니다. \n\n 아주 간단해요.",
  "이렇게 하다보면 결국은 당신의 현존의식이 이깁니다. \n\n 그 후론  안 찾아옵니다. 아니 못찾아옵니다.",
  "직접 체험해보면 참 신기하다고 느끼실겁니다. \n\n 나쁜 생각에 사로잡히지 않는 것이 이렇게 중요한 일일 줄이야...",
  "이러한 기질을 trait mindfulness 또는 dispositional mindfulness라고 합니다. \n\n 출처: Brown, K. W., & Ryan, R. M. 'The benefits of being present: Mindfulness and its role in psychological well-being.', Journal of Personality and Social Psychology, 2003.",
  "나를 해치는 무의미한 생각의 그 사라져감, 물러남을 남의 일 보듯이 여여한 시선으로 바라만 보세요.",
  "어때요? 어렵지 않겠죠?",
  "그런데 막상 하려고 하면 이게 생각만큼 쉽지가 않습니다.",
  "자 그럼, 백문이 불여일견, 우리 함께 도전해 볼까요?",
  "머리속이 복잡할 때마다 어플을 실행하세요. 목표는 Level 30에 도달하는 것이죠.",
  "자 그럼 출발~"
];

interface Props {
  onClose: () => void;
}

const GuideModal: React.FC<Props> = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNext = () => {
    if (step < GUIDE_MESSAGES.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setStep(step + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      onClose();
    }
  };

  const progress = ((step + 1) / GUIDE_MESSAGES.length) * 100;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-3xl fade-in">
      <div className="whitespace-pre-wrap w-full max-w-lg h-[80vh] flex flex-col items-center justify-between text-center relative py-12 px-6">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
          <div 
            className="h-full bg-blue-400 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="space-y-4">
          <p className="text-[10px] uppercase tracking-[0.5em] text-blue-400/50 font-medium">Guide Step {step + 1}</p>
        </div>

        <div className="flex-1 flex items-center justify-center py-10">
          <div 
            className={`transition-all duration-300 transform ${isAnimating ? 'opacity-0 translate-y-4 blur-lg' : 'opacity-100 translate-y-0 blur-0'}`}
          >
            <h2 className="text-xl md:text-2xl font-light leading-[1.7] text-white/90 break-keep px-4">
              {GUIDE_MESSAGES[step]}
            </h2>
          </div>
        </div>

        <div className="w-full space-y-8">
          <button
            onClick={handleNext}
            className="group relative overflow-hidden px-10 py-4 rounded-full text-base font-light tracking-widest transition-all duration-500 bg-white text-slate-900 hover:scale-105 active:scale-95 shadow-2xl shadow-blue-500/20"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              {step === GUIDE_MESSAGES.length - 1 ? '도전하기' : '다음'}
              {step < GUIDE_MESSAGES.length - 1 && (
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              )}
            </span>
          </button>
          
          <p className="text-[10px] text-white/20 uppercase tracking-[0.3em]">
            Step {step + 1} of {GUIDE_MESSAGES.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuideModal;
