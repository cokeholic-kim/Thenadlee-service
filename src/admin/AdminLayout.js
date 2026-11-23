import React from 'react';
import { useSelector } from 'react-redux';
import { Link, NavLink } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import usePageMeta from '../seo/usePageMeta';
import { canEdit, isAdmin } from './roles';
import './Admin.scss';
import { loginPathHere } from '../session/loginPath';

const ADMIN_META = { title: '관리자', path: '/admin', noindex: true };

const AdminTabs = ({ role }) => (
    <nav className="admin__tabs" aria-label="관리 메뉴">
        <NavLink to="/admin/cities">여행지</NavLink>
        <NavLink to="/admin/itineraries">공개 일정</NavLink>
        <NavLink to="/admin/reports">신고</NavLink>
        {isAdmin(role) && <NavLink to="/admin/tags">해시태그</NavLink>}
        {isAdmin(role) && <NavLink to="/admin/inquiries">고객 문의</NavLink>}
        {isAdmin(role) && <NavLink to="/admin/users">회원 권한</NavLink>}
        <NavLink to="/admin/activity">편집 기록</NavLink>
        <NavLink to="/admin/profile">내 프로필</NavLink>
    </nav>
);

const AccessMessage = ({ children }) => (
    <PageLayout className="admin"><div className="admin__inner"><p className="admin__message">{children}</p></div></PageLayout>
);

// 관리자 화면 공통 틀: 로그인·권한 확인 후 메뉴와 내용을 보여줌 (실제 권한 검사는 서버가 다시 함)
const AdminLayout = ({ title, adminOnly = false, children }) => {
    usePageMeta(ADMIN_META);
    const { checked, isLogin, user } = useSelector((state) => state.logincheck);
    if (!checked) return <AccessMessage>확인 중…</AccessMessage>;
    if (!isLogin) return <AccessMessage>관리자 화면은 <Link to={loginPathHere()}>로그인</Link> 후 이용할 수 있어요.</AccessMessage>;
    if (!canEdit(user.role) || (adminOnly && !isAdmin(user.role))) {
        return <AccessMessage>이 화면을 볼 수 있는 권한이 없어요.</AccessMessage>;
    }
    return (
        <PageLayout className="admin">
            <div className="admin__inner">
                <AdminTabs role={user.role} />
                {title && <h1 className="admin__title">{title}</h1>}
                {children}
            </div>
        </PageLayout>
    );
};

export default AdminLayout;
