// 고객 문의 분류·상태 (서버 InquiryCategory·InquiryStatus 와 같은 값)
export const INQUIRY_CATEGORIES = [
    { value: 'ACCOUNT', label: '계정·로그인' },
    { value: 'BUG', label: '오류 신고' },
    { value: 'SUGGESTION', label: '기능 제안' },
    { value: 'PARTNERSHIP', label: '제휴·광고' },
    { value: 'ETC', label: '기타' },
];

// 다른 화면에서 /inquiries?topic=키 로 들어오면 미리 채우는 문의 (연락처는 받지 않으므로 묻지 않음)
export const INQUIRY_PRESETS = {
    editor: {
        category: 'ETC',
        title: '에디터 지원',
        content: [
            '관심 있는 여행지:',
            '잘 아는 장소·자주 가는 곳:',
            '해 보고 싶은 활동 (추천 장소 등록·사진·여행기·공개 일정 다듬기 등):',
            '간단한 소개:',
        ].join('\n\n') + '\n',
    },
};

export const INQUIRY_STATUS = { WAITING: '답변 대기', ANSWERED: '답변 완료' };

// 서버 config.php 의 inquiry 값과 같게
export const INQUIRY_LIMITS = { title: 100, content: 2000, answer: 2000 };

const CATEGORY_LABELS = Object.fromEntries(INQUIRY_CATEGORIES.map((item) => [item.value, item.label]));

export const categoryLabelOf = (value) => CATEGORY_LABELS[value] || value;

export const formatInquiryDate = (value) => (value ? value.slice(0, 16) : '');
