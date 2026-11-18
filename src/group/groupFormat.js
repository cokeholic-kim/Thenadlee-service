// 모임 화면 표시용 날짜 형식
export const formatPeriod = (startDate, endDate) => (startDate ? `${startDate} ~ ${endDate}` : '기간 미정');

export const formatDateTime = (value) => (value ? value.slice(0, 16) : '');

const pad = (number) => String(number).padStart(2, '0');

export const toDateString = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// 오늘부터 days 일 동안의 날짜 목록
export const upcomingDates = (days) => Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return toDateString(date);
});

export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
