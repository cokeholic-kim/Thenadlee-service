/**
 * 빌드 후 build/robots.txt 생성, 검색 사이트·애드센스 소유 확인 태그를 build/index.html 에 넣음 (npm run build 의 postbuild 단계)
 *   사이트맵(/sitemap.xml)은 서버(PHP)가 요청할 때마다 DB 기준으로 만듦 (back SitemapService) → 여행지·공개 일정이 바뀌면 바로 반영
 *   사이트 주소는 REACT_APP_SITE_URL (환경변수 또는 .env.production) 기준
 *   애드센스 게시자 ID(REACT_APP_ADSENSE_CLIENT)가 있으면 build/ads.txt 도 만듦 (도메인 루트 /ads.txt 로 제공)
 */
const fs = require('fs');
const path = require('path');
const { BUILD_DIR, resolveSiteUrl } = require('./site-url');

// 검색 결과에 나올 필요 없는 경로 (API, 회원 화면)
const DISALLOW_PATHS = ['/back/', '/login', '/join', '/findPass', '/mypage', '/admin', '/groups', '/invite'];
// 검색 사이트 소유 확인 값 (GitHub Variables → 빌드 환경변수, 없으면 넣지 않음)
const VERIFICATION_TAGS = [
    { env: 'REACT_APP_NAVER_SITE_VERIFICATION', name: 'naver-site-verification' },
    { env: 'REACT_APP_GOOGLE_SITE_VERIFICATION', name: 'google-site-verification' },
];
const ADSENSE_CLIENT_PATTERN = /^ca-pub-(\d+)$/;
// 구글이 정한 ads.txt 형식 (마지막 값은 구글의 인증 기관 ID)
const ADS_TXT_LINE = (publisherNumber) => `google.com, pub-${publisherNumber}, DIRECT, f08c47fec0942fa0\n`;

function buildRobots(siteUrl) {
    const disallow = DISALLOW_PATHS.map((rule) => `Disallow: ${rule}`);
    return ['User-agent: *', 'Allow: /', ...disallow, '', `Sitemap: ${siteUrl}/sitemap.xml`, ''].join('\n');
}

// 값에 따옴표·꺾쇠가 섞여도 태그가 깨지지 않게 영문·숫자·-_ 만 허용
function verificationTags() {
    return VERIFICATION_TAGS
        .map((tag) => ({ ...tag, value: (process.env[tag.env] || '').replace(/[^A-Za-z0-9_-]/g, '') }))
        .filter((tag) => tag.value)
        .map((tag) => `<meta name="${tag.name}" content="${tag.value}">`);
}

// 애드센스: 사이트 소유 확인 메타 태그 + ads.txt (게시자 ID 형식이 맞을 때만)
function adsenseTags() {
    const match = (process.env.REACT_APP_ADSENSE_CLIENT || '').match(ADSENSE_CLIENT_PATTERN);
    if (!match) return [];
    fs.writeFileSync(path.join(BUILD_DIR, 'ads.txt'), ADS_TXT_LINE(match[1]));
    return [`<meta name="google-adsense-account" content="ca-pub-${match[1]}">`];
}

function injectHead(tags) {
    if (tags.length === 0) return;
    const indexPath = path.join(BUILD_DIR, 'index.html');
    fs.writeFileSync(indexPath, fs.readFileSync(indexPath, 'utf8').replace('</head>', `${tags.join('')}</head>`));
}

function main() {
    const siteUrl = resolveSiteUrl();
    fs.writeFileSync(path.join(BUILD_DIR, 'robots.txt'), buildRobots(siteUrl));
    const searchTags = verificationTags();
    const adTags = adsenseTags();
    injectHead([...searchTags, ...adTags]);
    console.log(`robots.txt 생성 완료 (${siteUrl}), 검색 사이트 소유 확인 태그 ${searchTags.length}개, 애드센스 ${adTags.length ? '설정됨 (ads.txt 생성)' : '없음'}`);
}

main();
