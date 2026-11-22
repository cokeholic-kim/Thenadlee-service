// 장소 종류 (서버 SpotCategory 와 같은 값). 배열 순서가 화면 버튼 순서
// color: 지도 핀·범례 색 (흰 숫자가 잘 보이는 진한 색, 경로선 파랑·지도에서 보기 보라와 겹치지 않게)
export const SPOT_CATEGORIES = [
    { value: 'NATURE', label: '자연·풍경', icon: '🌿', color: '#2e7d32' },
    { value: 'HERITAGE', label: '역사·유적', icon: '🏯', color: '#8d5524' },
    { value: 'CULTURE', label: '문화·예술', icon: '🎨', color: '#ad1457' },
    { value: 'VIEW', label: '랜드마크·전망', icon: '🗼', color: '#0d47a1' },
    { value: 'STREET', label: '마을·거리', icon: '🏘️', color: '#e65100' },
    { value: 'MARKET', label: '시장·쇼핑', icon: '🛍️', color: '#00838f' },
    { value: 'FOOD', label: '맛집·카페', icon: '🍜', color: '#c62828' },
    { value: 'ACTIVITY', label: '체험·테마파크', icon: '🎡', color: '#6a1b9a' },
];

export const ALL_CATEGORIES = 'ALL';

const LABELS = Object.fromEntries(SPOT_CATEGORIES.map((category) => [category.value, category.label]));

export const categoryLabel = (value) => LABELS[value] || '';

const ICONS = Object.fromEntries(SPOT_CATEGORIES.map((category) => [category.value, category.icon]));
const DEFAULT_ICON = '📍';

// 사진 없는 장소의 자리표시 아이콘
export const categoryIcon = (value) => ICONS[value] || DEFAULT_ICON;

const COLORS = Object.fromEntries(SPOT_CATEGORIES.map((category) => [category.value, category.color]));
// 종류를 정하지 않은 장소의 핀 색
export const UNCATEGORIZED_COLOR = '#546e7a';

export const categoryColor = (value) => COLORS[value] || UNCATEGORIZED_COLOR;

// 목록에 있는 종류만 장소 수와 함께 (필터 버튼용)
export const countCategories = (spots) => SPOT_CATEGORIES
    .map((category) => ({ ...category, count: spots.filter((spot) => spot.category === category.value).length }))
    .filter((category) => category.count > 0);
