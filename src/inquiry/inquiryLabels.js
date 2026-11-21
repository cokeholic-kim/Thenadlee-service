// 고객 문의 분류·상태 (서버 InquiryCategory·InquiryStatus 와 같은 값)
export const INQUIRY_CATEGORIES = [
    { value: 'ACCOUNT', label: '계정·로그인' },
    { value: 'BUG', label: '오류 신고' },
    { value: 'SUGGESTION', label: '기능 제안' },
    { value: 'PARTNERSHIP', label: '제휴·광고' },
    { value: 'ETC', label: '기타' },
];

export const INQUIRY_STATUS = { WAITING: '답변 대기', ANSWERED: '답변 완료' };

// 서버 config.php 의 inquiry 값과 같게
export const INQUIRY_LIMITS = { title: 100, content: 2000, answer: 2000 };

const CATEGORY_LABELS = Object.fromEntries(INQUIRY_CATEGORIES.map((item) => [item.value, item.label]));

export const categoryLabelOf = (value) => CATEGORY_LABELS[value] || value;

export const formatInquiryDate = (value) => (value ? value.slice(0, 16) : '');
