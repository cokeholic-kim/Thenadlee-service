// 지도 공급자 선택: 국내 여행지는 카카오맵, 해외는 Google Maps
// 카카오 JavaScript 키가 없으면(설정 전) 국내도 Google 로 표시해서 화면이 깨지지 않게 함
export const MAP_PROVIDERS = { KAKAO: 'kakao', GOOGLE: 'google' };
export const REGIONS = { DOMESTIC: 'DOMESTIC', OVERSEAS: 'OVERSEAS' };

export const KAKAO_JS_KEY = process.env.REACT_APP_KAKAO_JS_KEY;
export const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;

export const providerFor = (region) =>
    (region === REGIONS.DOMESTIC && KAKAO_JS_KEY ? MAP_PROVIDERS.KAKAO : MAP_PROVIDERS.GOOGLE);
