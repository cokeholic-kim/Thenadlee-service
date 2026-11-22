// 하루 일정의 장소 종류 구성과 안내 한 가지 (지도 화면 선택목록 아래 "구성 안내")
import { SPOT_CATEGORIES, categoryIcon, categoryLabel } from '../community/spotCategories';

// 이만큼 담았을 때부터 안내 (1~2곳일 때는 아직 고르는 중이라 보지 않음)
const HINT_MIN_SPOTS = 3;
const FOOD = 'FOOD';
const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;
const FINAL_CONSONANT_COUNT = 28;

// 받침이 있으면 "이에요", 없으면 "예요" (예: 자연·풍경이에요, 마을·거리예요)
const withIeyo = (word) => {
    const code = word.charCodeAt(word.length - 1);
    const hasFinal = code >= HANGUL_START && code <= HANGUL_END && (code - HANGUL_START) % FINAL_CONSONANT_COUNT !== 0;
    return `${word}${hasFinal ? '이에요' : '예요'}`;
};

/** 그날 담은 장소의 종류별 수 (미분류는 빼고, 종류 순서대로) */
export const countPlanCategories = (spots) => SPOT_CATEGORIES
    .map((category) => ({ ...category, count: spots.filter((spot) => spot.category === category.value).length }))
    .filter((category) => category.count > 0);

const foodHint = (spots, available) => {
    if (spots.some((spot) => spot.category === FOOD) || !available.has(FOOD)) return null;
    return { message: '먹을 곳이 없어요. 점심·저녁 먹을 곳을 넣어 보세요.', category: FOOD, actionLabel: `${categoryIcon(FOOD)} ${categoryLabel(FOOD)} 보기` };
};

// 모두 한 종류면, 추천 목록에 남은 다른 종류 중 가장 많은 것을 권함
const varietyHint = (counts, available) => {
    if (counts.length !== 1) return null;
    const only = counts[0].value;
    const other = [...available.entries()].filter(([value]) => value !== only).sort((a, b) => b[1] - a[1])[0];
    if (!other) return null;
    return { message: `모두 ${withIeyo(categoryLabel(only))}. 다른 종류도 섞어 보세요.`, category: other[0], actionLabel: `${categoryIcon(other[0])} ${categoryLabel(other[0])} 보기` };
};

/**
 * 안내 한 가지: 먹을 곳 없음 → 한 종류만 → 없음 순
 *   available: 추천 목록에 남은 장소의 종류별 수 (Map) — 고를 장소가 있는 종류만 권함
 */
export const planHint = (spots, available) => {
    if (spots.length < HINT_MIN_SPOTS) return null;
    return foodHint(spots, available) || varietyHint(countPlanCategories(spots), available);
};

export const availableCategories = (spots) => spots.reduce((map, spot) => (spot.category ? map.set(spot.category, (map.get(spot.category) || 0) + 1) : map), new Map());
