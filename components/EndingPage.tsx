
import React, { useState, useEffect, useMemo } from 'react';
import { MemoRecord } from '../types';
import { EMOTION_SCORES } from '../constants';
import { GoogleGenAI } from "@google/genai";
import HistoryModal from './HistoryModal';
import AnalysisModal from './AnalysisModal';
import GuideModal from './GuideModal';

const LEVELS = [
  { threshold: 400, title: "수다원 등극(만랩)", rank: "Level 30" },
  { threshold: 380, title: "흐름의 동반자", rank: "Level 29" },
  { threshold: 360, title: "세상에 밝은 빛", rank: "Level 28" },
  { threshold: 340, title: "초월의 문턱", rank: "Level 27" },
  { threshold: 320, title: "세계조화의 조정관", rank: "Level 26" },
  { threshold: 300, title: "흐름중심의 집정관", rank: "Level 25" },
  { threshold: 280, title: "존재경계의 관리인", rank: "Level 24" },
  { threshold: 260, title: "자아의식 감별관", rank: "Level 23" },
  { threshold: 245, title: "현존에 머무는 자", rank: "Level 22" },
  { threshold: 230, title: "시간과 숨을 맞춘 자", rank: "Level 21" },
  { threshold: 215, title: "침묵과 걷는 자", rank: "Level 20" },
  { threshold: 200, title: "진리의 바퀴를 돌린 자", rank: "Level 19" },
  { threshold: 185, title: "생각 밖으로 나온 자", rank: "Level 18" },
  { threshold: 170, title: "의식의 등대", rank: "Level 17" },
  { threshold: 155, title: "현존의 빛을 내는 자", rank: "Level 16" },
  { threshold: 140, title: "지금에 머무는 자", rank: "Level 15" },
  { threshold: 125, title: "동일시를 끊은 자", rank: "Level 14" },
  { threshold: 110, title: "빛의 응시자", rank: "Level 13" },
  { threshold: 95, title: "흐름과 하나됨", rank: "Level 12" },
  { threshold: 80, title: "분리의 꿈을 깬 자", rank: "Level 11" },
  { threshold: 70, title: "현존의식 관리자", rank: "Level 10" },
  { threshold: 60, title: "존재에 닻 내린 자", rank: "Level 9" },
  { threshold: 50, title: "고요의 문턱", rank: "Level 8" },
  { threshold: 40, title: "실재의 대면자", rank: "Level 7" },
  { threshold: 30, title: "2급 내면 감시관", rank: "Level 6" },
  { threshold: 25, title: "감정의 파도 관찰자", rank: "Level 5" },
  { threshold: 20, title: "내면을 보는 눈", rank: "Level 4" },
  { threshold: 15, title: "자각 수행자", rank: "Level 3" },
  { threshold: 10, title: "생각을 알아차린 자", rank: "Level 2" },
  { threshold: 5, title: "현존 입문자", rank: "Level 1" },
  { threshold: 0, title: "관찰의 시작", rank: "Level 0" }
].reverse(); 

interface TypingTextProps {
  text: string;
  speed?: number;
}

