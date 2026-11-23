// 장소 해시태그 (서버 tag): 장소 응답의 tags = [{ key, name, icon, title, official, mine }]
//   key: 추천 페이지 주소 이름 (공식 태그는 kids·rainy 등, 회원이 만든 태그는 t{id})
export const RAINY_TAG = 'rainy';
// 관리자가 아이콘을 정하지 않은 태그의 페이지·링크 아이콘
export const DEFAULT_TAG_ICON = '🏷️';

export const hasTag = (spot, key) => (spot.tags || []).some((tag) => tag.key === key);

export const tagText = (tag) => `#${tag.name}`;

// 좁은 카드에는 아이콘이 있는 공식 태그만
export const iconTags = (tags = []) => tags.filter((tag) => tag.official && tag.icon);

/** 추천 페이지 제목에 쓰는 이름 (관리자가 정한 제목, 없으면 "#이름 장소") */
export const tagPageName = (tag) => tag.title || `#${tag.name} 장소`;

const byOfficialThenCount = (a, b) => Number(b.official) - Number(a.official) || b.count - a.count;

/** 장소 목록에 있는 태그와 장소 수 (공식 먼저, 많이 달린 순) */
export const countTags = (spots) => {
    const byKey = new Map();
    spots.forEach((spot) => (spot.tags || []).forEach((tag) => {
        const current = byKey.get(tag.key) || { ...tag, count: 0 };
        byKey.set(tag.key, { ...current, count: current.count + 1 });
    }));
    return [...byKey.values()].sort(byOfficialThenCount);
};
