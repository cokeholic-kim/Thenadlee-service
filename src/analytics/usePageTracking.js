import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPage } from './analytics';

// 화면 주소가 바뀔 때마다 GA 에 화면 이동 기록 (제목이 바뀐 뒤 보내도록 잠깐 늦춤)
const TITLE_DELAY_MS = 300;

const usePageTracking = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        const timer = setTimeout(() => trackPage(pathname), TITLE_DELAY_MS);
        return () => clearTimeout(timer);
    }, [pathname]);
};

export default usePageTracking;
