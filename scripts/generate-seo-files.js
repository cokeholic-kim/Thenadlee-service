/**
 * 빌드 후 build/robots.txt 생성, 검색 사이트 소유 확인 태그를 build/index.html 에 넣음 (npm run build 의 postbuild 단계)
 *   사이트맵(/sitemap.xml)은 서버(PHP)가 요청할 때마다 DB 기준으로 만듦 (back SitemapService) → 여행지·공개 일정이 바뀌면 바로 반영
 *   사이트 주소는 REACT_APP_SITE_URL (환경변수 또는 .env.production) 기준
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

function buildRobots(siteUrl) {
    const disallow = DISALLOW_PATHS.map((rule) => `Disallow: ${rule}`);
    return ['User-agent: *', 'Allow: /', ...disallow, '', `Sitemap: ${siteUrl}/sitemap.xml`, ''].join('\n');
}

// 값에 따옴표·꺾쇠가 섞여도 태그가 깨지지 않게 영문·숫자·-_ 만 허용
function addVerificationTags() {
    const tags = VERIFICATION_TAGS
        .map((tag) => ({ ...tag, value: (process.env[tag.env] || '').replace(/[^A-Za-z0-9_-]/g, '') }))
        .filter((tag) => tag.value)
        .map((tag) => `<meta name="${tag.name}" content="${tag.value}">`);
    if (tags.length === 0) return 0;
    const indexPath = path.join(BUILD_DIR, 'index.html');
    fs.writeFileSync(indexPath, fs.readFileSync(indexPath, 'utf8').replace('</head>', `${tags.join('')}</head>`));
    return tags.length;
}

function main() {
    const siteUrl = resolveSiteUrl();
    fs.writeFileSync(path.join(BUILD_DIR, 'robots.txt'), buildRobots(siteUrl));
    console.log(`robots.txt 생성 완료 (${siteUrl}), 검색 사이트 소유 확인 태그 ${addVerificationTags()}개`);
}

main();
