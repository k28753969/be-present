
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
      { label: '부끄럽고 챙피함, 비굴하다.', value: '수치심', nextAction: 'end' },
      { label: '미안함, 내가 잘못했다.', value: '죄의식', nextAction: 'end' },
      { label: '포기, 어쩔수 없다. 절망스럽다.', value: '무기력', nextAction: 'end' },
      { label: '슬프다, 눈물이 날 것 같다.', value: '슬픔', nextAction: 'end' },
      { label: '해당사항 없음', value: 'none', nextAction: 'next' }
    ]
  },
  {
    id: 'Q3',
    text: '해당하는 것이 없군요. 그럼 다음 중에 있나요?',
    options: [
      { label: '근심, 걱정된다. 두렵다.', value: '두려움', nextAction: 'end' },
      { label: '욕망, 갈등, 하고싶어 못 참겠다.', value: '욕망', nextAction: 'end' },
      { label: '분노, 울화가 치민다.', value: '분노', nextAction: 'end' },
      { label: '경멸, 무시, 비판, 웃기시네.', value: '자만심', nextAction: 'end' },
      { label: '해당사항 없음', value: 'none', nextAction: 'next' }
    ]
  },
  {
    id: 'Q4',
    text: '좋습니다. 그럼 혹시 다음 중에 있나요?',
    options: [
      { label: '화이팅!, 할 수 있다. 용기 내자.', value: '용기', nextAction: 'end' },
      { label: '이래도 좋고 저래도 좋고 다 좋아~', value: '중용', nextAction: 'end' },
      { label: '잘 되길 바래. 내가 도와줄께.', value: '자발성', nextAction: 'end' },
      { label: '이성적인, 자비로운, 감사와 평화로운 마음', value: '포용', nextAction: 'end' },
      { label: '해당사항 없음', value: 'none', nextAction: 'end' }
    ]
  }
];

export const EMOTION_SCORES: Record<string, number> = {
  '수치심': 45, '죄의식': 33, '무기력': 24, '슬픔': 20, '두려움': 17,
  '욕망': 16, '분노': 15, '자만심': 14, '용기': 13, '중용': 12,
  '자발성': 11, '포용': 10, '상위의식': 10
};

export const LEVELS = [
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

export const getLevelInfo = (count: number) => {
  return LEVELS.find(l => count >= l.threshold) || LEVELS[LEVELS.length - 1];
};

export const GUIDE_MESSAGES = [
  "'현존하세요'에 오신 것을 진심으로 환영합니다. 이 어플 사용법은 정말 간단합니다.",
  "현재 올라온 마음속 생각을 그 즉시 기록하는 것이 전부입니다.",
  "'내가 지금 이런 생각을 하고 있었구나..' 하고 알아차리는 것이죠.",
  "중요한 건, 생각이 일어난 바로 그 순간 기록해야 한다는 겁니다.",
  "시간이 조금이라도 지난 후에 하면 효과가 많이 떨어져요.",
  "마치 현행범을 현장에서 체포하는 그런 느낌으로 해야 해요.",
  "맹금류가 사냥감을 순식간에 잡아채는 모습을 연상해도 좋아요.",
  "이런걸 왜 해야 하냐구요? 무슨 일기장 같은 거냐구요?",
  "아닙니다...",
  "이 어플은 실로 엄청난 힘을 가지고 있습니다.",
  "바로 현존의식의 힘이라는 것입니다.",
  "현존의식이란 '내가 현재 여기 존재함'을 그 순간 알아차리는 의식상태입니다.",
  "다시 말해, 현재 순간에 어떤 생각에 홀려 있는지 명확히 인지한다는 말과 같은 말입니다.",
  "나도 모르게 수시로 떠오르는 골치 아픈 생각들로 머리 속이 이리저리 복잡할 때 이 어플을 즉시 실행하세요.",
  "이 어플에 생각을 기록하는 순간이 바로 현존의식이 발동한 순간이고, 그 순간부터 당신을 괴롭히는 그 잡생각들은 서서히 힘을 잃고 사라져 갑니다.",
  "물론 얼마후 다시 찾아오겠죠. 그러면 똑같이 또 하면 됩니다. 간단해요.",
  "이렇게 하다보면 결국은 당신의 현존의식이 이깁니다. 그후론 안 찾아옵니다. 아니 못찾아옵니다.",
  "직접 체험해보면 참 신기하다고 느끼실겁니다. 나쁜 생각에 사로잡히지 않는 것이 이렇게 중요한 일일 줄이야...",
  "이러한 훈련을 trait mindfulness 또는 dispositional mindfulness라고 합니다. (Brown, K. W., & Ryan, R. M. 'The benefits of being present: Mindfulness and its role in psychological well-being.', Journal of Personality and Social Psychology)",
  "나를 해치는 무의미한 생각의 그 사라져감, 물러남을 남의 일 보듯이 덤덤한 시선으로 바라만 보세요.",
  "어때요? 어렵지 않겠죠?",
  "그런데 막상 하려고 하면 이게 생각만큼 쉽지가 않습니다.",
  "자 그럼, 백문이 불여일견, 우리 함께 도전해 볼까요?",
  "머리속이 복잡할 때마다 어플을 실행하세요. 목표는 Level 30에 도달하는 것이죠.",
  "자 그럼 출발~"
];
