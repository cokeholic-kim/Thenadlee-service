// 경로 이동수단 (Google Maps Routes travelMode 값)
export const TRAVEL_MODES = [
    { value: 'TRANSIT', label: '대중교통', color: '#2f80ed' },
    { value: 'DRIVING', label: '자동차', color: '#eb5757' },
    { value: 'WALKING', label: '도보', color: '#27ae60' },
];

// 대중교통은 제주를 포함한 대부분 지역에서 경로가 나와 기본값으로 사용
export const DEFAULT_TRAVEL_MODE = 'TRANSIT';

// 선택한 수단 경로가 없을 때 시도할 순서
export const FALLBACK_ORDER = ['TRANSIT', 'WALKING', 'DRIVING'];

export const STRAIGHT_LINE_COLOR = '#9e9e9e';

export const findTravelMode = (value) => TRAVEL_MODES.find((mode) => mode.value === value);
