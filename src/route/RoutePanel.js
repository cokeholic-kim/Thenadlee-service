import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TRAVEL_MODES, findTravelMode } from './travelModes';
import { formatDistance, formatDuration, summarizeLegs } from './formatRoute';
import './RoutePanel.scss';
import { loginPathHere } from '../session/loginPath';

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

const LoadingText = ({ children }) => (
    <span className="route-panel__loading" role="status"><span className="route-panel__spinner" aria-hidden="true" />{children}</span>
);

// 이동수단을 바꾸면 이전 합계 대신 "다시 찾는 중"을 보여 줌 (길찾기 응답까지 1~2초 걸림)
const RouteTotal = ({ summary, loading, open, onToggle }) => (
    <button type="button" className={`route-panel__total${loading ? ' is-loading' : ''}`} onClick={onToggle} aria-expanded={open} aria-busy={loading}>
        {loading ? <LoadingText>경로를 다시 찾는 중…</LoadingText>
            : <span>총 {formatDuration(summary.durationMillis) || '-'} · {formatDistance(summary.distanceMeters)}</span>}
        <span className="route-panel__toggle">{open ? '접기' : '구간 보기'}</span>
    </button>
);

const RouteSummary = ({ legs, places, loading }) => {
    const [open, setOpen] = useState(false);
    if (places.length < 2) return <p className="route-panel__hint">장소를 2곳 이상 담으면 경로가 표시돼요.</p>;
    if (loading && legs.length === 0) return <p className="route-panel__hint"><LoadingText>경로를 찾는 중…</LoadingText></p>;
    const summary = summarizeLegs(legs);
    return (
        <>
            <RouteTotal summary={summary} loading={loading} open={open} onToggle={() => setOpen(!open)} />
            {summary.hasFallback && <p className="route-panel__note">선택한 수단의 경로가 없는 구간은 다른 수단으로 표시했어요.</p>}
            {summary.hasStraight && <p className="route-panel__note">경로를 찾지 못한 구간은 점선으로 표시했어요.</p>}
            {summary.needsLogin && <p className="route-panel__note">오늘 비로그인 길찾기 사용량을 다 써서 일부 구간을 직선으로 표시했어요. <Link to={loginPathHere()}>로그인</Link>하면 계속 볼 수 있어요.</p>}
            {open && <div className={loading ? 'is-stale' : ''}><LegList legs={legs} places={places} /></div>}
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
