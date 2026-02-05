
import React, { useState, useEffect } from 'react';
import { MemoRecord } from '../types';
import HistoryModal from './HistoryModal';
import AnalysisModal from './AnalysisModal';

interface TypingTextProps {
  text: string;
  speed?: number;
}

const TypingText: React.FC<TypingTextProps> = ({ text, speed = 40 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

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

  const getLevelInfo = () => {
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

    return levels.find(l => count >= l.threshold) || levels[levels.length - 1];
  };

  const level = getLevelInfo();

  const message = "지금 여기는 완벽하게 안전합니다.\n아무 일도 벌어지지 않았어요.\n이것만이 유일한 진실입니다.\n잠깐 동안 거짓 망상에 사로잡힌 것임을 깨달으세요.\n 이렇게 깨닫는 단순한 행동만으로도,\n악의 공격으로부터 스스로를 지켜낼 수 있습니다.\n 대군을 거느린 죽음의 신에게 결코 굴복하지 맙시다.";

  return (
    <div className="fade-in space-y-11 text-center">
      <div className="space-y-6">
        <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto border border-blue-400/30 animate-pulse">
          <svg className="w-10 h-10 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-light text-white">아주 좋습니다</h2>
          <div className="text-sm font-light text-blue-100/70 max-w-[360px] mx-auto min-h-[160px] text-center">
            <TypingText text={message} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-8 rounded-[2.5rem] flex flex-col justify-center items-center shadow-2xl">
          <p className="text-xs text-blue-300 opacity-60 mb-3 uppercase tracking-[0.2em] font-medium">나의 의식 점수</p>
          <p className="text-4xl font-light tracking-tight">
            {totalScore.toLocaleString()}
            <span className="text-xl ml-0.5 opacity-60 font-normal">점</span>
          </p>
        </div>
        <div className="glass-card p-8 rounded-[2.5rem] flex flex-col justify-center items-center shadow-2xl">
          <p className="text-xs text-blue-300 opacity-60 mb-3 uppercase tracking-[0.2em] font-medium">현재 레벨</p>
          <div className="text-center space-y-1">
            <p className="text-xl font-light leading-tight text-white">{level.title}</p>
            <p className="text-sm text-blue-400/70 font-medium tracking-wide">{level.rank}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button
          onClick={() => setShowHistory(true)}
          className="w-full glass-card py-6 rounded-2xl text-lg font-light border border-white/10 hover:bg-white/10 transition-all"
        >
          지금까지 기록한 메모보기
        </button>
        
        <button
          onClick={onExit}
          className="w-full bg-white/10 py-6 rounded-2xl text-lg font-light border border-white/20 hover:bg-white/20 transition-all shadow-lg"
        >
          앱 종료하기
        </button>

        <button
          onClick={() => setShowAnalysis(true)}
          className="w-full py-4 text-sm font-light text-white/40 hover:text-white/80 transition-all"
        >
          나의 현존의식 분석
        </button>
      </div>

      {showHistory && (
        <HistoryModal 
          history={history} 
          onClose={() => setShowHistory(false)} 
          onDeleteRecord={onDeleteRecord}
        />
      )}

      {showAnalysis && (
        <AnalysisModal
          emotionStats={emotionStats}
          onClose={() => setShowAnalysis(false)}
          onReset={onReset}
        />
      )}

      <style>{`
        @keyframes fadeInSoft {
          from { opacity: 0; transform: translateY(2px); filter: blur(2px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .animate-fade-in-soft {
          animation: fadeInSoft 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default EndingPage;
