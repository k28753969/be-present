
export enum Step {
  MEMO = 'MEMO',
  QUESTIONS = 'QUESTIONS',
  ENDING = 'ENDING'
}

export interface MemoRecord {
  id: string;
  timestamp: string;
  content: string;
  thoughtType: string;
  emotion: string;
  weight: number; // 통계 분석을 위한 가중치 필드 추가
}

export interface Question {
  id: string;
  text: string;
  options: {
    label: string;
    value: string;
    nextAction: 'next' | 'end';
  }[];
}
