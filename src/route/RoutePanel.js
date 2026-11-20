import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TRAVEL_MODES, findTravelMode } from './travelModes';
import { formatDistance, formatDuration, summarizeLegs } from './formatRoute';
import './RoutePanel.scss';

const ModeSelector = ({ travelMode, onChange }) => (
    <div className="route-panel__modes" role="radiogroup" aria-label="이동수단">
        {TRAVEL_MODES.map((mode) => (
            <button key={mode.value} type="button" role="radio" aria-checked={travelMode === mode.value}
                className={travelMode === mode.value ? 'active' : ''} style={{ '--mode-color': mode.color }}
                onClick={() => onChange(mode.value)}>
                {mode.label}
            </button>
        ))}
    </div>
);

// 로그인 후 지금 보던 화면으로 돌아오도록 next 를 붙임
const loginPath = () => `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;

const legLabel = (leg) => (leg.straight ? '경로 없음(직선)' : findTravelMode(leg.mode)?.label);

const LegList = ({ legs, places }) => (
    <ol className="route-panel__legs">
        {legs.map((leg, index) => (
            <li key={index}>
                <span className="route-panel__leg-name">{places[index]?.spotName} → {places[index + 1]?.spotName}</span>
                <span className={`route-panel__leg-info ${leg.fallback ? 'is-fallback' : ''}`}>
                    {legLabel(leg)} · {[formatDuration(leg.durationMillis), formatDistance(leg.distanceMeters)].filter(Boolean).join(' · ')}
                </span>
            </li>
        ))}
    </ol>
);

const RouteSummary = ({ legs, places, loading }) => {
    const [open, setOpen] = useState(false);
    if (places.length < 2) return <p className="route-panel__hint">장소를 2곳 이상 담으면 경로가 표시돼요.</p>;
    if (loading && legs.length === 0) return <p className="route-panel__hint">경로를 찾는 중…</p>;
    const summary = summarizeLegs(legs);
    return (
        <>
            <button type="button" className="route-panel__total" onClick={() => setOpen(!open)} aria-expanded={open}>
                총 {formatDuration(summary.durationMillis) || '-'} · {formatDistance(summary.distanceMeters)}
                <span className="route-panel__toggle">{open ? '접기' : '구간 보기'}</span>
            </button>
            {summary.hasFallback && <p className="route-panel__note">선택한 수단의 경로가 없는 구간은 다른 수단으로 표시했어요.</p>}
            {summary.hasStraight && <p className="route-panel__note">경로를 찾지 못한 구간은 점선으로 표시했어요.</p>}
            {summary.needsLogin && <p className="route-panel__note">오늘 비로그인 길찾기 사용량을 다 써서 일부 구간을 직선으로 표시했어요. <Link to={loginPath()}>로그인</Link>하면 계속 볼 수 있어요.</p>}
            {open && <LegList legs={legs} places={places} />}
        </>
    );
};

const RoutePanel = ({ travelMode, onChangeMode, legs, places, loading }) => (
    <section className="route-panel" aria-label="이동 경로">
        <ModeSelector travelMode={travelMode} onChange={onChangeMode} />
        <RouteSummary legs={legs} places={places} loading={loading} />
    </section>
);

export default RoutePanel;
