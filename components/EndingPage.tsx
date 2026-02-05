
import React, { useState, useEffect } from 'react';
import { MemoRecord } from '../types';
import { getLevelInfo } from '../constants';
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

interface Props {
  history: MemoRecord[];
  onReset: () => void;
  onExit: () => void;
  onDeleteRecord: (id: string) => void;
  totalScore: number;
  totalCount: number;
  emotionStats: Record<string, number>;
}

const EndingPage: React.FC<Props> = ({ 
  history, onReset, onExit, onDeleteRecord, totalScore, totalCount, emotionStats 
}) => {
  const [activeModal, setActiveModal] = useState<'history' | 'analysis' | 'guide' | null>(null);

  const level = getLevelInfo(totalCount);
  const message = "지금 여기는 완벽하게 안전합니다.\n아무 일도 벌어지지 않았어요.\n이것만이 유일한 진실입니다.\n잠깐 동안 거짓 망상에 사로잡힌 것임을 깨달으세요.\n 이렇게 깨닫는 단순한 행동만으로도,\n악의 공격으로부터 스스로를 지켜낼 수 있습니다.\n 대군을 거느린 죽음의 신에게 결코 굴복하지 맙시다.";

  return (
    <div className="fade-in space-y-11 text-center">
      <div className="space-y-6">
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto border border-blue-400/30 animate-pulse">
          <svg className="w-8 h-8 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-light text-white">아주 좋습니다</h2>
          <div className="text-[13px] font-light text-blue-100/70 max-w-[360px] mx-auto min-h-[160px] text-center px-4">
            <TypingText text={message} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-6 rounded-[2.5rem] flex flex-col justify-center items-center shadow-2xl">
          <p className="text-[10px] text-blue-300 opacity-60 mb-2 uppercase tracking-[0.2em] font-medium">나의 의식 점수</p>
          <p className="text-3xl font-light tracking-tight">
            {totalScore.toLocaleString()}
            <span className="text-lg ml-0.5 opacity-60 font-normal">점</span>
          </p>
        </div>
        <div className="glass-card p-6 rounded-[2.5rem] flex flex-col justify-center items-center shadow-2xl">
          <p className="text-[10px] text-blue-300 opacity-60 mb-2 uppercase tracking-[0.2em] font-medium">현재 레벨</p>
          <div className="text-center space-y-0.5">
            <p className="text-lg font-light leading-tight text-white">{level.title}</p>
            <p className="text-[11px] text-blue-400/70 font-medium tracking-wide">{level.rank}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => setActiveModal('history')}
          className="w-full glass-card py-5 rounded-2xl text-base font-light border border-white/10 hover:bg-white/10 transition-all"
        >
          기록한 메모보기
        </button>

        <button
          onClick={() => setActiveModal('guide')}
          className="w-full glass-card py-5 rounded-2xl text-base font-light border border-white/10 hover:bg-white/10 transition-all text-blue-100/90"
        >
          현존하세요 가이드
        </button>
        
        <button
          onClick={onExit}
          className="w-full bg-white/10 py-5 rounded-2xl text-base font-light border border-white/20 hover:bg-white/20 transition-all shadow-lg"
        >
          앱 종료하기
        </button>

        <button
          onClick={() => setActiveModal('analysis')}
          className="w-full py-3 text-xs font-light text-white/40 hover:text-white/80 transition-all"
        >
          나의 현존의식 분석
        </button>
      </div>

      {activeModal === 'history' && (
        <HistoryModal history={history} onClose={() => setActiveModal(null)} onDeleteRecord={onDeleteRecord} />
      )}
      {activeModal === 'analysis' && (
        <AnalysisModal emotionStats={emotionStats} onClose={() => setActiveModal(null)} onReset={onReset} />
      )}
      {activeModal === 'guide' && (
        <GuideModal onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
};

export default EndingPage;
