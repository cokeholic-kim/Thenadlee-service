/**
 * 빌드 후 build/robots.txt, build/sitemap.xml 생성 (npm run build 의 postbuild 단계)
 * 사이트 주소는 REACT_APP_SITE_URL (환경변수 또는 .env.production) 기준
 */
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const BUILD_DIR = path.join(ROOT_DIR, 'build');
// CRA 운영 빌드와 같은 우선순위 (index.html 의 %REACT_APP_SITE_URL% 과 같은 값이 되도록)
const ENV_FILES = ['.env.production.local', '.env.local', '.env.production', '.env'];
const SITE_URL_KEY = 'REACT_APP_SITE_URL';

// 검색엔진에 알릴 공개 페이지 (src/seo/pageMeta.js 의 색인 대상과 맞출 것)
const SITEMAP_PAGES = [
    { path: '/', changefreq: 'weekly', priority: '1.0' },
    { path: '/map/Jeju', changefreq: 'weekly', priority: '0.9' },
    { path: '/map/Singapore', changefreq: 'weekly', priority: '0.9' },
    { path: '/map/Harbin', changefreq: 'weekly', priority: '0.9' },
    { path: '/map/Vancouver', changefreq: 'weekly', priority: '0.9' },
    { path: '/privacy', changefreq: 'yearly', priority: '0.3' },
    { path: '/terms', changefreq: 'yearly', priority: '0.3' },
];

// 검색 결과에 나올 필요 없는 경로 (API, 회원 화면)
const DISALLOW_PATHS = ['/back/', '/login', '/join', '/findPass', '/mypage', '/admin', '/groups', '/invite'];

function readEnvValue(filePath, key) {
    if (!fs.existsSync(filePath)) return '';
    const line = fs.readFileSync(filePath, 'utf8').split(/\r?\n/).find((row) => row.startsWith(`${key}=`));
    return line ? line.slice(key.length + 1).trim() : '';
}

function resolveSiteUrl() {
    const fromEnv = process.env[SITE_URL_KEY];
    const fromFile = ENV_FILES.map((file) => readEnvValue(path.join(ROOT_DIR, file), SITE_URL_KEY)).find(Boolean);
    const siteUrl = (fromEnv || fromFile || '').replace(/\/+$/, '');
    if (!siteUrl) {
        throw new Error(`${SITE_URL_KEY} 가 설정되지 않아 robots.txt / sitemap.xml 을 만들 수 없습니다.`);
    }
    return siteUrl;
}

function buildRobots(siteUrl) {
    const disallow = DISALLOW_PATHS.map((rule) => `Disallow: ${rule}`);
    return ['User-agent: *', 'Allow: /', ...disallow, '', `Sitemap: ${siteUrl}/sitemap.xml`, ''].join('\n');
}

function buildSitemap(siteUrl, lastmod) {
    const urls = SITEMAP_PAGES.map((page) => [
        '  <url>',
        `    <loc>${siteUrl}${page.path}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <changefreq>${page.changefreq}</changefreq>`,
        `    <priority>${page.priority}</priority>`,
        '  </url>',
    ].join('\n'));
    return ['<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...urls, '</urlset>', ''].join('\n');
}

function main() {
    const siteUrl = resolveSiteUrl();
    const lastmod = new Date().toISOString().slice(0, 10);
    fs.writeFileSync(path.join(BUILD_DIR, 'robots.txt'), buildRobots(siteUrl));
    fs.writeFileSync(path.join(BUILD_DIR, 'sitemap.xml'), buildSitemap(siteUrl, lastmod));
    console.log(`robots.txt, sitemap.xml 생성 완료 (${siteUrl})`);
}

main();
