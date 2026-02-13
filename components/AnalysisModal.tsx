
import React, { useMemo, useState, useEffect } from 'react';
import { EMOTION_SCORES } from '../constants';
import { MemoRecord } from '../types';
import { GoogleGenAI } from "@google/genai";

interface Props {
  emotionStats: Record<string, number>;
  history: MemoRecord[];
  onClose: () => void;
  onReset: () => void;
}

const PieChart: React.FC<{ data: { label: string; value: number; color: string }[]; title: string }> = ({ data, title }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  let cumulativePercent = 0;

  function getCoordinatesForPercent(percent: number) {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  }

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] mb-3 font-semibold">{title}</p>
      <div className="relative w-20 h-20">
        <svg viewBox="-1 -1 2 2" className="transform -rotate-90 drop-shadow-lg">
          {total === 0 ? (
            <circle cx="0" cy="0" r="1" fill="rgba(255,255,255,0.05)" />
          ) : (
            data.map((item, idx) => {
              if (item.value === 0) return null;
              const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
              cumulativePercent += item.value / total;
              const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
              const largeArcFlag = item.value / total > 0.5 ? 1 : 0;
              const pathData = `M ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`;
              return <path key={idx} d={pathData} fill={item.color} className="transition-all duration-1000" />;
            })
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-[#020617] rounded-full flex flex-col items-center justify-center border border-white/5 shadow-inner">
                <span className="text-[8px] text-white/40 font-mono leading-none">{total}</span>
                <span className="text-[5px] text-white/10 uppercase mt-0.5">Total</span>
            </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
            <span className="text-[7px] text-white/30 truncate max-w-[40px]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AnalysisModal: React.FC<Props> = ({ emotionStats, history, onClose, onReset }) => {
  const [advice, setAdvice] = useState<string>('데이터를 통해 당신의 무의식을 분석하고 있습니다...');
  const [isTyping, setIsTyping] = useState(false);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  // 모든 기록(삭제된 것 포함)을 기반으로 감정 통계 재계산하여 데이터 보존 보장
  const emotionData = useMemo(() => {
    const counts: Record<string, number> = {};
    // r.isDeleted 체크 없이 모든 기록을 통계에 합산 (메모 삭제 시에도 점수 유지 조건 만족)
    history.forEach(r => {
      counts[r.emotion] = (counts[r.emotion] || 0) + 1;
    });

    return Object.keys(EMOTION_SCORES)
      .map(emotion => ({
        name: emotion,
        count: counts[emotion] || 0,
        score: EMOTION_SCORES[emotion]
      }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [history]);

  const q0Stats = useMemo(() => {
    const counts = { '저조': 0, '보통': 0, '강력': 0 };
    history.forEach(r => {
      if (r.weight >= 1.3) counts['강력']++;
      else if (r.weight >= 1.0) counts['보통']++;
      else counts['저조']++;
    });
    return [
      { label: '강력', value: counts['강력'], color: '#818cf8' },
      { label: '보통', value: counts['보통'], color: '#3b82f6' },
      { label: '저조', value: counts['저조'], color: '#1e3a8a' },
    ];
  }, [history]);

  const q1Stats = useMemo(() => {
    const counts: Record<string, number> = { '과거': 0, '현재': 0, '미래': 0 };
    history.forEach(r => { if (counts[r.thoughtType] !== undefined) counts[r.thoughtType]++; });
    return [
      { label: '과거', value: counts['과거'], color: '#4338ca' },
      { label: '현재', value: counts['현재'], color: '#60a5fa' },
      { label: '미래', value: counts['미래'], color: '#c7d2fe' },
    ];
  }, [history]);

  useEffect(() => {
    const generateAdvice = async () => {
      if (history.length === 0) return;
      setIsTyping(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const topEmotion = emotionData[0]?.name || "평온";
        const totalEntries = history.length;
        const presentRate = Math.round((q1Stats.find(s => s.label === '현재')?.value || 0) / totalEntries * 100);
        
        const prompt = `당신은 에크하르트 톨레와 데이비드 호킨스의 지혜를 가진 세계 최고의 의식 코치이자 심리 상담사입니다. 
        다음 사용자의 데이터를 기반으로 전문적인 분석과 조언을 한국어로 작성해주세요.
        
        [사용자 데이터]
        - 가장 빈번한 감정: ${topEmotion}
        - 현재 집중도(Q1 현재 비율): ${presentRate}%
        - 전체 알아차림 횟수: ${totalEntries}회
        
        [작성 가이드라인]
        1. 우아하고 품격 있는 전문 상담사의 어조로서 사용자 데이터들에 대한 전반적인 상황을 설명하세요.
        2. 특히 '${topEmotion}'과 같은 부정적인 감정을 명확히 알아차린 행위가 왜 의식 성장에 가장 강력한 기폭제인지 강조하세요. (그것을 보았기에 이미 에고의 지배에서 벗어나기 시작했다는 점)
        3. 사용자가 이 앱을 통해 마음챙김 능력이 향상되고 있음을 구체적인 분석적 표현들을 채용하여 칭찬하세요.
        4. 3~5문장 정도로 작성하며, 매번 새로운 통찰을 제공하세요.
        5. 오직 상담 메시지만 출력하세요.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: { temperature: 0.9 }
        });

        setAdvice(response.text?.trim() || "지금 당신은 자신의 내면을 응시하는 것만으로도 거대한 변화를 만들고 있습니다.");
      } catch (e) {
        setAdvice("지금 당신의 자각은 어둠 속의 등불과 같습니다. 고통스러운 감정을 알아차리는 그 찰나에 당신의 에고는 힘을 잃고 진정한 자아가 빛나기 시작합니다.");
      } finally {
        setIsTyping(false);
      }
    };
    generateAdvice();
  }, [history, emotionData, q1Stats]);

  const maxCount = Math.max(...emotionData.map(d => d.count), 1);

  const handleFullReset = () => {
    onReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-2xl fade-in overflow-y-auto">
      <div className="glass-card w-full max-w-lg h-[90vh] rounded-[40px] flex flex-col overflow-hidden shadow-2xl border border-white/10 bg-[#020617]/50 my-auto">
        
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-white/5 bg-white/[0.02] shrink-0">
          <div>
            <h2 className="text-xl font-light text-white/90 tracking-tight">의식의 지형도</h2>
            <p className="text-[8px] text-blue-400/40 tracking-[0.3em] uppercase mt-0.5">Consciousness Cartography</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-all border border-white/5">
            <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-white/20 font-light italic">
              <p>기록된 자각의 데이터가 없습니다.</p>
            </div>
          ) : (
            <>
              {/* Pie Charts */}
              <div className="grid grid-cols-2 gap-4 bg-white/[0.02] rounded-[2.5rem] p-4 border border-white/5 shadow-inner">
                <PieChart data={q0Stats} title="자각의 명징함" />
                <PieChart data={q1Stats} title="에너지의 방향" />
              </div>

              {/* Compact Emotion Stats */}
              <div className="space-y-4 px-1">
                <div className="flex justify-between items-end mb-1">
                  <p className="text-[9px] text-white/30 uppercase tracking-[0.4em] font-semibold">Emotion Energy Spectrum</p>
                  <p className="text-[8px] text-white/10 italic">Preserved data metrics</p>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {emotionData.map((item, idx) => (
                    <div key={item.name} className="flex items-center gap-3 group">
                      <div className="w-14 shrink-0">
                        <span className="text-[10px] text-white/60 font-light group-hover:text-white transition-colors">{item.name}</span>
                      </div>
                      <div className="flex-1 h-1 bg-white/[0.03] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500/40 to-blue-400/60 transition-all duration-1000 ease-out"
                          style={{ width: `${(item.count / maxCount) * 100}%`, transitionDelay: `${idx * 0.05}s` }}
                        />
                      </div>
                      <div className="w-10 text-right">
                        <span className="text-[9px] text-indigo-300/80 font-mono font-bold">{item.count}</span>
                        <span className="text-[7px] text-white/5 ml-1">회</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Professional Report */}
              <div className="glass-card p-6 rounded-[2.5rem] border-white/5 bg-indigo-950/20 relative group mb-8">
                <div className="absolute -top-3 left-6 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full backdrop-blur-md">
                    <span className="text-[8px] text-indigo-200 uppercase tracking-widest font-bold">Expert Analysis</span>
                </div>
                
                <div className="mt-2 min-h-[120px] flex flex-col justify-center">
                  {isTyping ? (
                    <div className="flex gap-1 items-center justify-center h-20">
                      {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 bg-indigo-400/40 rounded-full animate-bounce" style={{ animationDelay: `${i*0.2}s` }}></div>)}
                    </div>
                  ) : (
                    <p className="text-[13px] font-light leading-[1.7] text-blue-50/80 break-keep animate-fade-in-soft">
                      {advice}
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center opacity-40">
                    <span className="text-[8px] text-white/40 italic">Guidance by AI Consciousness Guide</span>
                    <div className="w-8 h-px bg-white/10"></div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-white/[0.01] shrink-0 space-y-3">
          {!isConfirmingReset ? (
            <>
              <button
                onClick={onClose}
                className="w-full bg-white text-slate-900 py-4 rounded-[1.5rem] text-sm font-semibold shadow-2xl hover:bg-blue-50 transition-all active:scale-[0.98]"
              >
                대시보드 종료
              </button>
              <button
                onClick={() => setIsConfirmingReset(true)}
                className="w-full bg-red-500/10 text-red-400/80 border border-red-500/20 py-4 rounded-[1.5rem] text-sm font-light tracking-widest hover:bg-red-500/20 transition-all active:scale-[0.98]"
              >
                데이터 완전 초기화
              </button>
            </>
          ) : (
            <div className="space-y-4 animate-fade-in-soft py-2">
              <p className="text-xs text-red-400 font-semibold text-center leading-relaxed">
                정말로 삭제하시겠습니까?<br />
                <span className="font-light text-red-400/70">모든 점수와 레벨 기록이 영구히 사라집니다.</span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleFullReset}
                  className="flex-1 bg-red-500 text-white py-4 rounded-[1.2rem] text-sm font-bold shadow-lg active:scale-[0.95] transition-all"
                >
                  OK
                </button>
                <button
                  onClick={() => setIsConfirmingReset(false)}
                  className="flex-1 bg-white/10 text-white/60 py-4 rounded-[1.2rem] text-sm font-light active:scale-[0.95] transition-all"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes fadeInSoft {
          from { opacity: 0; transform: translateY(5px); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .animate-fade-in-soft { animation: fadeInSoft 0.8s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default AnalysisModal;
