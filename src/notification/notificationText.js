// 알림 종류별 문구·아이콘·이동할 주소 (서버는 종류와 제목만 보내고 문구는 화면에서 만듦)
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const RELATIVE_DAYS_LIMIT = 7;

const itineraryPath = (item) => `/itinerary/${item.targetId}`;

const KINDS = {
    COMMENT: { icon: '💬', path: itineraryPath, text: (item) => `${item.actorNickName}님이 '${item.targetTitle}' 일정에 댓글을 남겼어요.` },
    LIKE: {
        icon: '♥', path: itineraryPath,
        text: (item) => (item.actorCount > 1
            ? `'${item.targetTitle}' 일정을 ${item.actorCount}명이 좋아해요.`
            : `누군가 '${item.targetTitle}' 일정을 좋아해요.`),
    },
    COPY: { icon: '📋', path: itineraryPath, text: (item) => `누군가 '${item.targetTitle}' 일정으로 새 일정을 시작했어요.` },
    INQUIRY_ANSWER: { icon: '✉', path: () => '/inquiries', text: (item) => `문의 '${item.targetTitle}'에 답변이 달렸어요.` },
};

export const describeNotification = (item) => {
    const kind = KINDS[item.type];
    if (!kind) return null;
    return { icon: kind.icon, text: kind.text(item), path: kind.path(item) };
};

// 서버가 계산한 경과 시간(secondsAgo, 시간대 차이 없음)을 "방금·n분 전·n시간 전·n일 전·날짜"로
export const formatRelativeTime = (item) => {
    const diff = item.secondsAgo * 1000;
    if (diff < MINUTE) return '방금';
    if (diff < HOUR) return `${Math.floor(diff / MINUTE)}분 전`;
    if (diff < DAY) return `${Math.floor(diff / HOUR)}시간 전`;
    if (diff < RELATIVE_DAYS_LIMIT * DAY) return `${Math.floor(diff / DAY)}일 전`;
    return item.createdAt.slice(0, 10).replaceAll('-', '.');
};
