
import React from 'react';
import { EMOTION_SCORES } from '../constants';

interface Props {
  emotionStats: Record<string, number>;
  onClose: () => void;
  onReset: () => void;
}

const AnalysisModal: React.FC<Props> = ({ emotionStats, onClose, onReset }) => {
  // 점수가 높은 순(또는 EMOTION_SCORES 순서)으로 정렬하여 표시
  const allEmotions = Object.keys(EMOTION_SCORES);
  const data = allEmotions
    .map(emotion => ({
      name: emotion,
      count: emotionStats[emotion] || 0,
      score: EMOTION_SCORES[emotion]
    }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count);

  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl fade-in">
      <div className="glass-card w-full max-w-lg h-[85vh] rounded-[40px] flex flex-col overflow-hidden shadow-2xl border border-white/10">
        <div className="p-8 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
          <div>
            <h2 className="text-2xl font-light text-white/90">현존의식 분석</h2>
            <p className="text-[10px] text-blue-300/30 tracking-[0.2em] uppercase mt-1">Consciousness Analysis</p>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-white/5 transition-all active:scale-90 border border-white/5"
          >
            <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {data.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-white/20 font-light space-y-4">
              <div className="w-16 h-16 rounded-full border border-white/5 flex items-center justify-center opacity-30">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p>분석할 데이터가 부족합니다.</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="space-y-6">
                {data.map((item, idx) => (
                  <div key={item.name} className="space-y-2 group">
                    <div className="flex justify-between items-end text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-light">{item.name}</span>
                        <span className="text-[10px] text-white/20 uppercase tracking-tighter">score {item.score}</span>
                      </div>
                      <span className="text-blue-300 font-medium">{item.count}회</span>
                    </div>
                    <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500/40 to-indigo-400/60 transition-all duration-1000 ease-out"
                        style={{ 
                          width: `${(item.count / maxCount) * 100}%`,
                          transitionDelay: `${idx * 0.1}s`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="glass-card p-6 rounded-3xl border-white/5 bg-white/[0.01]">
                <h3 className="text-xs text-blue-300/40 uppercase tracking-widest mb-4 font-medium">주요 패턴 요약</h3>
                <p className="text-sm font-light leading-relaxed text-white/60">
                  당신은 지금까지 가장 자주 <span className="text-blue-200 font-normal">[{data[0].name}]</span>의 상태를 알아차렸습니다. 
                  메모를 비워내더라도 그 알아차림의 가치는 당신의 의식 데이터에 고스란히 남아있습니다.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-white/5 space-y-4">
          <button
            onClick={onClose}
            className="w-full bg-white text-slate-900 py-4 rounded-2xl text-md font-medium shadow-xl hover:scale-[1.02] transition-all active:scale-95"
          >
            돌아가기
          </button>
          <p className="text-[10px] text-white/20 text-center uppercase tracking-widest">
            Awareness is the beginning of freedom
          </p>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default AnalysisModal;
