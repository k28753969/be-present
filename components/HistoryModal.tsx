
import React, { useState } from 'react';
import { MemoRecord } from '../types';

interface Props {
  history: MemoRecord[];
  onClose: () => void;
}

const HistoryModal: React.FC<Props> = ({ history, onClose }) => {
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  const handleRecordClick = (id: string) => {
    if (removedIds.has(id)) return;
    setRemovedIds(prev => new Set(prev).add(id));
    
    // 시각적으로 사라지는 애니메이션(1초) 후 실제 데이터 처리가 필요하다면 
    // 여기서 setTimeout을 사용해 부모 상태를 업데이트할 수 있습니다.
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl transition-all duration-1000">
      <div className="glass-card w-full max-w-lg h-[80vh] rounded-[40px] flex flex-col overflow-hidden shadow-[0_0_100px_-20px_rgba(0,0,0,0.5)] border border-white/10">
        <div className="p-8 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
          <div>
            <h2 className="text-2xl font-light text-white/90">현존의 흔적들</h2>
            <p className="text-[10px] text-blue-300/30 tracking-[0.2em] uppercase mt-1">Traces of Presence</p>
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
        
        <div className="flex-1 overflow-y-auto p-6 space-y-0 custom-scrollbar">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-white/20 font-light space-y-2">
              <div className="w-12 h-12 rounded-full border border-white/5 mb-2 opacity-50"></div>
              <p>아직 기록된 순간이 없습니다.</p>
            </div>
          ) : (
            history.map((item) => (
              <div 
                key={item.id}
                className={`record-item-wrapper transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${removedIds.has(item.id) ? 'is-collapsed' : 'mb-6'}`}
              >
                <div 
                  onClick={() => handleRecordClick(item.id)}
                  className={`
                    group glass-card p-7 rounded-[2.5rem] space-y-4 cursor-pointer relative overflow-hidden
                    bg-white/[0.02] border-white/[0.03] hover:border-white/10 hover:bg-white/[0.04] transition-all duration-700
                    ${removedIds.has(item.id) ? 'animate-vanish' : 'fade-in'}
                  `}
                >
                  <div className="flex justify-between items-center text-[10px] text-blue-300/30 font-medium tracking-wider">
                    <span>{item.timestamp}</span>
                    <span className="px-3 py-1 rounded-full bg-white/[0.03] border border-white/5 group-hover:border-blue-400/20 group-hover:text-blue-300/50 transition-colors">
                      {item.emotion}
                    </span>
                  </div>
                  <p className="text-lg font-light leading-relaxed text-white/80 group-hover:text-white transition-colors">
                    {item.content}
                  </p>
                  <div className="flex items-center gap-2 pt-1 opacity-40 group-hover:opacity-60 transition-opacity">
                    <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                    <p className="text-[11px] text-blue-200/50 italic font-light">{item.thoughtType}에 대한 집착</p>
                  </div>

                  <div className="absolute right-6 bottom-6 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <span className="text-[9px] text-white/20 tracking-widest uppercase">Tap to let go</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-8 bg-white/[0.01] text-center border-t border-white/5">
          <p className="text-[11px] text-white/25 font-light leading-relaxed">
            붙잡고 있던 생각을 터치하여<br />
            광활한 우주로 기꺼이 놓아주세요.
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

        .record-item-wrapper {
          max-height: 500px;
          opacity: 1;
          overflow: visible;
        }

        .record-item-wrapper.is-collapsed {
          max-height: 0;
          margin-bottom: 0 !important;
          opacity: 0;
          pointer-events: none;
          overflow: hidden;
          transform: scale(0.95);
        }
      `}</style>
    </div>
  );
};

export default HistoryModal;
