// 사이트 공통 정보. 주소·연락처는 .env.production / .env.local 에서 주입
export const SITE_NAME = '더 나들이';
export const SITE_URL = process.env.REACT_APP_SITE_URL || '';
export const CONTACT_EMAIL = process.env.REACT_APP_CONTACT_EMAIL || '';
export const DEFAULT_TITLE = '더 나들이 - 여행 일정 플래너';
export const DEFAULT_DESCRIPTION =
    '가고 싶은 곳을 지도에 담고 순서를 바꿔 보며 나만의 여행 동선을 만드는 여행 플래너, 더 나들이. 제주·싱가포르·하얼빈·밴쿠버의 추천 장소와 월별 여행 정보, 날씨를 한곳에서 확인하세요.';
