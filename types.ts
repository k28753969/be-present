
export enum Step {
  INTRO = 'INTRO',
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
  weight: number; 
  isDeleted?: boolean;
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

export interface SessionData {
  thoughtType?: string;
  emotion?: string;
  weight?: number;
}

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}
