
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
