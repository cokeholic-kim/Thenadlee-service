import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SESSION_EXPIRED_EVENT } from './sessionExpiry';
import '../pwa/Pwa.scss';

/** 로그인 시간이 지나 로그아웃됐을 때 안내, "다시 로그인"을 누르면 로그인 후 지금 화면으로 돌아옴 */
const SessionExpiredNotice = () => {
    const [visible, setVisible] = useState(false);
    const navigate = useNavigate();
    const { pathname, search } = useLocation();
    useEffect(() => {
        const show = () => setVisible(true);
        window.addEventListener(SESSION_EXPIRED_EVENT, show);
        return () => window.removeEventListener(SESSION_EXPIRED_EVENT, show);
    }, []);
    if (!visible || pathname === '/login') return null;
    const relogin = () => {
        setVisible(false);
        navigate(`/login?next=${encodeURIComponent(pathname + search)}&expired=1`);
    };
    return (
        <div className="pwa-banner" role="alert">
            <p>로그인 시간이 지나 로그아웃됐어요. 다시 로그인하면 지금 화면으로 돌아와요.</p>
            <button type="button" className="pwa-banner__primary" onClick={relogin}>다시 로그인</button>
            <button type="button" onClick={() => setVisible(false)}>닫기</button>
        </div>
    );
};

export default SessionExpiredNotice;
