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
    privacy: seo.pages.privacy,
    terms: seo.pages.terms,
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
