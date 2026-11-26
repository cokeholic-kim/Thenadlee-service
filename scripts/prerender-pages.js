/**
 * 빌드 후 공개 페이지별 HTML 을 미리 만듦 (build/prerender/...) — npm run build 의 postbuild 단계
 *   검색 로봇(네이버·다음)과 링크 미리보기(카카오톡 등)는 JavaScript 를 거의 실행하지 않아 SPA 의 빈 index.html 만 보므로,
 *   페이지마다 제목·설명·대표 주소·대표 사진·구조화 데이터·본문 요약을 넣어 둠 (React 가 뜨면 본문은 실제 화면으로 바뀜)
 *   제공은 root/.htaccess 가 담당 (/ → prerender/index.html, /map/도시 → prerender/map/도시.html, /spots/도시/종류·태그 → prerender/spots/도시/종류·태그.html,
 *   /editors/번호 → prerender/editors/번호.html)
 *   미리 만들지 않은 화면이 받는 기본 index.html 은 대표 주소(canonical)를 빼 둠 (첫 화면 주소로 남아 있으면 검색엔진이 중복으로 봄, 화면이 뜨면 주소별로 넣음)
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
    const categories = categoryGroups(city).map(({ slug, name, spots: list }) => `<li><a href="/spots/${encodeURIComponent(city.name)}/${encodeURIComponent(slug)}">${escapeHtml(fillCategory(seo.categoryTitle, cityName, name, list.length))}</a></li>`).join('');
    return {
        file: `map/${city.name}.html`, url, title: `${title} | ${seo.siteName}`, image: absolute(siteUrl, city.titleImageUrl),
        description: seo.cityDescription.replaceAll('{city}', cityName),
        jsonLd: cityJsonLd(city, url, absolute(siteUrl, city.titleImageUrl)),
        body: `<main class="prerender"><h1>${escapeHtml(title)}</h1><p>${escapeHtml(city.description)}</p>`
            + (spots ? `<h2>${escapeHtml(cityName)} 추천 여행지</h2><ul>${spots}</ul>` : '')
            + (categories ? `<h2>${escapeHtml(cityName)} 테마별 추천</h2><ul>${categories}</ul>` : '')
            + (plans ? `<h2>${escapeHtml(cityName)} 추천 일정</h2><ul>${plans}</ul>` : '') + `<p><a href="/">${escapeHtml(seo.siteName)} 홈</a></p></main>`,
    };
}

// 장소 종류·상황 태그별 묶음 중 장소가 seo.categoryMinSpots 곳 이상인 것만 (서버 사이트맵의 seo.categoryMinSpots 와 같은 기준)
function tagGroups(city) {
    const byKey = new Map();
    city.spots.forEach((spot) => (spot.tags || []).forEach((tag) => {
        const group = byKey.get(tag.key) || { slug: tag.key, name: tag.title || `#${tag.name} 장소`, query: `tag=${encodeURIComponent(tag.key)}`, spots: [] };
        group.spots.push(spot);
        byKey.set(tag.key, group);
    }));
    return [...byKey.values()];
}

function categoryGroups(city) {
    const byCategory = Object.keys(seo.categoryNames).map((slug) => ({
        slug, name: seo.categoryNames[slug], query: `category=${slug.toUpperCase()}`, spots: city.spots.filter((spot) => String(spot.category || '').toLowerCase() === slug),
    }));
    return [...byCategory, ...tagGroups(city)].filter((group) => group.spots.length >= seo.categoryMinSpots);
}

function fillCategory(text, cityName, name, count) {
    return text.replaceAll('{city}', cityName).replaceAll('{category}', name).replaceAll('{count}', String(count));
}

function categoryPage(siteUrl, city, { slug, name, query, spots }) {
    const cityName = seo.cityNames[city.name] || city.displayName || city.name;
    const title = fillCategory(seo.categoryTitle, cityName, name, spots.length);
    const items = spots.map((spot) => `<li><strong>${escapeHtml(spot.spotName)}</strong> ${escapeHtml(summary(spot.description, SPOT_SUMMARY_LENGTH))}</li>`).join('');
    const mapLink = `/map/${encodeURIComponent(city.name)}?${query}`;
    return {
        file: `spots/${city.name}/${slug}.html`, url: `${siteUrl}/spots/${encodeURIComponent(city.name)}/${encodeURIComponent(slug)}`, title: `${title} | ${seo.siteName}`,
        description: fillCategory(seo.categoryDescription, cityName, name, spots.length), image: absolute(siteUrl, spots.find((spot) => spot.imageUrl)?.imageUrl),
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

// 공개 프로필을 켠 에디터 (API 실패 시 없음)
async function loadEditors(apiUrl) {
    try {
        const editors = await fetchBody(`${apiUrl}/editors`);
        return await Promise.all(editors.map((editor) => fetchBody(`${apiUrl}/editors/${editor.id}`)));
    } catch (error) {
        console.warn(`[prerender] 에디터 목록을 읽지 못했습니다: ${error.message}`);
        return [];
    }
}

const editorDescription = (editor) => {
    const cities = editor.cities.map((city) => city.displayName).join(', ');
    return summary(editor.intro || `에디터 ${editor.nickName}님이 소개한 ${cities ? `${cities} ` : ''}장소와 공개 일정을 만나 보세요.`, 150);
};

function editorPage(siteUrl, editor) {
    const spots = editor.spots.map((spot) => `<li><a href="/map/${encodeURIComponent(spot.cityName)}">${escapeHtml(spot.name)}</a> ${escapeHtml(spot.cityDisplayName)}</li>`).join('');
    const plans = editor.itineraries.map((plan) => `<li><a href="/itinerary/${plan.id}">${escapeHtml(plan.title)}</a> ${plan.dayCount}일</li>`).join('');
    const url = `${siteUrl}/editors/${editor.id}`;
    return {
        file: `editors/${editor.id}.html`, url, title: `에디터 ${editor.nickName} | ${seo.siteName}`, description: editorDescription(editor),
        jsonLd: { '@context': 'https://schema.org', '@type': 'ProfilePage', url, mainEntity: { '@type': 'Person', name: editor.nickName } },
        body: `<main class="prerender"><h1>에디터 ${escapeHtml(editor.nickName)}</h1><p>${escapeHtml(editor.intro || '')}</p>`
            + `${spots ? `<h2>소개한 장소</h2><ul>${spots}</ul>` : ''}${plans ? `<h2>공개 일정</h2><ul>${plans}</ul>` : ''}</main>`,
    };
}

function editorsListPage(siteUrl, page, editors) {
    const base = policyPage(siteUrl, page);
    const links = editors.map((editor) => `<li><a href="/editors/${editor.id}">에디터 ${escapeHtml(editor.nickName)}</a></li>`).join('');
    return { ...base, body: base.body.replace('</main>', `${links ? `<ul>${links}</ul>` : ''}</main>`) };
}

function policyPage(siteUrl, page) {
    return {
        file: `${page.path.slice(1)}.html`, url: `${siteUrl}${page.path}`, title: `${page.title} | ${seo.siteName}`, description: page.description,
        body: `<main class="prerender"><h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.description)}</p></main>`,
    };
}

// 페이지 틀에는 대표 주소 태그가 있어야 함 (이미 한 번 돌려 기본 HTML 에서 빠졌어도 다시 넣고 시작)
const withCanonical = (html) => (/rel="canonical"/.test(html) ? html : html.replace('</head>', '<link rel="canonical" href="" /></head>'));

// 미리 만들지 않은 화면·404 가 받는 기본 HTML: 첫 화면 대표 주소를 빼서 다른 주소가 첫 화면 중복으로 보이지 않게 함
function writeAppShell(template) {
    fs.writeFileSync(path.join(BUILD_DIR, 'index.html'), template.replace(/\s*<link[^>]*rel="canonical"[^>]*>/, ''));
}

async function main() {
    const siteUrl = resolveSiteUrl();
    const template = withCanonical(fs.readFileSync(path.join(BUILD_DIR, 'index.html'), 'utf8'));
    const cities = await loadCities((process.env.PRERENDER_API_URL || `${siteUrl}/back`).replace(/\/+$/, ''));
    const editors = await loadEditors((process.env.PRERENDER_API_URL || `${siteUrl}/back`).replace(/\/+$/, ''));
    const categoryPages = cities.flatMap((city) => categoryGroups(city).map((group) => categoryPage(siteUrl, city, group)));
    const fixedPages = Object.values(seo.pages).map((page) => (page.path === seo.pages.editors.path ? editorsListPage(siteUrl, page, editors) : policyPage(siteUrl, page)));
    const pages = [homePage(siteUrl, cities), ...cities.map((city) => cityPage(siteUrl, city)), ...categoryPages, ...fixedPages, ...editors.map((editor) => editorPage(siteUrl, editor))];
    pages.forEach((page) => {
        const target = path.join(OUT_DIR, page.file);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, applyHead(template, page));
    });
    writeAppShell(template);
    console.log(`[prerender] ${pages.length}개 페이지 생성 (장소 ${cities.reduce((sum, city) => sum + city.spots.length, 0)}곳, 에디터 ${editors.length}명)`);
}

main().catch((error) => {
    console.error('[prerender] 실패', error);
    process.exit(1);
});
