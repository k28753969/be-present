
import { EMOTION_SCORES } from '../constants';

/**
 * 현존성 점수 계산 알고리즘
 * 향후 여기에 더 복잡한 인지 부하 측정 로직이 추가될 수 있습니다.
 */
export const calculatePoints = (emotion: string, weight: number): number => {
  const basePoints = EMOTION_SCORES[emotion] || 0;
  return Math.round(basePoints * weight);
};

/**
 * 로컬 스토리지 키 정의
 */
export const STORAGE_KEYS = {
  HISTORY: 'presence_history',
  ACC_SCORE: 'presence_acc_score',
  ACC_COUNT: 'presence_acc_count',
  EMOTION_STATS: 'presence_emotion_stats',
  LAST_EXIT: 'presence_last_exit',
};

/**
 * 데이터 포맷팅 유틸리티
 */
export const formatTimestamp = (date: Date): string => {
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
