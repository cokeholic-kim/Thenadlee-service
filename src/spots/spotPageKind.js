import { SPOT_CATEGORIES, categoryIcon, countCategories } from '../community/spotCategories';
import { SPOT_TAGS, countTags } from '../community/spotTags';
import { spotPageName } from '../seo/pageMeta';

// 추천 페이지 /spots/도시/{slug}: slug 가 장소 종류(nature 등)면 종류 페이지, 상황 태그(rainy 등)면 태그 페이지
export const PAGE_KINDS = { CATEGORY: 'CATEGORY', TAG: 'TAG' };

const categoryPage = (value) => ({
    kind: PAGE_KINDS.CATEGORY, value, slug: value.toLowerCase(), icon: categoryIcon(value),
    matches: (spot) => spot.category === value, mapQuery: `category=${value}`,
});

const tagPage = (tag) => ({
    kind: PAGE_KINDS.TAG, value: tag.value, slug: tag.value.toLowerCase(), icon: tag.icon,
    matches: (spot) => (spot.tags || []).includes(tag.value), mapQuery: `tag=${tag.value}`,
});

/** 주소의 slug → 페이지 정보, 모르는 값이면 null */
export const resolveSpotPage = (slug) => {
    const value = String(slug || '').toUpperCase();
    if (SPOT_CATEGORIES.some((option) => option.value === value)) return categoryPage(value);
    const tag = SPOT_TAGS.find((option) => option.value === value);
    return tag ? tagPage(tag) : null;
};

/** 여행지 장소로 만들 수 있는 페이지 목록 (종류 → 상황 태그 순, 장소 수 포함) */
export const spotPageOptions = (spots) => [
    ...countCategories(spots).map((option) => ({ ...option, kind: PAGE_KINDS.CATEGORY })),
    ...countTags(spots).map((option) => ({ ...option, kind: PAGE_KINDS.TAG })),
].map((option) => ({ ...option, slug: option.value.toLowerCase(), name: spotPageName(option.value.toLowerCase()) }));
