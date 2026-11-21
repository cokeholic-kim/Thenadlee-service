import React, { useEffect, useState } from 'react';
import { fetchCities } from '../api/cityApi';
import { groupApi } from '../api/groupApi';
import { confirmDialog } from '../ui/feedback';

// 여행지·기간 확정은 셋을 함께 보내므로 바꾸지 않는 값은 현재 값을 그대로 보냄
export const confirmPlan = (group, changes) => groupApi.confirm(group.id, {
    cityId: group.city?.id ?? null, startDate: group.startDate, endDate: group.endDate, ...changes,
});

const useCities = () => {
    const [cities, setCities] = useState([]);
    useEffect(() => { fetchCities().then(setCities).catch(() => setCities([])); }, []);
    return cities;
};

const Candidate = ({ group, candidate, run, isOwner }) => (
    <li className={`group-item${group.city?.id === candidate.cityId ? ' is-confirmed' : ''}`}>
        <div className="group-item__text">
            <strong>{candidate.displayName}</strong>
            <span>{candidate.voteCount}표{group.city?.id === candidate.cityId ? ' · 확정된 여행지' : ''}</span>
        </div>
        <button type="button" className={`group-button is-small${candidate.votedByMe ? ' is-active' : ''}`} disabled={candidate.votedByMe}
            onClick={() => run(() => groupApi.voteCandidate(group.id, candidate.id))}>{candidate.votedByMe ? '내 선택' : '투표'}</button>
        {isOwner && group.city?.id !== candidate.cityId && (
            <button type="button" className="group-button is-small is-primary" onClick={() => run(() => confirmPlan(group, { cityId: candidate.cityId }))}>확정</button>
        )}
        {candidate.canDelete && <button type="button" className="group-button is-small is-danger"
            onClick={async () => await confirmDialog('이 후보를 지울까요?') && run(() => groupApi.removeCandidate(group.id, candidate.id))}>삭제</button>}
    </li>
);

// "+ 후보 여행지 추가"를 누르면 아직 후보가 아닌 여행지를 사진 카드로 보여 줌
const CandidatePicker = ({ options, onPick }) => {
    const [open, setOpen] = useState(false);
    if (!open) return <button type="button" className="group-button" onClick={() => setOpen(true)}>+ 후보 여행지 추가</button>;
    return (
        <div className="candidate-picker">
            <div className="candidate-picker__head"><strong>후보로 올릴 여행지를 고르세요</strong>
                <button type="button" className="group-button is-small" onClick={() => setOpen(false)}>닫기</button></div>
            <ul>{options.map((city) => (
                <li key={city.id}><button type="button" onClick={() => { onPick(city.id); setOpen(false); }}>
                    {city.titleImageUrl && <img src={city.titleImageUrl} alt="" loading="lazy" />}
                    <span>{city.displayName}</span><em>{city.region === 'DOMESTIC' ? '국내' : '해외'}</em>
                </button></li>
            ))}</ul>
        </div>
    );
};

// 후보 여행지 1인 1표 투표, 방장은 확정
const CityPanel = ({ group, run }) => {
    const cities = useCities();
    const isOwner = group.myRole === 'OWNER';
    const candidateIds = new Set(group.candidates.map((candidate) => candidate.cityId));
    const options = cities.filter((city) => !candidateIds.has(city.id));
    return (
        <section className="group-section">
            <h2>어디로 갈까요?</h2>
            <p className="group-hint">후보를 올리고 1인 1표로 투표해요. {isOwner ? '방장인 내가 최종 여행지를 확정해요.' : '최종 여행지는 방장이 확정해요.'}</p>
            <ul className="group-items">{group.candidates.map((candidate) => <Candidate key={candidate.id} group={group} candidate={candidate} run={run} isOwner={isOwner} />)}</ul>
            {options.length > 0 && <CandidatePicker options={options} onPick={(cityId) => run(() => groupApi.addCandidate(group.id, cityId))} />}
        </section>
    );
};

export default CityPanel;
