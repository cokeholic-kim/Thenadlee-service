import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import MySpots from '../community/MySpots';
import { withdraw } from '../api/userApi';
import { setLogout } from '../modules/logincheck';
import { getApiErrorMessage } from '../util/apiError';
import { confirmDialog, toast, toastError } from '../ui/feedback';
import usePageMeta from '../seo/usePageMeta';
import { PAGE_META } from '../seo/pageMeta';
import './MyPage.scss';
import { loginPathHere } from '../session/loginPath';

const WITHDRAW_CONFIRM_MESSAGE = '탈퇴하면 회원 정보가 즉시 삭제되며 되돌릴 수 없습니다. 탈퇴하시겠습니까?';

// 계정 관리(회원 탈퇴): 실수로 누르지 않게 접어 두고, 열어야 보임
const WithdrawSection = ({ onWithdraw }) => {
    const [password, setPassword] = useState('');
    const onSubmit = async (e) => {
        e.preventDefault();
        if (await confirmDialog(WITHDRAW_CONFIRM_MESSAGE, { title: '회원 탈퇴', confirmLabel: '탈퇴', danger: true })) onWithdraw(password);
    };
    return (
        <details className="mypage-section mypage-account">
            <summary>계정 관리</summary>
            <form onSubmit={onSubmit}>
                <h2>회원 탈퇴</h2>
                <p>탈퇴 즉시 아이디·닉네임·비밀번호 정보와 저장한 일정, 등록한 장소가 함께 삭제됩니다. 모임 앨범에 올린 사진도 삭제되며, 모임에 남긴 댓글은 "삭제된 회원"으로 남습니다. 본인 확인을 위해 비밀번호를 입력해 주세요.</p>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호" aria-label="비밀번호" autoComplete="current-password" required />
                <button type="submit" className="mypage-danger-btn">회원 탈퇴</button>
            </form>
        </details>
    );
};

const Shortcuts = () => (
    <nav className="mypage-shortcuts" aria-label="바로가기">
        <Link to="/itineraries">내 일정</Link>
        <Link to="/groups">내 모임</Link>
        <Link to="/inquiries">고객 문의</Link>
    </nav>
);

const MyPage = () => {
    usePageMeta(PAGE_META.myPage);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { checked, isLogin, user } = useSelector((state) => state.logincheck);

    useEffect(() => {
        if (checked && !isLogin) navigate(loginPathHere(), { replace: true });
    }, [checked, isLogin, navigate]);

    const onWithdraw = async (password) => {
        try {
            toast((await withdraw(password)).message);
            dispatch(setLogout());
            navigate('/', { replace: true });
        } catch (error) {
            toastError(getApiErrorMessage(error));
        }
    };

    return (
        <PageLayout>
            <div className="mypage">
                <h1>마이페이지</h1>
                {user && (
                    <section className="mypage-section">
                        <h2>내 정보</h2>
                        <dl><dt>아이디</dt><dd>{user.loginId}</dd><dt>닉네임</dt><dd>{user.nickName}</dd></dl>
                    </section>
                )}
                {user && <Shortcuts />}
                {user && <MySpots />}
                <WithdrawSection onWithdraw={onWithdraw} />
            </div>
        </PageLayout>
    );
};

export default MyPage;
