const DAY_MILLIS = 24 * 60 * 60 * 1000;

// 'YYYY-MM-DD' 를 로컬 자정 Date 로 변환
export const parseDate = (value) => {
    if (!value) return null;
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
};

export const formatDate = (date) => {
    if (!date) return null;
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
};

// 여행 일수 = 종료일 - 시작일 + 1
export const countTripDays = (startDate, endDate) => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    if (!start || !end) return 1;
    return Math.round((end - start) / DAY_MILLIS) + 1;
};

export const dateOfDay = (startDate, dayIndex) => {
    const start = parseDate(startDate);
    return start ? new Date(start.getTime() + dayIndex * DAY_MILLIS) : null;
};

const DEFAULT_DEPARTURE_HOUR = 9;

// 대중교통 경로 계산용 출발 시각: 그 일차 오전 9시 (지난 시각이면 현재 시각 기준으로 계산하도록 null)
export const departureTimeOfDay = (startDate, dayIndex) => {
    const date = dateOfDay(startDate, dayIndex);
    if (!date) return null;
    date.setHours(DEFAULT_DEPARTURE_HOUR, 0, 0, 0);
    return date > new Date() ? date : null;
};

// 일차 탭에 보여줄 날짜 (예: 12.1)
export const shortDateLabel = (startDate, dayIndex) => {
    const date = dateOfDay(startDate, dayIndex);
    return date ? `${date.getMonth() + 1}.${date.getDate()}` : '';
};