const TypingText: React.FC<TypingTextProps> = ({ text, speed = 40 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  return (
    <div className="leading-relaxed inline">
      {displayedText.split('').map((char, index) => {
        if (char === '\n') {
          return <br key={index} />;
        }
        return (
          <span
            key={index}
            className="inline-block animate-fade-in-soft"
            style={{ 
              animationFillMode: 'both',
              whiteSpace: 'pre'
            }}
          >
            {char}
          </span>
        );
      })}
      <span className="inline-block w-[2px] h-[1em] bg-blue-400/50 ml-1 animate-pulse align-middle"></span>
    </div>
  );
};

// --- 고도화된 시간축 레벨 그래프 (높이 축소) ---
const TemporalPresenceGraph: React.FC<{ history: MemoRecord[]; currentLevel: number; totalScore: number }> = ({ history, currentLevel, totalScore }) => {
  const width = 320;
  const height = 120; // 50% 수준으로 높이 축소
  const paddingX = 40;
  const paddingY = 25;

  // 날짜 파싱 헬퍼
  const parseTimestamp = (ts: string) => {
    try {
      const match = ts.match(/(\d+)년\s+(\d+)월\s+(\d+)일\s+(오전|오후)\s+(\d+):(\d+)/);
      if (match) {
        let [_, y, m, d, ampm, hh, mm] = match;
        let hour = parseInt(hh);
        if (ampm === '오후' && hour < 12) hour += 12;
        if (ampm === '오전' && hour === 12) hour = 0;
        return new Date(parseInt(y), parseInt(m) - 1, parseInt(d), hour, parseInt(mm)).getTime();
      }
      return new Date().getTime();
    } catch (e) {
      return new Date().getTime();
    }
  };

  const graphData = useMemo(() => {
    if (history.length === 0) return { linePoints: [], bars: [], startTimeStr: '', endTimeStr: '', maxBarVal: 1 };

    const sortedHistory = [...history].sort((a, b) => parseTimestamp(a.timestamp) - parseTimestamp(b.timestamp));
    const startTime = parseTimestamp(sortedHistory[0].timestamp);
    const endTime = Date.now();
    const timeSpan = Math.max(endTime - startTime, 1000); 

    const startTimeStr = sortedHistory[0].timestamp.split('일')[0] + '일';
    const endTimeStr = '현재';

    let runningScore = 0;
    const levelBuckets = new Array(31).fill(0);
    const linePoints: { x: number; y: number; lv: number }[] = [];

    linePoints.push({ x: paddingX, y: height - paddingY, lv: 0 });

    sortedHistory.forEach(record => {
      const score = EMOTION_SCORES[record.emotion] || 0;
      const t = parseTimestamp(record.timestamp);
      const x = paddingX + ((t - startTime) / timeSpan) * (width - paddingX * 2);
      
      runningScore += score;
      
      let targetLevel = 0;
      for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (runningScore >= LEVELS[i].threshold) {
          targetLevel = i;
          break;
        }
      }

      levelBuckets[targetLevel] += score;

      const y = (height - paddingY) - (targetLevel / 30) * (height - paddingY * 2);
      linePoints.push({ x, y, lv: targetLevel });
    });

    const currentX = width - paddingX;
    const currentY = (height - paddingY) - (currentLevel / 30) * (height - paddingY * 2);
    linePoints.push({ x: currentX, y: currentY, lv: currentLevel });

    const maxBarVal = Math.max(...levelBuckets, 10);
    const bars = levelBuckets.map((val, lv) => {
      if (val === 0) return null;
      const x = paddingX + (lv / 30) * (width - paddingX * 2);
      const barH = (val / maxBarVal) * (height - paddingY * 2);
      return { x, h: barH, val, lv };
    }).filter(b => b !== null);

    return { linePoints, bars, startTimeStr, endTimeStr, maxBarVal };
  }, [history, currentLevel]);

  const pathData = graphData.linePoints.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(' ');
  const lastPoint = graphData.linePoints[graphData.linePoints.length - 1];

  return (
    <div className="relative w-full py-2 my-1 animate-stagger-slow" style={{ animationDelay: '0.4s' }}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} fill="none" className="overflow-visible">
        <defs>
          <filter id="pointGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
        <line x1={paddingX} y1={paddingY} x2={paddingX} y2={height - paddingY} stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
        
        <text x={paddingX - 10} y={height / 2} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="8" transform={`rotate(-90, ${paddingX - 10}, ${height / 2})`}>level</text>
        <text x={paddingX - 4} y={paddingY + 4} textAnchor="end" fill="rgba(255,255,255,0.4)" fontSize="8" fontWeight="bold">30 max</text>

        <text x={paddingX} y={height - paddingY + 12} textAnchor="start" fill="rgba(255,255,255,0.2)" fontSize="6">{graphData.startTimeStr}</text>
        <text x={width - paddingX} y={height - paddingY + 12} textAnchor="end" fill="rgba(255,255,255,0.2)" fontSize="6">{graphData.endTimeStr}</text>

        {graphData.bars.map((bar, i) => (
          <rect
            key={i}
            x={bar!.x - 3}
            y={height - paddingY - bar!.h}
            width="6"
            height={bar!.h}
            fill="rgba(59, 130, 246, 0.1)"
            stroke="rgba(59, 130, 246, 0.3)"
            strokeWidth="0.4"
            rx="1"
            className="fade-in"
            style={{ animationDelay: `${0.8 + i * 0.05}s` }}
          />
        ))}

        <path
          d={pathData}
          stroke="#4f46e5"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="draw-line-anim"
          style={{ 
            strokeDasharray: 2000, 
            strokeDashoffset: 2000,
            filter: 'drop-shadow(0 0 2px rgba(79, 70, 229, 0.3))'
          }}
        />

        {lastPoint && (
          <g>
            <circle cx={lastPoint.x} cy={lastPoint.y} r="0" stroke="white" strokeWidth="0.8" className="concentric-ring-1" />
            <circle cx={lastPoint.x} cy={lastPoint.y} r="0" stroke="white" strokeWidth="0.8" className="concentric-ring-2" />
            <circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r="4"
              fill="#3b82f6"
              filter="url(#pointGlow)"
            />
            <text
              x={lastPoint.x}
              y={lastPoint.y < height / 2 ? lastPoint.y + 16 : lastPoint.y - 10}
              textAnchor="middle"
              fill="white"
              fontSize="10"
              fontWeight="bold"
              className="fade-in"
              style={{ animationDelay: '3s' }}
            >
              LV.{currentLevel}
            </text>
          </g>
        )}
      </svg>
      
      <style>{`
        @keyframes drawLine {
          to { stroke-dashoffset: 0; }
        }
        @keyframes ringGrow {
          0% { r: 0; opacity: 1; }
          100% { r: 12; opacity: 0; }
        }
        .draw-line-anim {
          animation: drawLine 4s cubic-bezier(0.2, 0, 0.4, 1) forwards;
        }
        .concentric-ring-1 {
          animation: ringGrow 3s ease-out infinite;
        }
        .concentric-ring-2 {
          animation: ringGrow 3s ease-out infinite 1.5s;
        }
      `}</style>
    </div>
  );
};

