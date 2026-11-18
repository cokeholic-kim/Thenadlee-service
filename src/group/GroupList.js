import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { groupApi } from '../api/groupApi';
import PageLayout from '../components/PageLayout';
import usePageMeta from '../seo/usePageMeta';
import { getApiErrorMessage } from '../util/apiError';
import { formatPeriod } from './groupFormat';
import './Group.scss';

const GROUPS_META = { title: '내 모임', path: '/groups', noindex: true };

const CreateForm = ({ onCreated }) => {
    const [name, setName] = useState('');
    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            onCreated((await groupApi.create(name)).groupId);
        } catch (error) {
            alert(getApiErrorMessage(error));
        }
    };
    return (
        <form className="group-form group-form--row" onSubmit={onSubmit}>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength="50" placeholder="모임 이름 (예: 제주 우정여행)" required />
            <button type="submit" className="group-button is-primary">모임 만들기</button>
        </form>
    );
};

const GroupRow = ({ group }) => (
    <li className="group-card">
        <Link to={`/groups/${group.id}`}>
            <strong>{group.name}</strong>
            <span>{group.cityDisplayName || '여행지 미정'} · {formatPeriod(group.startDate, group.endDate)} · {group.memberCount}명{group.myRole === 'OWNER' ? ' · 방장' : ''}</span>
        </Link>
    </li>
);

const useMyGroups = (isLogin) => {
    const [groups, setGroups] = useState(null);
    const load = useCallback(() => { if (isLogin) groupApi.mine().then(setGroups).catch((error) => alert(getApiErrorMessage(error))); }, [isLogin]);
    useEffect(load, [load]);
    return groups;
};

// 내 모임 목록과 모임 만들기
const GroupList = () => {
    usePageMeta(GROUPS_META);
    const navigate = useNavigate();
    const { checked, isLogin } = useSelector((state) => state.logincheck);
    const groups = useMyGroups(isLogin);
    return (
        <PageLayout>
            <div className="group-page">
                <h1>내 모임</h1>
                <p className="group-page__intro">친구들과 함께 여행지를 정하고, 가고 싶은 장소를 모아 동선을 짜 보세요. 초대 링크로 친구를 불러올 수 있어요.</p>
                {checked && !isLogin && <p>모임 기능은 <Link to="/login?next=/groups">로그인</Link> 후 이용할 수 있어요.</p>}
                {isLogin && <CreateForm onCreated={(id) => navigate(`/groups/${id}`)} />}
                {groups?.length === 0 && <p className="group-empty">아직 참여한 모임이 없어요.</p>}
                {groups?.length > 0 && <ul className="group-list">{groups.map((group) => <GroupRow key={group.id} group={group} />)}</ul>}
            </div>
        </PageLayout>
    );
};

export default GroupList;
