
import { Question } from './types';

export const QUESTIONS: Question[] = [
  {
    id: 'Q0',
    text: '알아차린 그 생각은?',
    options: [
      { label: '몇 분 전에 지나가고 지금은 없다.', value: '0.2', nextAction: 'next' },
      { label: '방금 전까지 있었고 지금은 없다.', value: '0.5', nextAction: 'next' },
      { label: '그 생각을 하는 중에 앱을 열었다.', value: '1.0', nextAction: 'next' },
      { label: '생각이 막 시작되는 순간에 앱을 열었다.', value: '1.3', nextAction: 'next' }
    ]
  },
  {
    id: 'Q1',
    text: '그 생각의 시점은?',
    options: [
      { label: '과거에 관한 생각', value: '과거', nextAction: 'next' },
      { label: '현재 일어나고 있는 상황에 관한 생각', value: '현재', nextAction: 'next' },
      { label: '미래에 일어날 수도 있는 일 (상상이나 공상)', value: '미래', nextAction: 'next' }
    ]
  },
  {
    id: 'Q2',
    text: '그 생각으로 인해 느껴지는 감정은 어떤가요?',
    options: [
      { label: '부끄럽고 챙피함, "비굴하다."', value: '수치심', nextAction: 'end' },
      { label: '미안함, "내가 잘못했어."', value: '죄의식', nextAction: 'end' },
      { label: '포기, "어쩔수 없다. 절망적이야."', value: '무기력', nextAction: 'end' },
      { label: '슬픔, "눈물이 날 것 같아."', value: '슬픔', nextAction: 'end' },
      { label: '해당사항 없음', value: 'none', nextAction: 'next' }
    ]
  },
  {
    id: 'Q3',
    text: '해당하는 것이 없군요. 그럼 다음 중에 있나요?',
    options: [
      { label: '근심, "걱정된다. 두렵다."', value: '두려움', nextAction: 'end' },
      { label: '욕망, "~하고싶어 못 참겠어."', value: '욕망', nextAction: 'end' },
      { label: '분노, "울화가 치민다."', value: '분노', nextAction: 'end' },
      { label: '경멸, 무시, 비판, "웃기시네~"', value: '자만심', nextAction: 'end' },
      { label: '해당사항 없음', value: 'none', nextAction: 'next' }
    ]
  },
  {
    id: 'Q4',
    text: '좋습니다. 그럼 혹시 다음 중에 있나요?',
    options: [
      { label: '"화이팅!, 난 할 수 있다. 용기를 내!"', value: '용기', nextAction: 'end' },
      { label: '"이래도 좋고 저래도 좋고 다 좋아~"', value: '중용', nextAction: 'end' },
      { label: '"네가 잘 되길 바래. 내가 도와줄께."', value: '자발성', nextAction: 'end' },
      { label: '이성적인, 자비로운, 감사와 평화', value: '포용', nextAction: 'end' },
      { label: '기타', value: 'none', nextAction: 'end' }
    ]
  }
];

export const EMOTION_SCORES: Record<string, number> = {
  '수치심': 45,
  '죄의식': 33,
  '무기력': 24,
  '슬픔': 20,
  '두려움': 17,
  '욕망': 16,
  '분노': 15,
  '자만심': 14,
  '용기': 12,
  '중용': 10,
  '자발성': 8,
  '포용': 6,
  '상위의식': 4
};
