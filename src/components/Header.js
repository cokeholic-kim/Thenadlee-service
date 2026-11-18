import React, { useEffect, useLayoutEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../api/userApi";
import { loadLoginUser, setLogout } from "../modules/logincheck";
import { getApiErrorMessage } from "../util/apiError";
import { canEdit } from "../admin/roles";
import './Header.scss';

const LoginMenu = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLogin, user } = useSelector((state) => state.logincheck);

    const onLogout = async (e) => {
        e.preventDefault();
        try {
            await logout();
            dispatch(setLogout());
            navigate('/');
        } catch (error) {
            alert(getApiErrorMessage(error));
        }
    };

    if (!isLogin) {
        return <Link to="/login"><li>로그인</li></Link>;
    }
    return (
        <>
            <Link to="/groups"><li>내 모임</li></Link>
            {canEdit(user.role) && <Link to="/admin"><li>관리자</li></Link>}
            <Link to="/mypage"><li>{user.nickName}님</li></Link>
            <a href="/" onClick={onLogout}><li>로그아웃</li></a>
        </>
    );
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
    useHeaderHeightVariable(headerRef);

    // 새로고침 시 서버 세션으로 로그인 상태 복원
    useEffect(() => {
        if (!checked) dispatch(loadLoginUser());
    }, [checked, dispatch]);

    return (
        <header ref={headerRef}>
            <div className="header_top">
                <div className="header_top_left">
                    <Link to="/">
                        <h1>The나들이 <span>떠나 나들이</span></h1>
                    </Link>
                </div>
                <ul className="header_top_right">
                    {moveto
                        ? <a href="#tour" onClick={moveto}><li>여행지</li></a>
                        : <Link to="/"><li>여행지</li></Link>}
                    <LoginMenu />
                </ul>
            </div>
        </header>
    );
}

export default Header;
