import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import MyItineraries from '../itinerary/MyItineraries';
import usePageMeta from '../seo/usePageMeta';
import { PAGE_META } from '../seo/pageMeta';
import './MyPage.scss';

const PAGE_PATH = '/itineraries';

// 헤더 "내 일정": 저장한 일정 목록 (로그인한 회원만, 아니면 로그인 후 이 화면으로 돌아옴)
const MyItinerariesPage = () => {
    usePageMeta(PAGE_META.myItineraries);
    const navigate = useNavigate();
    const { checked, isLogin } = useSelector((state) => state.logincheck);
    useEffect(() => {
        if (checked && !isLogin) navigate(`/login?next=${encodeURIComponent(PAGE_PATH)}`, { replace: true });
    }, [checked, isLogin, navigate]);
    return (
        <PageLayout>
            <div className="mypage">
                <div className="mypage-title-row">
                    <h1>내 일정</h1>
                    <Link className="mypage-new-button" to="/#places">+ 새 일정 만들기</Link>
                </div>
                {isLogin && <MyItineraries />}
            </div>
        </PageLayout>
    );
};

export default MyItinerariesPage;
