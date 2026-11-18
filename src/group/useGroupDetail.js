import { useCallback, useEffect, useState } from 'react';
import { groupApi } from '../api/groupApi';
import { getApiErrorMessage } from '../util/apiError';

// 실시간 서버가 없어서 모임 화면을 보고 있는 동안만 일정 간격으로 새 내용을 불러옴 (다른 탭에 있으면 멈춤)
const POLL_INTERVAL_MS = 15000;

const usePolling = (task, enabled) => {
    useEffect(() => {
        if (!enabled) return undefined;
        const timer = setInterval(() => { if (document.visibilityState === 'visible') task(); }, POLL_INTERVAL_MS);
        return () => clearInterval(timer);
    }, [task, enabled]);
};

/**
 * 모임 상세 상태: { group, error, reload, run(action) } (groupId 가 없으면 불러오지 않음)
 *   run: 변경 API 를 호출하고 돌려받은 모임 상세로 화면 갱신 (실패하면 알림)
 */
const useGroupDetail = (groupId, { poll = true } = {}) => {
    const [group, setGroup] = useState(null);
    const [error, setError] = useState(null);
    const reload = useCallback(() => (groupId ? groupApi.detail(groupId).then(setGroup)
        .catch((err) => setError(getApiErrorMessage(err))) : Promise.resolve()), [groupId]);
    useEffect(() => { reload(); }, [reload]);
    usePolling(reload, poll && Boolean(group));

    const run = useCallback(async (action) => {
        try {
            const updated = await action();
            if (updated?.id) setGroup(updated);
            return true;
        } catch (err) {
            alert(getApiErrorMessage(err));
            return false;
        }
    }, []);
    return { group, error, reload, run };
};

export default useGroupDetail;
