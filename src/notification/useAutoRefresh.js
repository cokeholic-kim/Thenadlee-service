import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** 로그인 중이면 화면을 옮길 때·창으로 돌아올 때 다시 불러옴, 로그아웃하면 비움 */
const useAutoRefresh = (isLogin, refresh, reset) => {
    const { pathname } = useLocation();
    useEffect(() => { if (isLogin) refresh(); else reset(); }, [isLogin, pathname, refresh, reset]);
    useEffect(() => {
        if (!isLogin) return undefined;
        window.addEventListener('focus', refresh);
        return () => window.removeEventListener('focus', refresh);
    }, [isLogin, refresh]);
};

export default useAutoRefresh;
