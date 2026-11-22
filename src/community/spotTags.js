// 장소 상황 태그 (서버 SpotTag 와 같은 값, 장소마다 여러 개). 배열 순서가 화면 순서
export const SPOT_TAGS = [
    { value: 'KIDS', label: '아이와 함께', icon: '👶' },
    { value: 'RAINY', label: '비 오는 날', icon: '☔' },
    { value: 'NIGHT', label: '야경·밤', icon: '🌙' },
    { value: 'FREE', label: '무료', icon: '🆓' },
];

const BY_VALUE = Object.fromEntries(SPOT_TAGS.map((tag) => [tag.value, tag]));

/** 장소의 태그를 화면 순서대로 (모르는 값은 뺌) */
export const spotTagList = (tags = []) => SPOT_TAGS.filter((tag) => tags.includes(tag.value));

export const tagLabel = (value) => BY_VALUE[value]?.label || '';

// 목록에 있는 태그만 장소 수와 함께 (필터 버튼용)
export const countTags = (spots) => SPOT_TAGS
    .map((tag) => ({ ...tag, count: spots.filter((spot) => (spot.tags || []).includes(tag.value)).length }))
    .filter((tag) => tag.count > 0);
