import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../api/userApi";
import { loadLoginUser, setLogout } from "../modules/logincheck";
import { getApiErrorMessage } from "../util/apiError";
import { toastError } from "../ui/feedback";
import useUnreadAnswers from "../inquiry/useUnreadAnswers";
import { canEdit } from "../admin/roles";
import './Header.scss';
import { loginPathHere } from "../session/loginPath";

const MenuLink = ({ to, children, onClick }) => (
    <li><Link to={to} onClick={onClick}>{children}</Link></li>
);

const useLogout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    return async (e) => {
        e.preventDefault();
        try {
            await logout();
            dispatch(setLogout());
            navigate('/');
        } catch (error) {
            toastError(getApiErrorMessage(error));
        }
    };
};

const LoginMenu = () => {
    const { isLogin, user } = useSelector((state) => state.logincheck);
    const onLogout = useLogout();
    const unreadAnswers = useUnreadAnswers(isLogin);
    if (!isLogin) {
        // 로그인 후 보던 화면으로 돌아오도록 (메인이면 그대로 메인)
        return <MenuLink to={window.location.pathname === "/" ? "/login" : loginPathHere()}>로그인</MenuLink>;
    }
    return (
        <>
            <MenuLink to="/itineraries">내 일정</MenuLink>
            <MenuLink to="/groups">내 모임</MenuLink>
            {canEdit(user.role) && <MenuLink to="/admin">관리자</MenuLink>}
            {unreadAnswers > 0 && <MenuLink to="/inquiries"><span className="header-badge">문의 답변 {unreadAnswers}</span></MenuLink>}
            <MenuLink to="/mypage">{user.nickName}님</MenuLink>
            <li><a href="/" onClick={onLogout}>로그아웃</a></li>
        </>
    );
};

// 휴대폰 메뉴: 주소가 바뀌거나 Esc 를 누르면 닫힘
const useMenuToggle = () => {
    const [open, setOpen] = useState(false);
    const { pathname } = useLocation();
    useEffect(() => setOpen(false), [pathname]);
    useEffect(() => {
        if (!open) return undefined;
        const onKey = (event) => { if (event.key === 'Escape') setOpen(false); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open]);
    return [open, setOpen];
};

// 고정(fixed) 헤더의 실제 높이를 --header-height 로 공유해서 본문이 헤더에 가려지지 않게 함
const useHeaderHeightVariable = (headerRef) => {
    useLayoutEffect(() => {
        const header = headerRef.current;
        if (!header) return undefined;
        const update = () => document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
        update();
        const observer = new ResizeObserver(update);
        observer.observe(header);
        return () => observer.disconnect();
    }, [headerRef]);
};

function Header({ moveto }) {
    const dispatch = useDispatch();
    const checked = useSelector((state) => state.logincheck.checked);
    const headerRef = useRef(null);
    const [open, setOpen] = useMenuToggle();
    useHeaderHeightVariable(headerRef);

    // 새로고침 시 서버 세션으로 로그인 상태 복원
    useEffect(() => {
        if (!checked) dispatch(loadLoginUser());
    }, [checked, dispatch]);

    return (
        <header ref={headerRef} className={open ? 'is-menu-open' : ''}>
            <div className="header_top">
                {/* 로고는 페이지 제목(h1)이 아님: 페이지마다 고유한 h1 을 둠 */}
                <Link to="/" className="header-logo">The나들이 <span>떠나 나들이</span></Link>
                <button type="button" className="header-menu-button" aria-expanded={open} aria-controls="header-menu"
                    onClick={() => setOpen(!open)}>{open ? '닫기' : '메뉴'}<span aria-hidden="true">{open ? '✕' : '☰'}</span></button>
                <nav id="header-menu" className="header_top_right" aria-label="주 메뉴">
                    <ul>
                        {moveto
                            ? <li><a href="#tour" onClick={(e) => { setOpen(false); moveto(e); }}>여행지</a></li>
                            : <MenuLink to="/">여행지</MenuLink>}
                        <LoginMenu />
                    </ul>
                </nav>
            </div>
        </header>
    );
}

export default Header;
