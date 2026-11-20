// 구글 애드센스 설정 (빌드 환경변수 → GitHub Variables). 값이 없으면 광고 스크립트를 전혀 불러오지 않음
export const ADSENSE_CLIENT = process.env.REACT_APP_ADSENSE_CLIENT || '';

// 광고 단위(슬롯) ID: 애드센스 화면에서 "디스플레이 광고"를 만들면 나오는 숫자
export const ADSENSE_SLOTS = {
    main: process.env.REACT_APP_ADSENSE_SLOT_MAIN || '',
    itinerary: process.env.REACT_APP_ADSENSE_SLOT_ITINERARY || '',
};

const CLIENT_PATTERN = /^ca-pub-\d+$/;
const SLOT_PATTERN = /^\d+$/;

export const isAdsEnabled = () => CLIENT_PATTERN.test(ADSENSE_CLIENT);
export const isValidSlot = (slot) => isAdsEnabled() && SLOT_PATTERN.test(slot || '');
