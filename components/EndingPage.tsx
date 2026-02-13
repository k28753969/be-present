
import React, { useState, useEffect, useMemo } from 'react';
import { MemoRecord } from '../types';
import { EMOTION_SCORES } from '../constants';
import { GoogleGenAI } from "@google/genai";
import HistoryModal from './HistoryModal';
import AnalysisModal from './AnalysisModal';
import GuideModal from './GuideModal';

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

// --- 고도화된 시간축 레벨 그래프 ---
const TemporalPresenceGraph: React.FC<{ history: MemoRecord[]; currentLevel: number }> = ({ history, currentLevel }) => {
  const width = 320;
  const height = 300; 
  const paddingX = 15;
  const paddingY = 50;

  const getY = (level: number) => {
    const safeLevel = Math.min(level, 30);
    return (height - paddingY) - (safeLevel / 30) * (height - paddingY * 2);
  };

  const points = useMemo(() => {
    const reversedHistory = [...history].reverse();
    const dataPoints = [{ x: paddingX, y: getY(0) }];
    
    if (reversedHistory.length === 0) {
      dataPoints.push({ x: width - paddingX, y: getY(currentLevel) });
    } else {
      reversedHistory.forEach((_, index) => {
        const stepX = paddingX + ((index + 1) / (reversedHistory.length + 1)) * (width - paddingX * 2);
        dataPoints.push({ x: stepX, y: getY(index + 1) });
      });
      dataPoints.push({ x: width - paddingX, y: getY(currentLevel) });
    }
    return dataPoints;
  }, [history, currentLevel]);

  const pathData = points.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(' ');
  const lastPoint = points[points.length - 1];

  return (
    <div className="relative w-full py-4 my-2 animate-stagger-slow" style={{ animationDelay: '0.4s' }}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} fill="none" className="overflow-visible">
        <defs>
          <filter id="pointGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 배경 영역 구분 */}
        <rect x={paddingX} y={getY(10)} width={width - paddingX * 2} height={getY(0) - getY(10)} fill="rgba(255, 255, 255, 0.02)" rx="8" />
        <rect x={paddingX} y={getY(20)} width={width - paddingX * 2} height={getY(10) - getY(20)} fill="rgba(59, 130, 246, 0.04)" rx="8" />
        <rect x={paddingX} y={getY(30)} width={width - paddingX * 2} height={getY(20) - getY(30)} fill="rgba(147, 197, 253, 0.06)" rx="8" />

        {/* 목표 라인 */}
        <line 
          x1={paddingX} y1={getY(30)} x2={width - paddingX} y2={getY(30)} 
          stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" strokeDasharray="4 4" 
        />
        <text x={width - paddingX} y={getY(30) - 10} textAnchor="end" fill="rgba(255,255,255,0.25)" fontSize="8" fontWeight="300" letterSpacing="0.05em">GOAL LV.30</text>

        {/* 영역 텍스트 (Y축 좌측 세로) */}
        <g opacity="0.4" fontSize="6" fontWeight="300" fill="rgba(255,255,255,0.15)" letterSpacing="0.1em">
          <text transform={`translate(${paddingX - 5}, ${getY(5)}) rotate(-90)`} textAnchor="middle">FOUNDATION</text>
          <text transform={`translate(${paddingX - 5}, ${getY(15)}) rotate(-90)`} textAnchor="middle">DEEPENING</text>
          <text transform={`translate(${paddingX - 5}, ${getY(25)}) rotate(-90)`} textAnchor="middle">TRANSCENDENCE</text>
        </g>

        {/* 궤적 라인 */}
        <path
          d={pathData}
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="draw-line-anim"
          style={{ 
            strokeDasharray: 1500, 
            strokeDashoffset: 1500,
            opacity: 0.8
          }}
        />

        {/* 현재 지점 및 애니메이션 (Concentric) */}
        {lastPoint && (
          <g>
            {/* 동심원 핑 애니메이션 */}
            <circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r="8"
              stroke="white"
              strokeWidth="0.5"
              className="animate-ping"
              style={{ animationDuration: '3s', transformOrigin: `${lastPoint.x}px ${lastPoint.y}px` }}
            />
            {/* 메인 포인트 */}
            <circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r="4.5"
              fill="white"
              filter="url(#pointGlow)"
              className="animate-brightness-pulse"
            />
            
            {/* Current LV 텍스트 (그래프 밖으로 나가지 않게 조정) */}
            <text
              x={lastPoint.x - 2}
              y={lastPoint.y < 40 ? lastPoint.y + 20 : lastPoint.y - 12}
              textAnchor="end"
              fill="white"
              fontSize="9"
              fontWeight="300"
              className="fade-in"
              style={{ animationDelay: '2.5s' }}
            >
              Current LV
            </text>
          </g>
        )}
      </svg>
      
      <style>{`
        @keyframes drawLine {
          to { stroke-dashoffset: 0; }
        }
        @keyframes brightnessPulse {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 2px rgba(255,255,255,0.4)); }
          50% { filter: brightness(2) drop-shadow(0 0 10px white); }
        }
        .draw-line-anim {
          animation: drawLine 3s cubic-bezier(0.3, 0, 0.4, 1) forwards;
        }
        .animate-brightness-pulse {
          animation: brightnessPulse 2s ease-in-out infinite;
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
    const count = totalCount;
    const levels = [
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
    ];
    const info = levels.find(l => count >= l.threshold) || levels[levels.length - 1];
    return { ...info, actualLevel: Math.min(count, 30) };
  }, [totalCount]);

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
    <div className="fade-in space-y-8 text-center pb-8 px-2 max-w-sm mx-auto">
      {/* 상단 메시지 구역 */}
      <div className="space-y-4">
        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10 shadow-inner">
          <svg className="w-6 h-6 text-blue-200/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="text-sm font-light text-blue-100/60 min-h-[70px] leading-relaxed flex items-center justify-center px-4">
          <TypingText text={dynamicMessage} speed={50} />
        </div>
      </div>

      {/* 메인 분석 카드 (첨부 이미지 스타일) */}
      <div className="glass-card rounded-[3rem] p-8 shadow-2xl border-white/10 relative overflow-hidden text-left bg-[#0f172a]/60 backdrop-blur-3xl">
        {/* 카드 상단 헤더: 이미지 레이아웃 반영 */}
        <div className="flex justify-between items-start mb-10">
          {/* 왼쪽: 현재 현존 레벨 박스 */}
          <div className="bg-[#312e81]/60 px-5 py-4 rounded-lg border border-white/5 shadow-xl min-w-[160px]">
            <p className="text-[9px] text-blue-300 uppercase tracking-[0.2em] font-semibold mb-2 opacity-90">Current Presence</p>
            <h3 className="text-2xl font-normal text-white tracking-tight mb-1">{level.title}</h3>
            <p className="text-[11px] text-white/40 font-light">Level {level.actualLevel}</p>
          </div>

          {/* 오른쪽: 토탈 스코어 */}
          <div className="text-right pt-2">
            <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-1">Total Score</p>
            <p className="text-4xl font-light text-white font-mono tracking-tighter">{totalScore.toLocaleString()}</p>
          </div>
        </div>

        {/* 성장 궤적 그래프 */}
        <TemporalPresenceGraph history={history} currentLevel={level.actualLevel} />

        {/* 하단 감정 분석 구역 */}
        <div className="mt-8 pt-8 border-t border-white/5">
          <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] mb-5">Awareness Impact (Top 3)</p>
          <div className="space-y-5">
            {topEmotions.length > 0 ? topEmotions.map((em, i) => (
              <div key={i} className="flex items-center justify-between text-sm font-light group">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50 shadow-[0_0_8px_rgba(59,130,246,0.3)] group-hover:bg-blue-400 transition-colors"></div>
                  <span className="text-white/80 group-hover:text-white transition-colors">{em.name}</span>
                </div>
                <div className="flex gap-4 text-[11px] font-mono">
                  <span className="text-white/30">{em.count}회 감지</span>
                  <span className="text-blue-400/60">+{em.score}pts</span>
                </div>
              </div>
            )) : (
              <p className="text-xs text-white/20 italic">No data analyzed yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* 하단 액션 버튼 구역 */}
      <div className="flex flex-col gap-4 pt-4">
        <button
          onClick={() => setShowHistory(true)}
          className="w-full glass-card py-6 rounded-2xl text-base font-light border border-white/5 hover:bg-white/10 transition-all active:scale-[0.98] shadow-lg"
        >
          기록한 메모보기
        </button>

        <button
          onClick={() => setShowGuide(true)}
          className="w-full glass-card py-6 rounded-2xl text-base font-light border border-white/5 hover:bg-white/10 transition-all text-blue-100/60 active:scale-[0.98] shadow-md"
        >
          현존하세요 가이드
        </button>
        
        <button
          onClick={onExit}
          className="w-full bg-white/5 py-6 rounded-2xl text-base font-light border border-white/10 hover:bg-white/10 transition-all active:scale-[0.98]"
        >
          앱 종료하기
        </button>

        <button
          onClick={() => setShowAnalysis(true)}
          className="w-full py-6 text-[10px] font-light text-white/20 hover:text-white/40 transition-all tracking-[0.5em] uppercase"
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
