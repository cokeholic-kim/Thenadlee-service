import { CATEGORY_MIN_SPOTS, CATEGORY_NAMES, CITY_NAMES } from '../seo/pageMeta';
import { countCategories } from '../community/spotCategories';
import { spotPageOptions } from './spotPageKind';

export const categoryPagePath = (cityName, value) => `/spots/${cityName}/${value.toLowerCase()}`;

/** 여행지 장소 중 종류별 페이지가 있는(장소가 기준 수 이상인) 종류: [{ value, icon, count, name, path }] */
export const categoryPageLinks = (cityName, spots) => countCategories(spots)
    .filter((category) => category.count >= CATEGORY_MIN_SPOTS)
    .map((category) => ({ ...category, name: CATEGORY_NAMES[category.value.toLowerCase()] || category.label, path: categoryPagePath(cityName, category.value) }));

/** "제주 자연·풍경 명소" 처럼 화면에 보이는 이름 */
export const categoryPageTitle = (cityName, link) => `${CITY_NAMES[cityName] || cityName} ${link.name}`;

/** 종류·상황 태그 페이지 중 장소가 기준 수 이상인 것 (지도 "여행 tip" 링크용, 종류 → 상황 순) */
export const spotPageLinks = (cityName, spots) => spotPageOptions(spots)
    .filter((option) => option.count >= CATEGORY_MIN_SPOTS)
    .map((option) => ({ ...option, path: `/spots/${cityName}/${option.slug}` }));
