import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { groupApi } from '../api/groupApi';
import { fetchMyItineraries } from '../api/itineraryApi';
import { formatDateTime } from './groupFormat';
import { PlanComments } from './SpotComments';

// 방장: 내 일정 중 확정 여행지의 일정을 골라 모임 동선으로 연결
const LinkForm = ({ group, run }) => {
    const [itineraries, setItineraries] = useState([]);
    useEffect(() => {
        fetchMyItineraries().then((list) => setItineraries(list.filter((item) => item.cityName === group.city.name))).catch(() => setItineraries([]));
    }, [group.city.name]);
    if (itineraries.length === 0) return null;
    return (
        <select className="group-select" value="" aria-label="내 일정 연결" onChange={(e) => e.target.value && run(() => groupApi.linkPlan(group.id, Number(e.target.value)))}>
            <option value="">내 일정에서 골라 연결하기</option>
            {itineraries.map((item) => <option key={item.id} value={item.id}>{item.title} ({item.dayCount}일 · {item.spotCount}곳)</option>)}
        </select>
    );
};

const PlanSummary = ({ group, run, isOwner }) => (
    <div className="group-item is-confirmed">
        <div className="group-item__text">
            <strong>{group.plan.title}</strong>
            <span>{group.plan.dayCount}일 · 장소 {group.plan.spotCount}곳 · {formatDateTime(group.plan.updatedAt)} 수정</span>
        </div>
        <Link className="group-button is-small is-primary" to={`/map/${group.city.name}?itinerary=${group.plan.itineraryId}&group=${group.id}`}>지도에서 보기</Link>
        {isOwner && <button type="button" className="group-button is-small" onClick={() => run(() => groupApi.unlinkPlan(group.id))}>연결 해제</button>}
    </div>
);

// 확정 동선: 방장이 지도에서 짠 일정을 연결, 멤버는 열람하고 장소마다 댓글
const PlanPanel = ({ group, run }) => {
    const isOwner = group.myRole === 'OWNER';
    return (
        <section className="group-section">
            <h2>확정 동선</h2>
            {!group.city && <p className="group-hint">여행지를 먼저 확정해 주세요.</p>}
            {group.city && group.plan && <PlanSummary group={group} run={run} isOwner={isOwner} />}
            {group.city && group.plan && <PlanComments key={group.plan.itineraryId} group={group} />}
            {group.city && !group.plan && <p className="group-empty">{isOwner ? '아직 연결한 동선이 없어요.' : '방장이 동선을 확정하면 여기에 보여요.'}</p>}
            {group.city && isOwner && (
                <div className="group-actions">
                    <Link className="group-button" to={`/map/${group.city.name}?group=${group.id}`}>지도에서 동선 짜기</Link>
                    <LinkForm group={group} run={run} />
                </div>
            )}
            {isOwner && group.city && <p className="group-hint">지도에서 일정을 저장하면 이 모임의 확정 동선으로 자동 연결돼요.</p>}
        </section>
    );
};

export default PlanPanel;
