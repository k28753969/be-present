
import { Question } from './types';

export const QUESTIONS: Question[] = [
  {
    id: 'Q0',
    text: '지금 알아차린 그 생각과 감정은?',
    options: [
      { label: '몇 분 전에 지나가고 지금은 없다.', value: '0.2', nextAction: 'next' },
      { label: '방금 전까지 있었고 지금은 없다.', value: '0.5', nextAction: 'next' },
      { label: '현재 그 생각과 감정 속에 있다.', value: '1.0', nextAction: 'next' },
      { label: '생각과 감정이 막 시작되려는 순간이다.', value: '1.3', nextAction: 'next' }
    ]
  },
  {
    id: 'Q1',
    text: '지금 하신 그 생각은?',
    options: [
      { label: '과거에 관한 생각', value: '과거', nextAction: 'next' },
      { label: '현재 일어나는 상황에 관한 생각', value: '현재', nextAction: 'next' },
      { label: '미래에 대한 상상 (일어나지 않은 일)', value: '미래', nextAction: 'next' }
    ]
  },
  {
    id: 'Q2',
    text: '그 생각으로 인해 느껴지는 감정은 어떤가요?',
    options: [
      { label: '부끄럽다, 굴욕적이다.', value: '수치심', nextAction: 'end' },
      { label: '미안함, 나 자신을 비난함.', value: '죄의식', nextAction: 'end' },
      { label: '절망스럽다, 포기.', value: '무기력', nextAction: 'end' },
      { label: '슬프다, 눈물이 날 것 같다.', value: '슬픔', nextAction: 'end' },
      { label: '해당사항 없음', value: 'none', nextAction: 'next' }
    ]
  },
  {
    id: 'Q3',
    text: '해당하는 것이 없군요. 그럼 다음 중에 있나요?',
    options: [
      { label: '두렵다, 근심 걱정.', value: '두려움', nextAction: 'end' },
      { label: '욕망, 갈망. 못 참겠다.', value: '욕망', nextAction: 'end' },
      { label: '분노, 화가 치민다.', value: '분노', nextAction: 'end' },
      { label: '경멸, "별것도 아닌게 웃기는군"', value: '자만심', nextAction: 'end' },
      { label: '해당사항 없음', value: 'none', nextAction: 'next' }
    ]
  },
  {
    id: 'Q4',
    text: '좋습니다. 그럼 혹시 다음 중에 있나요?',
    options: [
      { label: '용기를 내자, 화이팅', value: '용기', nextAction: 'end' },
      { label: '이럴 수도 있고 저럴 수도 있고 다 좋아', value: '중용', nextAction: 'end' },
      { label: '잘 되도록 힘을 써주자', value: '자발성', nextAction: 'end' },
      { label: '이성, 사랑, 지혜로운 마음으로 모두 받아들임', value: '포용', nextAction: 'end' },
      { label: '해당사항 없음', value: 'none', nextAction: 'end' }
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
  '용기': 13,
  '중용': 12,
  '자발성': 11,
  '포용': 10,
  '상위의식': 10
};
