// 장소 종류 (서버 SpotCategory 와 같은 값). 배열 순서가 화면 버튼 순서
export const SPOT_CATEGORIES = [
    { value: 'NATURE', label: '자연·풍경', icon: '🌿' },
    { value: 'HERITAGE', label: '역사·유적', icon: '🏯' },
    { value: 'CULTURE', label: '문화·예술', icon: '🎨' },
    { value: 'VIEW', label: '랜드마크·전망', icon: '🗼' },
    { value: 'STREET', label: '마을·거리', icon: '🏘️' },
    { value: 'MARKET', label: '시장·쇼핑', icon: '🛍️' },
    { value: 'FOOD', label: '맛집·카페', icon: '🍜' },
    { value: 'ACTIVITY', label: '체험·테마파크', icon: '🎡' },
];

export const ALL_CATEGORIES = 'ALL';

const LABELS = Object.fromEntries(SPOT_CATEGORIES.map((category) => [category.value, category.label]));

export const categoryLabel = (value) => LABELS[value] || '';

const ICONS = Object.fromEntries(SPOT_CATEGORIES.map((category) => [category.value, category.icon]));
const DEFAULT_ICON = '📍';

// 사진 없는 장소의 자리표시 아이콘
export const categoryIcon = (value) => ICONS[value] || DEFAULT_ICON;

// 목록에 있는 종류만 장소 수와 함께 (필터 버튼용)
export const countCategories = (spots) => SPOT_CATEGORIES
    .map((category) => ({ ...category, count: spots.filter((spot) => spot.category === category.value).length }))
    .filter((category) => category.count > 0);
