
import React, { useState } from 'react';
import { GUIDE_MESSAGES } from '../constants';

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
      <div className="w-full max-w-lg h-[80vh] flex flex-col items-center justify-between text-center relative py-12 px-6">
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
          <div className={`transition-all duration-300 transform ${isAnimating ? 'opacity-0 translate-y-4 blur-lg' : 'opacity-100 translate-y-0 blur-0'}`}>
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
