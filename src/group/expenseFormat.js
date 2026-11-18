// 정산 화면 공통 값·형식 (분류 순서 = 정산서에 보이는 순서)
export const CATEGORIES = [
    { value: 'STAY', label: '숙소', emoji: '🛏️' },
    { value: 'FOOD', label: '식사', emoji: '🍽️' },
    { value: 'CAFE', label: '카페/음료', emoji: '☕' },
    { value: 'SNACK', label: '간식', emoji: '🍟' },
    { value: 'TRANSPORT', label: '교통', emoji: '🚕' },
    { value: 'TOUR', label: '관광/입장', emoji: '🎫' },
    { value: 'SHOPPING', label: '쇼핑', emoji: '🛍️' },
    { value: 'ETC', label: '기타', emoji: '🏷️' },
];

export const CURRENCIES = ['KRW', 'USD', 'JPY', 'EUR', 'CNY', 'SGD', 'CAD', 'TWD', 'THB', 'VND', 'HKD', 'GBP', 'AUD'];

export const BASE_CURRENCY = 'KRW';

const findCategory = (value) => CATEGORIES.find((category) => category.value === value);

export const categoryLabel = (value) => findCategory(value)?.label || value;

export const categoryEmoji = (value) => findCategory(value)?.emoji || '🏷️';

// 정수는 그대로, 나누어떨어지지 않으면 소수 첫째 자리까지 (예: 175,894.6)
export const number = (value) => Number(value || 0).toLocaleString('ko-KR', { maximumFractionDigits: 1 });

export const won = (amount) => `${number(amount)}원`;

export const money = (amount, currency) => (currency === BASE_CURRENCY ? won(amount) : `${number(amount)} ${currency}`);
