import seo from './seo.json';

// 페이지별 검색엔진 노출 정보 (제목, 설명, 색인 여부)
export const PAGE_META = {
    home: {
        path: '/'
    },
    login: { title: '로그인', path: '/login', noindex: true },
    join: { title: '회원가입', path: '/join', noindex: true },
    resetPassword: { title: '비밀번호 재설정', path: '/findPass', noindex: true },
    myPage: { title: '마이페이지', path: '/mypage', noindex: true },
    myItineraries: { title: '내 일정', path: '/itineraries', noindex: true },
    inquiries: { title: '고객 문의', path: '/inquiries', noindex: true },
    explore: seo.pages.explore,
    privacy: seo.pages.privacy,
    terms: seo.pages.terms,
    settle: seo.pages.settle,
    editors: seo.pages.editors,
    notFound: { title: '페이지를 찾을 수 없습니다', noindex: true }
};

// 지도 페이지 도시 이름 (URL 은 영문, 화면·검색 노출은 한글)
export const CITY_NAMES = seo.cityNames;

export const cityPageMeta = (city) => {
    const cityName = CITY_NAMES[city] || city;
    return {
        title: seo.cityTitle.replaceAll('{city}', cityName),
        description: seo.cityDescription.replaceAll('{city}', cityName),
        path: `/map/${city}`
    };
};

// 여행지별 장소 종류 페이지 (/spots/도시/종류, 종류는 소문자): 장소가 적으면 검색 노출 안 함
export const CATEGORY_NAMES = seo.categoryNames;

// name: 해시태그 페이지 이름 (종류 페이지는 seo.json 이름)
export const spotCategoryPageMeta = (city, slug, count, name) => {
    const values = { '{city}': CITY_NAMES[city] || city, '{category}': name || CATEGORY_NAMES[slug] || slug, '{count}': count };
    const fill = (text) => Object.entries(values).reduce((result, [key, value]) => result.replaceAll(key, value), text);
    return {
        title: fill(seo.categoryTitle),
        description: fill(seo.categoryDescription),
        path: `/spots/${city}/${slug}`,
        noindex: count < seo.categoryMinSpots
    };
};

// 종류별 페이지를 미리 만들고 링크하는 최소 장소 수 (서버 config.php 의 seo.categoryMinSpots 와 같은 값)
export const CATEGORY_MIN_SPOTS = seo.categoryMinSpots;

// 에디터 공개 프로필: 소개 글이 있으면 설명으로, 없으면 담당 여행지로 만든 문장
export const editorPageMeta = (editor, profileId) => {
    const cities = editor.cities.map((city) => city.displayName).join(', ');
    const fallback = `에디터 ${editor.nickName}님이 소개한 ${cities ? `${cities} ` : ''}장소와 공개 일정을 만나 보세요.`;
    return { title: `에디터 ${editor.nickName}`, description: editor.intro || fallback, path: `/editors/${profileId}` };
};
