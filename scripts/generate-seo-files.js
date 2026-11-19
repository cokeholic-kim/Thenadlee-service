/**
 * 빌드 후 build/robots.txt, build/sitemap.xml 생성 (npm run build 의 postbuild 단계)
 * 사이트 주소는 REACT_APP_SITE_URL (환경변수 또는 .env.production) 기준
 */
const fs = require('fs');
const path = require('path');
const { BUILD_DIR, resolveSiteUrl } = require('./site-url');

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
