import { useEffect, useState } from 'react';
import { fetchInquirySummary } from '../api/inquiryApi';

// 확인하지 않은 문의 답변 수. 로그인했을 때만 묻고, 실패하면 0 (화면 표시용이라 오류 안내 없음)
const useUnreadAnswers = (isLogin) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!isLogin) { setCount(0); return undefined; }
        let cancelled = false;
        fetchInquirySummary().then((summary) => { if (!cancelled) setCount(summary.unreadAnswers); }).catch(() => {});
        return () => { cancelled = true; };
    }, [isLogin]);
    return count;
};

export default useUnreadAnswers;
