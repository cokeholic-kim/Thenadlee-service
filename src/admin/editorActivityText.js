// 편집 기록의 한 일 이름 (서버 EditorAction 과 같은 값)
const ACTION_LABELS = {
    CITY_CREATE: '여행지 추가',
    CITY_UPDATE: '여행지 수정',
    CITY_DELETE: '여행지 삭제',
    SPOT_CREATE: '장소 추가',
    SPOT_UPDATE: '장소 수정',
    SPOT_STATUS: '장소 숨김·공개',
    SPOT_DELETE: '장소 삭제',
    TOUR_IMPORT: '관광공사 자료 불러오기',
    POST_CREATE: '여행기 추가',
    POST_DELETE: '여행기 삭제',
    SPOT_MEDIA: '장소 영상·후기 고정',
    CITY_MEDIA: '도시 영상 고정',
    TAG_BULK: '태그 한 번에 바꾸기',
    TAG_UPDATE: '태그 수정',
    TAG_STATUS: '태그 숨김·사용',
    ITINERARY_STATUS: '공개 일정 숨김·공개',
    ITINERARY_FEATURED: '운영진 추천 일정',
    REPORT_RESOLVE: '신고 처리',
    COMMENT_DELETE: '댓글 삭제',
    EDITOR_CITIES: '담당 여행지 지정',
    ROLE_CHANGE: '회원 권한 변경',
};

// 지운 기록이라 한눈에 봐야 하는 것
const DANGER_ACTIONS = ['CITY_DELETE', 'SPOT_DELETE', 'POST_DELETE', 'COMMENT_DELETE'];

// 이전 내용(before) 항목 이름
const FIELD_LABELS = {
    name: '이름',
    displayName: '표시 이름',
    coordinate: '좌표',
    description: '설명',
    imageUrl: '사진',
    imageCredit: '사진 출처',
    titleImageUrl: '대표 사진',
    category: '종류',
    status: '상태',
    source: '출처',
    sortOrder: '순서',
    isPublished: '공개',
    region: '구분',
};

export const actionLabel = (action) => ACTION_LABELS[action] || action;

export const isDangerAction = (action) => DANGER_ACTIONS.includes(action);

const formatValue = (value) => {
    if (value === null || value === undefined || value === '') return '(없음)';
    if (typeof value === 'boolean') return value ? '예' : '아니오';
    return String(value);
};

/** 이전 내용을 [이름, 값] 목록으로 (되살릴 때 보고 옮겨 적기 쉽게) */
export const beforeRows = (before) => Object.entries(before || {}).map(([key, value]) => [FIELD_LABELS[key] || key, formatValue(value)]);
