import { KAKAO_JS_KEY } from '../map/mapProvider';

// 카카오 JavaScript SDK (버전 고정 + 무결성 확인, 지도 SDK 와 같은 JS 키 사용)
const SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js';
const SDK_INTEGRITY = 'sha384-DKYJZ8NLiK8MN4/C5P2dtSmLQ4KwPaoqAfyA/DfmEc1VDxu4yyC7wy6K1Hs90nka';
// 카카오톡 텍스트 메시지 최대 글자 수
const TEXT_MAX_LENGTH = 200;
const INVITE_IMAGE_PATH = '/file/imgs/mainN7.jpg';

let sdkPromise = null;

export const isKakaoShareAvailable = () => Boolean(KAKAO_JS_KEY);

const loadSdk = () => {
    if (window.Kakao?.isInitialized()) return Promise.resolve(window.Kakao);
    sdkPromise = sdkPromise || new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = SDK_URL;
        script.integrity = SDK_INTEGRITY;
        script.crossOrigin = 'anonymous';
        script.onload = () => {
            if (!window.Kakao.isInitialized()) window.Kakao.init(KAKAO_JS_KEY);
            resolve(window.Kakao);
        };
        script.onerror = () => { sdkPromise = null; reject(new Error('카카오톡 공유를 불러오지 못했어요.')); };
        document.head.appendChild(script);
    });
    return sdkPromise;
};

// PC 의 공유 창(윈도우 공유 등)에는 카카오톡이 없을 수 있어, 이미지 공유 창은 휴대폰·태블릿에서만 사용
const isTouchDevice = () => window.matchMedia('(pointer: coarse)').matches;
const absoluteUrl = (path) => `${window.location.origin}${path}`;
const shorten = (text) => (text.length > TEXT_MAX_LENGTH ? `${text.slice(0, TEXT_MAX_LENGTH - 1)}…` : text);

/** 모임 초대 링크를 카카오톡으로 보냄 (받은 사람도 로그인해야 참여할 수 있음) */
export const shareInvite = async ({ groupName, inviteUrl }) => {
    const Kakao = await loadSdk();
    const link = { mobileWebUrl: inviteUrl, webUrl: inviteUrl };
    Kakao.Share.sendDefault({
        objectType: 'feed',
        content: { title: `${groupName} 모임에 초대합니다`, description: '더 나들이에서 함께 여행지와 동선을 정해요.', imageUrl: absoluteUrl(INVITE_IMAGE_PATH), link },
        buttons: [{ title: '모임 참여하기', link }],
    });
};

/**
 * 카드 이미지(정산서·여행 요약) 공유
 *   휴대폰·태블릿에서 파일 공유가 되는 브라우저: 공유 창으로 이미지 자체를 보냄 (카카오톡 등 고른 앱으로, 서버에 올리지 않음)
 *   그 외(PC): 카카오톡 메시지로 요약 글과 모임 링크를 보냄 (링크는 모임 멤버만 열 수 있음)
 */
export const shareCard = async ({ blob, fileName, title, text, path }) => {
    const file = new File([blob], fileName, { type: 'image/png' });
    if (isTouchDevice() && navigator.canShare?.({ files: [file] })) {
        try {
            await navigator.share({ files: [file], title, text });
        } catch (error) {
            if (error.name !== 'AbortError') throw error;
        }
        return;
    }
    const Kakao = await loadSdk();
    const url = absoluteUrl(path);
    Kakao.Share.sendDefault({ objectType: 'text', text: shorten(`${title}\n${text}`), link: { mobileWebUrl: url, webUrl: url }, buttonTitle: '모임에서 보기' });
};
