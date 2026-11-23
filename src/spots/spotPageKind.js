import { SPOT_CATEGORIES, categoryIcon, countCategories } from '../community/spotCategories';
import { DEFAULT_TAG_ICON, countTags, hasTag, tagPageName, tagText } from '../community/spotTags';
import { CATEGORY_NAMES } from '../seo/pageMeta';

// 추천 페이지 /spots/도시/{slug}: slug 가 장소 종류(nature 등)면 종류 페이지, 아니면 해시태그 주소 이름(kids·t12 등)
export const PAGE_KINDS = { CATEGORY: 'CATEGORY', TAG: 'TAG' };
// 페이지 안 해시태그 링크 수 (공식 → 많이 달린 순)
const MAX_TAG_LINKS = 15;

const categoryPage = (value) => ({
    kind: PAGE_KINDS.CATEGORY, value, slug: value.toLowerCase(), icon: categoryIcon(value), name: CATEGORY_NAMES[value.toLowerCase()],
    matches: (spot) => spot.category === value, mapQuery: `category=${value}`,
});

const tagPage = (tag) => ({
    kind: PAGE_KINDS.TAG, value: tag.key, slug: tag.key, icon: tag.icon || DEFAULT_TAG_ICON, name: tagPageName(tag),
    matches: (spot) => hasTag(spot, tag.key), mapQuery: `tag=${encodeURIComponent(tag.key)}`,
});

/** 주소의 slug → 페이지 정보 (해시태그는 그 여행지 장소에 달린 것만), 모르면 null */
export const resolveSpotPage = (slug, spots = []) => {
    const text = String(slug || '');
    if (SPOT_CATEGORIES.some((option) => option.value === text.toUpperCase())) return categoryPage(text.toUpperCase());
    const tag = countTags(spots).find((option) => option.key === text.toLowerCase());
    return tag ? tagPage(tag) : null;
};

/** 여행지 장소로 만들 수 있는 페이지 목록 (종류 → 해시태그 순, 장소 수 포함) */
export const spotPageOptions = (spots) => [
    ...countCategories(spots).map((option) => ({ ...option, kind: PAGE_KINDS.CATEGORY, slug: option.value.toLowerCase(), name: CATEGORY_NAMES[option.value.toLowerCase()] || option.label })),
    ...countTags(spots).slice(0, MAX_TAG_LINKS).map((tag) => ({
        value: tag.key, kind: PAGE_KINDS.TAG, slug: tag.key, icon: tag.icon || DEFAULT_TAG_ICON, label: tagText(tag), count: tag.count, name: tagPageName(tag),
    })),
];
