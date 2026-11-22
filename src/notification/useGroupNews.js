import { useCallback, useEffect, useState } from 'react';
import { groupApi } from '../api/groupApi';
import useAutoRefresh from './useAutoRefresh';
import { onGroupSeen } from './groupNewsEvents';

// 내 모임 중 새 소식(다른 멤버가 남긴 계획·지출·사진)이 있는 모임: 모임 탭을 열어 보면 사라짐
//   기존 "내 모임" 목록 응답을 그대로 써서 보이는 범위도 같음 (내가 멤버인 모임만)
const useGroupNews = (isLogin) => {
    const [groups, setGroups] = useState([]);
    const refresh = useCallback(() => {
        groupApi.mine().then((list) => setGroups(list.filter((group) => group.unreadCount > 0))).catch(() => {});
    }, []);
    const reset = useCallback(() => setGroups([]), []);
    useAutoRefresh(isLogin, refresh, reset);
    useEffect(() => (isLogin ? onGroupSeen(refresh) : undefined), [isLogin, refresh]);
    return groups;
};

export default useGroupNews;
