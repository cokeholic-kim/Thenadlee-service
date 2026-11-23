// 메인 화면 홍보 문구·기능 소개·배너 (문구를 바꿀 때는 이 파일만 고치면 됨)

export const HERO = {
    eyebrow: '여행 일정 플래너 · 무료',
    titleLines: ['가고 싶은 곳을 담으면,', '여행 동선이 완성돼요'],
    description: '추천 장소를 지도에 담고 순서만 바꾸면 실제 이동 경로와 시간이 그려져요. 친구와 함께 계획하고, 정산과 여행 앨범까지 한곳에서 끝내세요.',
    primaryLabel: '여행지 고르기',
    secondaryLabel: '친구와 함께 계획하기',
    secondaryPath: '/groups',
    badges: ['로그인 없이 바로 시작', '국내·해외 추천 장소', '대중교통·자동차·도보 길찾기'],
    image: {
        // 화면이 바뀌면 캡처를 새 파일 이름으로 바꿔야 함 (기기 캐시가 같은 이름의 예전 그림을 계속 보여 줌)
        path: '/imgs/hero-planner-v2.jpg',
        width: 1280,
        height: 760,
        alt: '더 나들이 일정 만들기 화면: 제주 동쪽 해안의 여섯 장소가 자동차 경로로 이어진 지도',
        // 휴대폰(600px 이하)에서는 휴대폰 화면 캡처로 바꿔 보여 줌
        mobilePath: '/imgs/hero-planner-mobile-v2.jpg',
        mobileWidth: 750,
        mobileHeight: 1440,
    },
};

// icon: react-icons/md 의 아이콘 이름 (MainFeatures.js 의 ICONS 와 맞춤)
export const FEATURES = [
    { icon: 'place', title: '추천 장소를 지도에 담기', description: '운영진과 여행자가 추천한 장소를 눌러 담으면 지도에 바로 표시돼요.' },
    { icon: 'route', title: '실제 이동 경로와 시간', description: '대중교통·자동차·도보 경로와 소요 시간을 구간별로 알려 줘요.' },
    { icon: 'calendar', title: '일차별 일정과 날씨', description: '날짜를 고르면 일차별로 나누고, 그달의 여행 팁과 날씨도 함께 보여 줘요.' },
    { icon: 'group', title: '친구와 함께 계획', description: '모임을 만들어 여행지·날짜를 투표로 정하고, 가고 싶은 곳과 준비물을 함께 챙겨요.' },
    { icon: 'money', title: '여행 경비 정산', description: '누가 얼마를 냈는지 적어 두면 누가 누구에게 보낼지 자동으로 계산해요.' },
    { icon: 'album', title: '앨범과 여행 요약 카드', description: '함께 찍은 사진을 모으고, 동선이 담긴 요약 카드를 카카오톡으로 공유해요.' },
];

export const STEPS = [
    { title: '여행지 고르기', description: '국내·해외 여행지 중 떠나고 싶은 곳을 골라요.' },
    { title: '장소 담고 순서 바꾸기', description: '일차별로 장소를 담으면 지도에 실제 이동 경로가 그려져요.' },
    { title: '저장하고 함께 보기', description: '로그인하면 일정을 저장하고, 공개하거나 모임 친구와 나눌 수 있어요.' },
];

/**
 * 메인 배너 (위에서부터 차례로 돌아가며 보여 줌)
 *   path: 사이트 안 주소 / url: 외부 주소(새 창)
 *   startDate·endDate (YYYY-MM-DD, 선택): 이 기간에만 노출 → 계절 기획전·제휴 홍보에 사용
 *   sponsored: true 이면 "광고" 표시 + 검색엔진에 광고 링크로 알림 (항공권·관광 홍보 등 제휴 배너)
 */
/**
 * 지도 화면 왼쪽의 제휴 버튼 (예: 항공권 예약). url 을 넣어야 보이고, 새 창으로 열리며 "광고" 표시
 *   image: /file/imgs 아래 파일 이름, label: 화면 낭독기·이미지 설명
 */
export const MAP_PARTNER = {
    url: '',
    label: '여행이지 항공권 예약',
    image: 'kyowon.png',
};

export const PROMOTIONS = [
    {
        id: 'group-plan', theme: 'teal', label: '모임 기능',
        title: '친구랑 여행 가요? 모임으로 함께 정해요',
        description: '여행지·날짜 투표, 가고 싶은 곳 제안, 준비물 체크리스트와 예산까지 한 화면에서.',
        linkLabel: '모임 만들기', path: '/groups',
    },
    {
        id: 'settle-album', theme: 'orange', label: '여행 후',
        title: '돌아와서도 깔끔하게, 정산과 추억 정리',
        description: '쓴 돈을 적으면 보낼 금액이 바로 계산되고, 사진은 일차별 앨범과 요약 카드로 남아요.',
        linkLabel: '내 모임 보기', path: '/groups',
    },
    {
        id: 'editor-recruit', theme: 'purple', label: '에디터 모집',
        title: '내가 아는 여행지, 에디터가 되어 소개해 주세요',
        description: '여행지 소개와 추천 장소·사진·여행기를 함께 다듬을 에디터를 모집해요. 고객 문의로 지원하면 답변으로 안내해 드려요.',
        linkLabel: '에디터 지원하기', path: '/inquiries?topic=editor',
    },
    {
        id: 'winter-sunrise', theme: 'navy', label: '이달의 여행', startDate: '2026-12-01', endDate: '2027-01-15',
        title: '새해 첫 해돋이, 동선부터 미리 짜 두세요',
        description: '해돋이 명소와 근처 맛집·카페를 담아 새벽 동선을 미리 그려 보세요.',
        linkLabel: '여행지 고르기', path: '#places',
    },
];
