import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import MyItineraries from '../itinerary/MyItineraries';
import MySpots from '../community/MySpots';
import { withdraw } from '../api/userApi';
import { setLogout } from '../modules/logincheck';
import { getApiErrorMessage } from '../util/apiError';
import usePageMeta from '../seo/usePageMeta';
import { PAGE_META } from '../seo/pageMeta';
import './MyPage.scss';

const WITHDRAW_CONFIRM_MESSAGE = '탈퇴하면 회원 정보가 즉시 삭제되며 되돌릴 수 없습니다. 탈퇴하시겠습니까?';

const WithdrawSection = ({ onWithdraw }) => {
    const [password, setPassword] = useState('');
    const onSubmit = (e) => {
        e.preventDefault();
        if (window.confirm(WITHDRAW_CONFIRM_MESSAGE)) onWithdraw(password);
    };
    return (
        <form className="mypage-section" onSubmit={onSubmit}>
            <h2>회원 탈퇴</h2>
            <p>탈퇴 즉시 아이디·닉네임·비밀번호 정보와 저장한 일정, 등록한 장소가 함께 삭제됩니다. 본인 확인을 위해 비밀번호를 입력해 주세요.</p>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호" autoComplete="current-password" required />
            <button type="submit" className="mypage-danger-btn">회원 탈퇴</button>
        </form>
    );
};

const MyPage = () => {
    usePageMeta(PAGE_META.myPage);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { checked, isLogin, user } = useSelector((state) => state.logincheck);

    useEffect(() => {
        if (checked && !isLogin) navigate('/login', { replace: true });
    }, [checked, isLogin, navigate]);

    const onWithdraw = async (password) => {
        try {
            alert((await withdraw(password)).message);
            dispatch(setLogout());
            navigate('/', { replace: true });
        } catch (error) {
            alert(getApiErrorMessage(error));
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
                {user && <MyItineraries />}
                {user && <MySpots />}
                <WithdrawSection onWithdraw={onWithdraw} />
            </div>
        </PageLayout>
    );
};

export default MyPage;
