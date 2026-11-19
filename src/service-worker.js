/* eslint-disable no-restricted-globals */
/**
 * PWA 서비스 워커 (CRA 가 빌드 때 이 파일에 앱 파일 목록을 넣어 build/service-worker.js 로 만듦)
 *
 * 기기에 저장하는 것 (모두 누구나 볼 수 있는 공개 파일)
 *   - 앱 화면 파일: JS·CSS·index.html·아이콘·manifest (빌드 때 목록이 정해짐, 새 버전 배포 시 교체)
 *   - 사이트 기본 이미지: /file/imgs/
 * 저장하지 않는 것 (접근 범위 보호)
 *   - /back/* API 응답 전체: 회원·모임·정산·앨범 사진(멤버 전용) 등 로그인 사용자 데이터가 기기에 남지 않도록 항상 네트워크로만
 *   - /file/uploads/, /file/private/: 사용자가 올린 사진 (삭제·권한 변경이 바로 반영되어야 함)
 *   - 지도 타일·외부 API
 */
import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';

const SITE_IMAGE_CACHE = 'site-images';
const SITE_IMAGE_MAX_ENTRIES = 60;
const SITE_IMAGE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
// 화면 이동은 앱 화면(index.html)으로 처리하되, API·파일·확장자가 있는 주소는 제외
const NON_APP_PATH = /^\/(back|file)\/|\/[^/?]+\.[^/]+$/;

clientsClaim();
precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
    ({ request, url }) => request.mode === 'navigate' && url.origin === self.location.origin && !NON_APP_PATH.test(url.pathname),
    createHandlerBoundToURL(`${process.env.PUBLIC_URL}/index.html`),
);

registerRoute(
    ({ url }) => url.origin === self.location.origin && url.pathname.startsWith('/file/imgs/'),
    new CacheFirst({
        cacheName: SITE_IMAGE_CACHE,
        plugins: [new ExpirationPlugin({ maxEntries: SITE_IMAGE_MAX_ENTRIES, maxAgeSeconds: SITE_IMAGE_MAX_AGE_SECONDS })],
    }),
);

// 새 버전 안내에서 "새로고침"을 누르면 기다리던 새 서비스 워커를 바로 적용
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
