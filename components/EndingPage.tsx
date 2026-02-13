
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
        if (char === '\n') return <br key={index} />;
        return (
          <span
            key={index}
            className="inline-block animate-fade-in-soft"
            style={{ animationFillMode: 'both', whiteSpace: 'pre' }}
          >
            {char}
          </span>
        );
      })}
      <span className="inline-block w-[2px] h-[1em] bg-blue-400/50 ml-1 animate-pulse align-middle"></span>
    </div>
  );
};

const TemporalPresenceGraph: React.FC<{ history: MemoRecord[]; currentLevel: number; totalCount: number }> = ({ history, currentLevel, totalCount }) => {
  const width = 320;
  const height = 200; 
  const paddingX = 35;
  const paddingY = 30;
  const effectiveWidth = width - paddingX * 2;

  const graphData = useMemo(() => {
    if (history.length === 0) return { linePoints: [], bars: [], maxScore: 0 };

    const sortedHistory = [...history].sort((a, b) => {
        const parse = (ts: string) => {
            const match = ts.match(/(\d+)년\s+(\d+)월\s+(\d+)일\s+(오전|오후)\s+(\d+):(\d+)/);
            if (!match) return 0;
            let [_, y, m, d, ampm, hh, mm] = match;
            let hour = parseInt(hh);
            if (ampm === '오후' && hour < 12) hour += 12;
            if (ampm === '오전' && hour === 12) hour = 0;
            return new Date(parseInt(y), parseInt(m)-1, parseInt(d), hour, parseInt(mm)).getTime();
        };
        return parse(a.timestamp) - parse(b.timestamp);
    });

    const barCount = currentLevel + 1;
    const barWidth = effectiveWidth / barCount;
    
    // 1단계: 각 레벨의 점수 합계 먼저 계산하여 최댓값(Scale) 찾기
    const levelData = [];
    let maxFoundScore = 50; // 최소 기준점

    for (let i = 0; i <= currentLevel; i++) {
      const startIdx = LEVELS[i].threshold;
      const endIdx = i < LEVELS.length - 1 ? LEVELS[i+1].threshold : Infinity;
      
      const recordsInLevel = sortedHistory.slice(startIdx, Math.min(endIdx, sortedHistory.length));
      const scoreSum = recordsInLevel.reduce((sum, rec) => sum + (EMOTION_SCORES[rec.emotion] || 0), 0);
      
      if (scoreSum > maxFoundScore) maxFoundScore = scoreSum;
      levelData.push({ scoreSum, startIdx });
    }

    // 2단계: 최댓값에 비례하여 막대 높이 및 포인트 계산
    const bars = [];
    const points = [];

    for (let i = 0; i <= currentLevel; i++) {
      const { scoreSum } = levelData[i];
      const barH = (scoreSum / maxFoundScore) * (height - paddingY * 2);
      
      const xStart = paddingX + i * barWidth;
      const xCenter = xStart + barWidth / 2;

      bars.push({
        x: xStart,
        xCenter,
        width: barWidth * 0.9,
        h: Math.max(barH, 4),
        score: scoreSum
      });

      const y = (height - paddingY) - (i / 30) * (height - paddingY * 2);
      points.push({ x: xCenter, y });
    }

    return { bars, linePoints: points };
  }, [history, currentLevel, totalCount, effectiveWidth, height]);

  const pathData = graphData.linePoints.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(' ');
  const lastPoint = graphData.linePoints[graphData.linePoints.length - 1];

  return (
    <div className="relative w-full py-2 my-1 animate-stagger-slow" style={{ animationDelay: '0.4s' }}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} fill="none" className="overflow-visible">
        <defs>
          <filter id="pointGlowEnd" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
        <line x1={paddingX} y1={paddingY} x2={paddingX} y2={height - paddingY} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
        
        <text x={paddingX - 18} y={height / 2} textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="7" transform={`rotate(-90, ${paddingX - 18}, ${height / 2})`} className="tracking-[0.3em] uppercase font-light">Presence Progress</text>

        {graphData.bars.map((bar, i) => (
          <g key={i} className="fade-in" style={{ animationDelay: `${0.6 + i * 0.05}s` }}>
            <rect
              x={bar.x + (bar.width * 0.05)}
              y={height - paddingY - bar.h}
              width={bar.width * 0.9}
              height={bar.h}
              fill="rgba(99, 102, 241, 0.15)"
              stroke="rgba(129, 140, 248, 0.3)"
              strokeWidth="0.8"
              rx="1.5"
            />
            <text 
              x={bar.xCenter} 
              y={height - paddingY + 12} 
              textAnchor="middle" 
              fill="rgba(255,255,255,0.12)" 
              fontSize="6" 
              className="font-mono"
            >
              L{i}
            </text>
          </g>
        ))}

        <path
          d={pathData}
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="draw-line-anim"
          style={{ strokeDasharray: 2000, strokeDashoffset: 2000 }}
        />

        {lastPoint && (
          <g className="fade-in" style={{ animationDelay: '2s' }}>
            <circle cx={lastPoint.x} cy={lastPoint.y} r="0" stroke="white" strokeWidth="0.6" className="concentric-ring-1" />
            <circle cx={lastPoint.x} cy={lastPoint.y} r="0" stroke="white" strokeWidth="0.6" className="concentric-ring-2" />
            <circle cx={lastPoint.x} cy={lastPoint.y} r="4" fill="#fff" filter="url(#pointGlowEnd)" />
            <text
              x={lastPoint.x}
              y={lastPoint.y - 15}
              textAnchor="middle"
              fill="white"
              fontSize="10"
              fontWeight="600"
              className="font-mono drop-shadow-xl"
            >
              LV.{currentLevel}
            </text>
          </g>
        )}
      </svg>
      <style>{`
        @keyframes drawLine { to { stroke-dashoffset: 0; } }
        @keyframes ringGrow { 0% { r: 0; opacity: 1; } 100% { r: 18; opacity: 0; } }
        .draw-line-anim { animation: drawLine 3.5s cubic-bezier(0.2, 0, 0.4, 1) forwards; }
        .concentric-ring-1 { animation: ringGrow 3s ease-out infinite; }
        .concentric-ring-2 { animation: ringGrow 3s ease-out infinite 1.5s; }
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
        const prompt = `당신은 에크하르트 톨레와 데이비드 호킨스의 지혜를 가진 명상 가이드입니다. 
        사용자가 생각을 알아차리고 기록했습니다. 이 사용자에게 통찰을 줄 수 있는 우아한 한 문장 메시지를 한국어로 작성해주세요.`;
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: { tools: [{ googleSearch: {} }], temperature: 0.8 },
        });
        setDynamicMessage(response.text?.trim() || "지금 이 순간, 당신의 존재만으로도 이미 충분합니다.");
      } catch (e) { setDynamicMessage("지금 이 순간, 당신의 존재만으로도 이미 충분합니다."); }
    };
    fetchInspiration();
  }, []);

  const level = useMemo(() => {
    const info = LEVELS.slice().reverse().find(l => totalCount >= l.threshold) || LEVELS[0];
    return { ...info, actualLevelNum: parseInt(info.rank.split(' ')[1]) };
  }, [totalCount]);

  const topEmotions = useMemo(() => {
    return Object.entries(emotionStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, count]) => ({ name, count, score: EMOTION_SCORES[name] || 0 }));
  }, [emotionStats]);

  return (
    <div className="fade-in space-y-4 text-center px-1 max-w-sm mx-auto">
      <div className="space-y-2 pt-1">
        <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10 shadow-inner">
          <svg className="w-4 h-4 text-blue-200/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="text-[11px] font-light text-blue-100/60 min-h-[50px] leading-relaxed flex items-center justify-center px-4">
          <TypingText text={dynamicMessage} speed={40} />
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] p-5 shadow-2xl border-white/10 relative overflow-hidden text-left bg-transparent backdrop-blur-3xl">
        <div className="flex justify-between items-start mb-2 gap-2">
          <div className="px-1 py-1 flex-1 overflow-hidden">
            <p className="text-[7px] text-blue-300/60 uppercase tracking-[0.1em] font-semibold mb-0.5">Current Presence</p>
            <h3 className="text-[14px] font-normal text-white tracking-tight truncate leading-tight whitespace-nowrap">{level.title}</h3>
            <p className="text-[8px] text-white/30 font-light">Level {level.actualLevelNum}</p>
          </div>
          <div className="text-right pt-0.5 pr-1 shrink-0">
            <p className="text-[7px] text-white/40 uppercase tracking-[0.1em] mb-0.5">Total Score</p>
            <p className="text-xl font-light text-white font-mono tracking-tighter leading-none">{totalScore.toLocaleString()}</p>
          </div>
        </div>

        <TemporalPresenceGraph history={history} currentLevel={level.actualLevelNum} totalCount={totalCount} />

        <div className="mt-2 pt-3 border-t border-white/5">
          <p className="text-[7px] text-white/30 uppercase tracking-[0.2em] mb-2">Awareness Impact (Top 3)</p>
          <div className="space-y-2">
            {topEmotions.length > 0 ? topEmotions.map((em, i) => (
              <div key={i} className="flex items-center justify-between text-[10px] font-light group">
                <div className="flex items-center gap-1.5">
                  <div className="w-0.5 h-0.5 rounded-full bg-blue-500/50 shadow-[0_0_6px_rgba(59,130,246,0.3)]"></div>
                  <span className="text-white/70">{em.name}</span>
                </div>
                <div className="flex gap-2 font-mono text-white/40">
                  <span>{em.count}회</span>
                  <span className="text-blue-400/40">+{em.score}p</span>
                </div>
              </div>
            )) : <p className="text-[8px] text-white/20 italic">No data analyzed yet.</p>}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 pt-2">
        <button onClick={() => setShowHistory(true)} className="w-full glass-card py-4 rounded-[1.2rem] text-sm font-light border border-white/5 hover:bg-white/10 transition-all active:scale-[0.98]">
          기록한 메모보기
        </button>
        <button onClick={() => setShowGuide(true)} className="w-full glass-card py-4 rounded-[1.2rem] text-sm font-light border border-white/5 hover:bg-white/10 transition-all text-blue-100/60 active:scale-[0.98]">
          현존하세요 가이드
        </button>
        <button onClick={onExit} className="w-full bg-white/5 py-4 rounded-[1.2rem] text-sm font-light border border-white/10 hover:bg-white/10 transition-all active:scale-[0.98]">
          앱 종료하기
        </button>
        <button onClick={() => setShowAnalysis(true)} className="w-full py-3 text-[8px] font-light text-white/20 hover:text-white/40 transition-all tracking-[0.4em] uppercase">
          Consciousness Analytics
        </button>
      </div>

      {showHistory && <HistoryModal history={history} onClose={() => setShowHistory(false)} onDeleteRecord={onDeleteRecord} />}
      {showAnalysis && <AnalysisModal emotionStats={emotionStats} history={history} onClose={() => setShowAnalysis(false)} onReset={onReset} />}
      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
    </div>
  );
};

export default EndingPage;
