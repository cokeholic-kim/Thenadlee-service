import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { groupApi } from '../api/groupApi';
import PageLayout from '../components/PageLayout';
import usePageMeta from '../seo/usePageMeta';
import { getApiErrorMessage } from '../util/apiError';
import CityPanel from './CityPanel';
import DatePanel from './DatePanel';
import AlbumTab from './AlbumTab';
import ExpenseTab from './ExpenseTab';
import MemberPanel from './MemberPanel';
import PlanPanel from './PlanPanel';
import SummaryTab from './SummaryTab';
import WishPanel from './WishPanel';
import { formatDateTime, formatPeriod } from './groupFormat';
import useGroupDetail from './useGroupDetail';
import './Group.scss';

const TABS = [
    { value: 'plan', label: '계획' },
    { value: 'expense', label: '정산' },
    { value: 'album', label: '앨범' },
    { value: 'summary', label: '요약' },
    { value: 'members', label: '멤버' },
    { value: 'activity', label: '활동' },
];

const GroupHeader = ({ group, run }) => {
    const rename = () => {
        const name = window.prompt('모임 이름', group.name);
        if (name && name.trim() !== group.name) run(() => groupApi.rename(group.id, name.trim()));
    };
    return (
        <div className="group-header">
            <p><Link to="/groups">← 내 모임</Link></p>
            <h1>{group.name} {group.myRole === 'OWNER' && <button type="button" className="group-button is-small" onClick={rename}>이름 바꾸기</button>}</h1>
            <p className="group-header__meta">{group.city?.displayName || '여행지 미정'} · {formatPeriod(group.startDate, group.endDate)} · 멤버 {group.members.filter((member) => !member.isGuest).length}명</p>
        </div>
    );
};

const ActivityPanel = ({ group }) => (
    <section className="group-section">
        <h2>활동 내역</h2>
        <ul className="activity-list">
            {group.activities.map((activity) => <li key={activity.id}><span>{activity.message}</span><time>{formatDateTime(activity.createdAt)}</time></li>)}
        </ul>
    </section>
);

const useLeave = (group) => {
    const navigate = useNavigate();
    return async () => {
        const deleting = group.myRole === 'OWNER' && group.members.filter((member) => !member.isGuest).length === 1;
        if (!window.confirm(deleting ? '모임을 삭제할까요? 계획 내용이 모두 지워져요.' : '모임에서 나갈까요?')) return;
        try {
            await groupApi.leave(group.id);
            navigate('/groups', { replace: true });
        } catch (error) {
            alert(getApiErrorMessage(error));
        }
    };
};

const GroupBody = ({ group, run }) => {
    const [tab, setTab] = useState('plan');
    const onLeave = useLeave(group);
    return (
        <>
            <GroupHeader group={group} run={run} />
            <nav className="group-tabs">{TABS.map((item) => <button key={item.value} type="button" className={tab === item.value ? 'active' : ''} onClick={() => setTab(item.value)}>{item.label}</button>)}</nav>
            {tab === 'plan' && <><CityPanel group={group} run={run} /><DatePanel group={group} run={run} /><WishPanel group={group} run={run} /><PlanPanel group={group} run={run} /></>}
            {tab === 'expense' && <ExpenseTab group={group} />}
            {tab === 'album' && <AlbumTab group={group} />}
            {tab === 'summary' && <SummaryTab group={group} />}
            {tab === 'members' && <MemberPanel group={group} run={run} onLeave={onLeave} />}
            {tab === 'activity' && <ActivityPanel group={group} />}
        </>
    );
};

// 모임 상세: 계획(여행지·날짜·장소·동선), 정산, 앨범, 여행 요약, 멤버, 활동 내역 (보고 있는 동안 자동 갱신)
const GroupDetail = () => {
    const { id } = useParams();
    usePageMeta({ title: '모임', path: `/groups/${id}`, noindex: true });
    const isLogin = useSelector((state) => state.logincheck.isLogin);
    const { group, error, run } = useGroupDetail(id);
    return (
        <PageLayout>
            <div className="group-page">
                {error && <p className="group-empty">{error} {!isLogin && <Link to={`/login?next=/groups/${id}`}>로그인</Link>}</p>}
                {!error && !group && <p>불러오는 중…</p>}
                {group && <GroupBody group={group} run={run} />}
            </div>
        </PageLayout>
    );
};

export default GroupDetail;
