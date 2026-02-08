
import React, { useState } from 'react';
import { QUESTIONS } from '../constants';

interface Props {
  onComplete: (thoughtType: string, emotion: string, weight: number) => void;
}

const QuestionPage: React.FC<Props> = ({ onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});

  const currentQuestion = QUESTIONS[currentIdx];

  const handleSelect = (value: string, nextAction: 'next' | 'end') => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    if (nextAction === 'end' || currentIdx === QUESTIONS.length - 1) {
      // Q0 답변에서 가중치를 가져옴
      const weight = parseFloat(newAnswers['Q0'] || '1.0');
      // Q1 답변에서 생각의 종류를 가져옴
      const thoughtType = newAnswers['Q1'] || '알아차림';
      // 마지막 선택값이 'none'이면 '상위의식'으로, 아니면 선택된 감정값 사용
      const emotion = value === 'none' ? '상위의식' : value;
      onComplete(thoughtType, emotion, weight);
    } else {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const progress = ((currentIdx + 1) / QUESTIONS.length) * 100;

  return (
    <div className="space-y-12 text-center max-w-sm mx-auto">
      {/* Progress & Header Section */}
      <div className="space-y-8">
        <div className="w-full h-[2px] bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-400/40 transition-all duration-1000 ease-in-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div key={`header-${currentIdx}`} className="space-y-3 animate-stagger-slow" style={{ animationDelay: '0.1s' }}>
          <p className="text-[10px] uppercase tracking-[0.5em] text-blue-300/40 font-medium">Step {currentIdx + 1}</p>
          <h2 className="text-2xl font-light leading-snug text-white/90">
            {currentQuestion.text}
          </h2>
          {currentIdx === 1 && (
            <p className="text-base font-light text-blue-100/30 pt-1 animate-stagger-slow" style={{ animationDelay: '0.3s' }}>
              그 생각의 방향을 알아차려 볼까요?
            </p>
          )}
        </div>
      </div>

      {/* Options Grid with Slower Staggered Animation */}
      <div key={`options-${currentIdx}`} className="grid grid-cols-1 gap-4">
        {currentQuestion.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(option.value, option.nextAction)}
            className="group glass-card py-6 px-8 rounded-[2rem] text-left font-light text-lg hover:bg-white/[0.08] hover:border-white/20 transition-all duration-700 active:scale-[0.99] border-white/5 animate-stagger-slow shadow-xl shadow-black/20"
            style={{ animationDelay: `${0.5 + idx * 0.15}s` }}
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-blue-50/70 group-hover:text-white transition-colors tracking-tight leading-snug">{option.label}</span>
              <div className="shrink-0 w-5 h-5 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white/90 group-hover:border-white transition-all duration-700">
                <div className="w-1 h-1 rounded-full bg-white group-hover:bg-indigo-950 opacity-30 group-hover:opacity-100"></div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {currentIdx > 0 && (
        <button 
          onClick={() => setCurrentIdx(currentIdx - 1)}
          className="text-white/20 text-xs font-light hover:text-white/40 tracking-widest transition-colors pt-6 animate-stagger-slow uppercase"
          style={{ animationDelay: '1.2s' }}
        >
          Go Back
        </button>
      )}
    </div>
  );
};

export default QuestionPage;
