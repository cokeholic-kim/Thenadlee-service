/**
 * 빌드 후 공개 페이지별 HTML 을 미리 만듦 (build/prerender/...) — npm run build 의 postbuild 단계
 *   검색 로봇(네이버·다음)과 링크 미리보기(카카오톡 등)는 JavaScript 를 거의 실행하지 않아 SPA 의 빈 index.html 만 보므로,
 *   페이지마다 제목·설명·대표 주소·대표 사진·구조화 데이터·본문 요약을 넣어 둠 (React 가 뜨면 본문은 실제 화면으로 바뀜)
 *   제공은 root/.htaccess 가 담당 (/ → prerender/index.html, /map/도시 → prerender/map/도시.html, /spots/도시/종류 → prerender/spots/도시/종류.html)
 * 데이터는 운영 API(/back/cities, /back/place/spot/{도시})에서 받고, 받지 못하면 seo.json 의 도시 이름으로 제목·설명만 만듦
 */
const fs = require('fs');
const path = require('path');
const seo = require('../src/seo/seo.json');
const { BUILD_DIR, resolveSiteUrl } = require('./site-url');

const OUT_DIR = path.join(BUILD_DIR, 'prerender');
const API_TIMEOUT_MS = 10000;
const SPOT_SUMMARY_LENGTH = 90;
const PRERENDER_STYLE = '<style>.prerender{max-width:760px;margin:40px auto;padding:0 16px;color:#333;line-height:1.7;font-family:sans-serif}.prerender li{margin:6px 0}</style>';

