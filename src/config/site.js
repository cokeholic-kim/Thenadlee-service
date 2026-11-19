import seo from '../seo/seo.json';

// 사이트 공통 정보. 주소·연락처는 .env.production / .env.local 에서 주입, 검색 노출 문구는 seo.json (빌드 시 페이지별 HTML 생성에도 사용)
export const SITE_NAME = seo.siteName;
export const SITE_URL = process.env.REACT_APP_SITE_URL || '';
export const CONTACT_EMAIL = process.env.REACT_APP_CONTACT_EMAIL || '';
export const DEFAULT_TITLE = seo.defaultTitle;
export const DEFAULT_DESCRIPTION = seo.defaultDescription;