interface Props {
  history: MemoRecord[];
  onReset: () => void;
  onExit: () => void;
  onDeleteRecord: (id: string) => void;
  totalScore: number;
  totalCount: number;
  emotionStats: Record<string, number>;
  lastEmotion: string;
}

const EndingPage: React.FC<Props> = ({ history, onReset, onExit, onDeleteRecord, totalScore, totalCount, emotionStats, lastEmotion }) => {
  const [showHistory, setShowHistory] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [dynamicMessage, setDynamicMessage] = useState<string>('현존의 빛을 불러오는 중입니다...');

  useEffect(() => {
    const fetchInspiration = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `당신은 에크하르트 톨레와 데이비드 호킨스의 지혜, 그리고 현대 심리학의 마음챙김(trait mindfulness) 이론에 정통한 명상 가이드입니다.
        사용자가 방금 자신의 생각을 알아차리고 기록했습니다. 이 사용자에게 깊은 통찰과 평온을 줄 수 있는 메시지를 한국어로 작성해주세요.
        
        조건:
        1. 에크하르트 톨레('삶으로 다시 떠오르기'), 데이비드 호킨스('의식혁명'), 마음챙김 관련 명언이나 학술적 통찰을 바탕으로 하여 인터넷에서 영감을 탐색할 것.
        2. 공백 포함 30자에서 60자 사이의 한 문장 또는 두 문장으로 작성할 것.
        3. 신비롭고 우아한 어조를 사용할 것.
        4. 오직 메시지 텍스트만 출력할 것.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
            temperature: 0.8,
          },
        });

        const text = response.text || "지금 이 순간, 당신의 존재만으로도 이미 충분합니다.";
        setDynamicMessage(text.trim());
      } catch (error) {
        console.error("Failed to generate message:", error);
        setDynamicMessage("지금 이 순간, 당신의 존재만으로도 이미 충분합니다.");
      }
    };

    fetchInspiration();
  }, []);

  const level = useMemo(() => {
    const score = totalScore;
    const info = LEVELS.slice().reverse().find(l => score >= l.threshold) || LEVELS[0];
    return { ...info, actualLevelNum: parseInt(info.rank.split(' ')[1]) };
  }, [totalScore]);

  const topEmotions = useMemo(() => {
    return Object.entries(emotionStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, count]) => ({
        name,
        count,
        score: EMOTION_SCORES[name] || 0
      }));
  }, [emotionStats]);

  return (
    <div className="fade-in space-y-6 text-center pb-12 px-1 max-w-sm mx-auto">
      {/* 상단 메시지 구역 */}
      <div className="space-y-3 pt-2">
        <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10 shadow-inner">
          <svg className="w-5 h-5 text-blue-200/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="text-sm font-light text-blue-100/60 min-h-[60px] leading-relaxed flex items-center justify-center px-6">
          <TypingText text={dynamicMessage} speed={50} />
        </div>
      </div>

      {/* 메인 분석 카드 */}
      <div className="glass-card rounded-[2.5rem] p-6 shadow-2xl border-white/10 relative overflow-hidden text-left bg-[#0f172a]/60 backdrop-blur-3xl">
        <div className="flex justify-between items-start mb-4 gap-2">
          <div className="bg-[#2a2a68]/80 px-4 py-3 rounded-xl border border-white/5 shadow-2xl flex-1 overflow-hidden">
            <p className="text-[8px] text-blue-300 uppercase tracking-[0.1em] font-semibold mb-1 opacity-80">Current Presence</p>
            <h3 className="text-base font-normal text-white tracking-tight mb-0.5 truncate leading-tight">{level.title}</h3>
            <p className="text-[9px] text-white/30 font-light">Level {level.actualLevelNum}</p>
          </div>
          <div className="text-right pt-1 pr-1 shrink-0">
            <p className="text-[8px] text-white/40 uppercase tracking-[0.1em] mb-0.5">Total Score</p>
            <p className="text-2xl font-light text-white font-mono tracking-tighter leading-none">{totalScore.toLocaleString()}</p>
          </div>
        </div>

        <TemporalPresenceGraph history={history} currentLevel={level.actualLevelNum} totalScore={totalScore} />

        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-[8px] text-white/30 uppercase tracking-[0.2em] mb-3">Awareness Impact (Top 3)</p>
          <div className="space-y-3">
            {topEmotions.length > 0 ? topEmotions.map((em, i) => (
              <div key={i} className="flex items-center justify-between text-xs font-light group">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-blue-500/50 shadow-[0_0_8px_rgba(59,130,246,0.3)] group-hover:bg-blue-400 transition-colors"></div>
                  <span className="text-white/80 group-hover:text-white transition-colors text-[11px]">{em.name}</span>
                </div>
                <div className="flex gap-3 text-[10px] font-mono">
                  <span className="text-white/30">{em.count}회</span>
                  <span className="text-blue-400/60">+{em.score}p</span>
                </div>
              </div>
            )) : (
              <p className="text-[10px] text-white/20 italic">No data analyzed yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* 하단 액션 버튼 구역 */}
      <div className="flex flex-col gap-3 pt-4">
        <button
          onClick={() => setShowHistory(true)}
          className="w-full glass-card py-5 rounded-[1.5rem] text-sm font-light border border-white/5 hover:bg-white/10 transition-all active:scale-[0.98] shadow-lg"
        >
          기록한 메모보기
        </button>
        <button
          onClick={() => setShowGuide(true)}
          className="w-full glass-card py-5 rounded-[1.5rem] text-sm font-light border border-white/5 hover:bg-white/10 transition-all text-blue-100/60 active:scale-[0.98] shadow-md"
        >
          현존하세요 가이드
        </button>
        <button
          onClick={onExit}
          className="w-full bg-white/5 py-5 rounded-[1.5rem] text-sm font-light border border-white/10 hover:bg-white/10 transition-all active:scale-[0.98]"
        >
          앱 종료하기
        </button>
        <button
          onClick={() => setShowAnalysis(true)}
          className="w-full py-4 text-[9px] font-light text-white/20 hover:text-white/40 transition-all tracking-[0.4em] uppercase"
        >
          Consciousness Analytics
        </button>
      </div>

      {showHistory && <HistoryModal history={history} onClose={() => setShowHistory(false)} onDeleteRecord={onDeleteRecord} />}
      {showAnalysis && <AnalysisModal emotionStats={emotionStats} onClose={() => setShowAnalysis(false)} onReset={onReset} />}
      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
    </div>
  );
};

export default EndingPage;
