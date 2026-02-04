
import React, { useState } from 'react';

interface Props {
  onComplete: (text: string) => void;
}

const MemoPage: React.FC<Props> = ({ onComplete }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onComplete(text);
    }
  };

  return (
    <div className="space-y-12 text-center">
      <div className="space-y-4">
        <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs tracking-[0.2em] text-blue-200 mb-2 uppercase">
          Presence Activated
        </div>
        <h1 className="text-4xl font-light tracking-tight text-white">현존성공</h1>
        <p className="text-lg font-light text-blue-100/70 leading-relaxed">
          참 잘하셨어요.<br />
          당신은 방금 현존의식을 깨우셨습니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="glass-card rounded-[2.5rem] p-8 transition-all duration-700 focus-within:bg-white/[0.08] focus-within:shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)] border-white/10">
          <textarea
            autoFocus
            className="w-full bg-transparent border-none focus:ring-0 text-xl font-light text-white placeholder-white/20 resize-none min-h-[180px] leading-relaxed text-center"
            placeholder="여기를 클릭해서 지금 방금 알아차린 마음 속 생각을 간단히 적어보세요"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={!text.trim()}
            className={`
              group relative overflow-hidden px-12 py-4 rounded-full text-lg font-light tracking-widest transition-all duration-500
              ${text.trim() 
                ? 'bg-white text-slate-900 hover:scale-105 active:scale-95 shadow-2xl shadow-white/10' 
                : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'}
            `}
          >
            <span className="relative z-10 flex items-center gap-2">
              다음 단계로
              <svg className={`w-5 h-5 transition-transform duration-300 ${text.trim() ? 'group-hover:translate-x-1' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default MemoPage;
