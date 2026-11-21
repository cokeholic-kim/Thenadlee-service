// 구글 애널리틱스(GA4): 측정 ID(REACT_APP_GA_ID)가 있는 운영 빌드에서만 동작. 회원 정보·회원이 쓴 내용은 보내지 않음
export const GA_ID = process.env.REACT_APP_GA_ID || '';

const GA_ID_PATTERN = /^G-[A-Z0-9]+$/;
const SCRIPT_URL = 'https://www.googletagmanager.com/gtag/js';
const MOBILE_QUERY = '(max-width: 600px)';
// 주소에 든 비밀 값은 가려서 보냄 (초대 토큰 등)
const MASKED_PATHS = [[/^\/invite\/[^/]+/, '/invite/:token']];
// 이 화면에서는 GA 를 아예 불러오지 않음: 처음 불러올 때 GA 가 주소창 주소 그대로 화면 조회를 한 번 보내므로(가린 주소를 지정해도 무시됨)
// 초대 토큰이 든 주소에서 시작하면 토큰이 넘어갈 수 있음
const BLOCKED_PATHS = [/^\/invite\//];
// 행사(이벤트)에 붙일 수 있는 값 (그 밖의 값은 버림)
const ALLOWED_PARAMS = ['city', 'day_count', 'spot_count', 'method', 'tab', 'category'];

let loaded = false;

export const maskPath = (pathname) => MASKED_PATHS.reduce((path, [pattern, replacement]) => path.replace(pattern, replacement), pathname);

// 주소 뒤 ?… 값(모임·일정 번호 등)과 비밀 값을 뺀 전체 주소
const maskedLocation = (pathname) => `${window.location.origin}${maskPath(pathname)}`;

const doNotTrack = () => navigator.doNotTrack === '1' || window.doNotTrack === '1';

export const isAnalyticsEnabled = () => process.env.NODE_ENV === 'production' && GA_ID_PATTERN.test(GA_ID) && !doNotTrack();

// gtag.js 는 dataLayer 에 arguments 객체로 넣은 명령만 처리함 (배열로 넣으면 무시되어 아무것도 전송되지 않음)
function gtag() {
    window.dataLayer = window.dataLayer || [];
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
}

// 처음 한 번 스크립트를 붙임. 이때 GA 가 첫 화면 조회를 스스로 한 번 보냄
const ensureLoaded = () => {
    if (loaded) return false;
    loaded = true;
    const script = document.createElement('script');
    script.async = true;
    script.src = `${SCRIPT_URL}?id=${GA_ID}`;
    document.head.appendChild(script);
    window.gtag = gtag;
    gtag('js', new Date());
    // 자동 수집 이벤트(스크롤 등)도 가린 주소를 쓰도록 기본 주소를 지정
    gtag('config', GA_ID, { page_location: maskedLocation(window.location.pathname) });
    return true;
};

const isBlocked = () => BLOCKED_PATHS.some((pattern) => pattern.test(window.location.pathname));

const deviceType = () => (window.matchMedia?.(MOBILE_QUERY).matches ? 'mobile' : 'desktop');

// 화면 이동 (주소 뒤 ?… 값은 보내지 않음). 첫 화면은 GA 가 불러올 때 스스로 보내므로 두 번 세지 않게 건너뜀
export const trackPage = (pathname) => {
    if (!isAnalyticsEnabled() || isBlocked()) return;
    if (ensureLoaded()) return;
    const location = maskedLocation(pathname);
    // 이후의 모든 이벤트(자동 수집 포함)가 이 주소를 쓰도록 먼저 기본값을 바꿈
    gtag('set', { page_location: location, page_title: document.title });
    gtag('event', 'page_view', { page_location: location, page_title: document.title });
};

const pickAllowed = (params) => Object.fromEntries(Object.entries(params).filter(([key]) => ALLOWED_PARAMS.includes(key)));

// 핵심 행동 (장소 담기·일정 저장 등). 값은 도시 이름·일수·장소 수 같은 집계용만
export const trackEvent = (name, params = {}) => {
    if (!isAnalyticsEnabled() || isBlocked()) return;
    ensureLoaded();
    gtag('event', name, { ...pickAllowed(params), device: deviceType() });
};
