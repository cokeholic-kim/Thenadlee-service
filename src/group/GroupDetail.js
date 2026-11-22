import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { groupApi } from '../api/groupApi';
import PageLayout from '../components/PageLayout';
import usePageMeta from '../seo/usePageMeta';
import { getApiErrorMessage } from '../util/apiError';
import AlbumTab from './AlbumTab';
import ExpenseTab from './ExpenseTab';
import MemberPanel from './MemberPanel';
import PlanTab from './PlanTab';
import SummaryTab from './SummaryTab';
import { formatDateTime, formatPeriod } from './groupFormat';
import useGroupDetail from './useGroupDetail';
import './Group.scss';
import { toastError, confirmDialog } from '../ui/feedback';
import { notifyGroupSeen } from '../notification/groupNewsEvents';

// seen: 새 소식을 세는 탭 (서버 SeenSection)
const TABS = [
    { value: 'plan', label: '계획', seen: 'PLAN' },
    { value: 'expense', label: '정산', seen: 'EXPENSE' },
    { value: 'album', label: '앨범', seen: 'ALBUM' },
    { value: 'summary', label: '요약' },
    { value: 'members', label: '멤버' },
    { value: 'activity', label: '활동' },
];

// 보고 있는 탭은 확인한 것으로 기록 (화면을 다시 불러올 때마다 갱신, 본인 기록만)
//   서버 숫자는 다음 갱신 때 바뀌므로, 그 전까지 이번에 본 탭의 배지는 화면에서 바로 숨김
const useMarkSeen = (group, tab) => {
    const section = TABS.find((item) => item.value === tab)?.seen;
    const [viewed, setViewed] = useState({ group, tabs: [tab] });
    const notified = useRef('');
    useEffect(() => {
        // 헤더 알림 종은 탭을 처음 볼 때만 다시 셈 (15초마다 다시 불러올 때는 생략)
        const key = `${group.id}:${section}`;
        if (section) groupApi.markSeen(group.id, section).then(() => { if (notified.current !== key) { notified.current = key; notifyGroupSeen(); } }).catch(() => {});
        setViewed((current) => (current.group === group ? { group, tabs: [...current.tabs, tab] } : { group, tabs: [tab] }));
    }, [group, section, tab]);
    return viewed.tabs;
};

const TabButton = ({ item, active, unread, onClick }) => (
    <button type="button" className={active ? 'active' : ''} onClick={onClick}>
        {item.label}{!active && unread > 0 && <span className="tab-badge" aria-label={`새 소식 ${unread}개`}>{unread}</span>}
    </button>
);

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
        if (!await confirmDialog(deleting ? '모임을 삭제할까요? 계획 내용이 모두 지워져요.' : '모임에서 나갈까요?')) return;
        try {
            await groupApi.leave(group.id);
            navigate('/groups', { replace: true });
        } catch (error) {
            toastError(getApiErrorMessage(error));
        }
    };
};

const GroupBody = ({ group, run }) => {
    const [tab, setTab] = useState('plan');
    const onLeave = useLeave(group);
    const viewedTabs = useMarkSeen(group, tab);
    const unread = group.board.unread;
    return (
        <>
            <GroupHeader group={group} run={run} />
            <nav className="group-tabs">{TABS.map((item) => <TabButton key={item.value} item={item} active={tab === item.value} unread={viewedTabs.includes(item.value) ? 0 : unread[item.value] || 0} onClick={() => setTab(item.value)} />)}</nav>
            {tab === 'plan' && <PlanTab group={group} run={run} />}
            {tab === 'expense' && <ExpenseTab group={group} run={run} />}
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