const escapeHtml = (text) => String(text ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const summary = (text, length) => {
    const clean = String(text || '').replace(/\s+/g, ' ').trim();
    return clean.length > length ? `${clean.slice(0, length)}…` : clean;
};
const absolute = (siteUrl, url) => (!url ? '' : /^https?:\/\//.test(url) ? url : `${siteUrl}${url}`);

async function fetchBody(url) {
    const response = await fetch(url, { signal: AbortSignal.timeout(API_TIMEOUT_MS) });
    if (!response.ok) throw new Error(`${url} → ${response.status}`);
    return (await response.json()).body;
}

// 공개 여행지와 도시별 추천 장소 (API 실패 시 seo.json 의 도시 목록, 장소 없음)
//   도시별 장소 요청 실패도 여기서 잡도록 await 로 기다림 (await 없이 넘기면 try 밖에서 실패해 빌드가 멈춤)
async function loadCities(apiUrl) {
    try {
        const cities = await fetchBody(`${apiUrl}/cities`);
        return await Promise.all(cities.map(async (city) => ({
            ...city,
            spots: await fetchBody(`${apiUrl}/place/spot/${encodeURIComponent(city.name)}`),
            itineraries: await fetchBody(`${apiUrl}/cities/${encodeURIComponent(city.name)}/itineraries`).catch(() => []),
        })));
    } catch (error) {
        console.warn(`[prerender] 운영 API 를 읽지 못해 제목·설명만 만듭니다: ${error.message}`);
        return Object.keys(seo.cityNames).map((name) => ({ name, displayName: seo.cityNames[name], description: '', spots: [], itineraries: [] }));
    }
}

// head 의 meta·canonical 값 교체 (index.html 에 이미 있는 태그만 대상)
function setMeta(html, attribute, key, value) {
    const pattern = new RegExp(`(<meta[^>]*${attribute}="${key.replace(/[.:]/g, '\\$&')}"[^>]*content=")[^"]*(")`);
    return html.replace(pattern, `$1${escapeHtml(value)}$2`);
}

function applyHead(template, page) {
    let html = template.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(page.title)}</title>`);
    html = html.replace(/(<link[^>]*rel="canonical"[^>]*href=")[^"]*(")/, `$1${escapeHtml(page.url)}$2`);
    const metas = [['name', 'description', page.description], ['property', 'og:title', page.title], ['property', 'og:description', page.description],
        ['property', 'og:url', page.url], ['name', 'twitter:title', page.title], ['name', 'twitter:description', page.description]];
    if (page.image) metas.push(['property', 'og:image', page.image], ['name', 'twitter:image', page.image]);
    html = metas.reduce((current, [attribute, key, value]) => setMeta(current, attribute, key, value), html);
    const jsonLd = page.jsonLd ? `<script type="application/ld+json">${JSON.stringify(page.jsonLd).replace(/</g, '\\u003c')}</script>` : '';
    return html.replace('</head>', `${PRERENDER_STYLE}${jsonLd}</head>`).replace('<div id="root"></div>', `<div id="root">${page.body}</div>`);
}

function cityPage(siteUrl, city) {
    const cityName = seo.cityNames[city.name] || city.displayName || city.name;
    const title = seo.cityTitle.replaceAll('{city}', cityName);
    const url = `${siteUrl}/map/${encodeURIComponent(city.name)}`;
    const spots = city.spots.map((spot) => `<li><strong>${escapeHtml(spot.spotName)}</strong> ${escapeHtml(summary(spot.description, SPOT_SUMMARY_LENGTH))}</li>`).join('');
    // 공개 추천 일정 링크 (검색 로봇이 /itinerary/{id} 페이지를 찾아가도록)
    const plans = city.itineraries.map((plan) => `<li><a href="/itinerary/${plan.id}">${escapeHtml(plan.title)}</a> ${plan.dayCount}일 · ${escapeHtml(plan.authorNickName)}</li>`).join('');
    const categories = categoryGroups(city).map(({ slug, spots: list }) => `<li><a href="/spots/${encodeURIComponent(city.name)}/${slug}">${escapeHtml(fillCategory(seo.categoryTitle, cityName, slug, list.length))}</a></li>`).join('');
    return {
        file: `map/${city.name}.html`, url, title: `${title} | ${seo.siteName}`, image: absolute(siteUrl, city.titleImageUrl),
        description: seo.cityDescription.replaceAll('{city}', cityName),
        jsonLd: cityJsonLd(city, url, absolute(siteUrl, city.titleImageUrl)),
        body: `<main class="prerender"><h1>${escapeHtml(title)}</h1><p>${escapeHtml(city.description)}</p>`
            + (spots ? `<h2>${escapeHtml(cityName)} 추천 여행지</h2><ul>${spots}</ul>` : '')
            + (categories ? `<h2>${escapeHtml(cityName)} 종류별 추천</h2><ul>${categories}</ul>` : '')
            + (plans ? `<h2>${escapeHtml(cityName)} 추천 일정</h2><ul>${plans}</ul>` : '') + `<p><a href="/">${escapeHtml(seo.siteName)} 홈</a></p></main>`,
    };
}

// 장소가 seo.categoryMinSpots 곳 이상인 종류만 (서버 사이트맵의 seo.categoryMinSpots 와 같은 기준)
function categoryGroups(city) {
    return Object.keys(seo.categoryNames)
        .map((slug) => ({ slug, spots: city.spots.filter((spot) => String(spot.category || '').toLowerCase() === slug) }))
        .filter((group) => group.spots.length >= seo.categoryMinSpots);
}

function fillCategory(text, cityName, slug, count) {
    return text.replaceAll('{city}', cityName).replaceAll('{category}', seo.categoryNames[slug]).replaceAll('{count}', String(count));
}

function categoryPage(siteUrl, city, { slug, spots }) {
    const cityName = seo.cityNames[city.name] || city.displayName || city.name;
    const title = fillCategory(seo.categoryTitle, cityName, slug, spots.length);
    const items = spots.map((spot) => `<li><strong>${escapeHtml(spot.spotName)}</strong> ${escapeHtml(summary(spot.description, SPOT_SUMMARY_LENGTH))}</li>`).join('');
    const mapLink = `/map/${encodeURIComponent(city.name)}?category=${slug.toUpperCase()}`;
    return {
        file: `spots/${city.name}/${slug}.html`, url: `${siteUrl}/spots/${encodeURIComponent(city.name)}/${slug}`, title: `${title} | ${seo.siteName}`,
        description: fillCategory(seo.categoryDescription, cityName, slug, spots.length), image: absolute(siteUrl, spots.find((spot) => spot.imageUrl)?.imageUrl),
        body: `<main class="prerender"><h1>${escapeHtml(title)}</h1><ul>${items}</ul><p><a href="${mapLink}">지도에 담아 일정 만들기</a> · `
            + `<a href="/map/${encodeURIComponent(city.name)}">${escapeHtml(seo.cityTitle.replaceAll('{city}', cityName))}</a></p></main>`,
    };
}

function cityJsonLd(city, url, image) {
    return {
        '@context': 'https://schema.org', '@type': 'TouristDestination', name: city.displayName || city.name, url,
        ...(city.description ? { description: city.description } : {}), ...(image ? { image } : {}),
        includesAttraction: city.spots.map((spot) => ({
            '@type': 'TouristAttraction', name: spot.spotName,
            geo: { '@type': 'GeoCoordinates', latitude: spot.lat, longitude: spot.lon },
        })),
    };
}

function homePage(siteUrl, cities) {
    const links = cities.map((city) => {
        const cityName = seo.cityNames[city.name] || city.displayName || city.name;
        return `<li><a href="/map/${encodeURIComponent(city.name)}">${escapeHtml(seo.cityTitle.replaceAll('{city}', cityName))}</a> ${escapeHtml(city.displayName || '')}</li>`;
    }).join('');
    return {
        file: 'index.html', url: `${siteUrl}/`, title: seo.defaultTitle, description: seo.defaultDescription,
        body: `<main class="prerender"><h1>${escapeHtml(seo.defaultTitle)}</h1><p>${escapeHtml(seo.defaultDescription)}</p><h2>여행지</h2><ul>${links}</ul></main>`,
    };
}

function policyPage(siteUrl, page) {
    return {
        file: `${page.path.slice(1)}.html`, url: `${siteUrl}${page.path}`, title: `${page.title} | ${seo.siteName}`, description: page.description,
        body: `<main class="prerender"><h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.description)}</p></main>`,
    };
}

async function main() {
    const siteUrl = resolveSiteUrl();
    const template = fs.readFileSync(path.join(BUILD_DIR, 'index.html'), 'utf8');
    const cities = await loadCities((process.env.PRERENDER_API_URL || `${siteUrl}/back`).replace(/\/+$/, ''));
    const categoryPages = cities.flatMap((city) => categoryGroups(city).map((group) => categoryPage(siteUrl, city, group)));
    const pages = [homePage(siteUrl, cities), ...cities.map((city) => cityPage(siteUrl, city)), ...categoryPages, ...Object.values(seo.pages).map((page) => policyPage(siteUrl, page))];
    pages.forEach((page) => {
        const target = path.join(OUT_DIR, page.file);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, applyHead(template, page));
    });
    console.log(`[prerender] ${pages.length}개 페이지 생성 (장소 ${cities.reduce((sum, city) => sum + city.spots.length, 0)}곳)`);
}

main().catch((error) => {
    console.error('[prerender] 실패', error);
    process.exit(1);
});
