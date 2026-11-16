// 페이지별 검색엔진 노출 정보 (제목, 설명, 색인 여부)
export const PAGE_META = {
    home: {
        path: '/'
    },
    login: { title: '로그인', path: '/login', noindex: true },
    join: { title: '회원가입', path: '/join', noindex: true },
    resetPassword: { title: '비밀번호 재설정', path: '/findPass', noindex: true },
    myPage: { title: '마이페이지', path: '/mypage', noindex: true },
    privacy: {
        title: '개인정보처리방침',
        description: '더 나들이가 처리하는 최소한의 회원 정보(아이디, 닉네임, 암호화된 비밀번호)와 보관·파기 기준을 안내합니다.',
        path: '/privacy'
    },
    terms: {
        title: '이용약관',
        description: '더 나들이 여행 일정 플래너 서비스 이용약관입니다.',
        path: '/terms'
    },
    notFound: { title: '페이지를 찾을 수 없습니다', noindex: true }
};

// 지도 페이지 도시 이름 (URL 은 영문, 화면·검색 노출은 한글)
export const CITY_NAMES = {
    Jeju: '제주',
    Singapore: '싱가포르',
    Harbin: '하얼빈',
    Vancouver: '밴쿠버'
};

export const cityPageMeta = (city) => {
    const cityName = CITY_NAMES[city] || city;
    return {
        title: `${cityName} 여행 일정 만들기`,
        description: `${cityName} 추천 여행지와 월별 여행 정보, 날씨를 확인하고 지도 위에서 나만의 ${cityName} 여행 동선을 만들어 보세요.`,
        path: `/map/${city}`
    };
};
