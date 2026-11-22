import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import MapView from '../map/MapView';
import MapScriptGate from '../map/MapScriptGate';
import { providerFor } from '../map/mapProvider';
import useRouteLegs from '../route/useRouteLegs';
import { legsToLines } from '../route/legsToLines';
import { formatDistance, formatDuration, summarizeLegs } from '../route/formatRoute';
import { findTravelMode } from '../route/travelModes';
import { loginPathHere } from '../session/loginPath';
import { dayTimetable } from '../itinerary/itineraryTimetable';
import DayTimetableList from './DayTimetableList';
import { categoryColor } from '../community/spotCategories';
import CategoryLegend from '../map/CategoryLegend';

const MAP_STYLE = { width: '100%', height: '360px' };

const toPlaces = (items) => items.map((item) => ({ lat: item.lat, lon: item.lon, spotName: item.spotName, category: item.category }));

const RouteSummary = ({ legs, loading, travelMode, placeCount }) => {
    if (placeCount < 2) return <p className="itinerary-map__note">장소가 1곳이라 이동 경로가 없어요.</p>;
    if (loading && legs.length === 0) return <p className="itinerary-map__note">경로를 찾는 중…</p>;
    const summary = summarizeLegs(legs);
    return (
        <div className="itinerary-map__summary">
            <strong>{findTravelMode(travelMode).label} · 총 {formatDuration(summary.durationMillis) || '-'} · {formatDistance(summary.distanceMeters)}</strong>
            {summary.hasStraight && <p className="itinerary-map__note">경로를 찾지 못한 구간은 점선으로 표시했어요.</p>}
            {summary.needsLogin && <p className="itinerary-map__note">오늘 비로그인 길찾기 사용량을 다 써서 일부 구간을 직선으로 표시했어요. <Link to={loginPathHere()}>로그인</Link>하면 실제 경로를 볼 수 있어요.</p>}
        </div>
    );
};

// 고른 일차의 장소를 지도에 번호와 함께 찍고, 저장된 이동수단으로 실제 경로를 그림 + 그 경로로 계산한 시간표
const DayRouteMap = ({ day, travelMode, provider }) => {
    const { items } = day;
    const places = useMemo(() => toPlaces(items), [items]);
    // 핀에 종류 색과 방문 순서 번호, 이름표는 장소 이름
    const markers = useMemo(() => places.map((place, index) => ({ lat: place.lat, lng: place.lon, label: place.spotName, color: categoryColor(place.category), badge: index + 1 })), [places]);
    const { legs, loading } = useRouteLegs(places, travelMode, true, null, provider);
    const lines = useMemo(() => legsToLines(legs), [legs]);
    const timetable = useMemo(() => dayTimetable(day, loading ? [] : legs, travelMode), [day, legs, loading, travelMode]);
    const center = markers[0] ? { lat: markers[0].lat, lng: markers[0].lng } : null;
    if (!center) return <p className="itinerary-map__note">이 날은 담은 장소가 없어요.</p>;
    return (
        <>
            <MapView provider={provider} center={center} markers={markers} lines={lines} fitTo={markers} className="itinerary-map__map" style={MAP_STYLE} markerIcon="pin" />
            <CategoryLegend spots={places} />
            <RouteSummary legs={legs} loading={loading} travelMode={travelMode} placeCount={places.length} />
            <DayTimetableList items={items} timetable={timetable} />
        </>
    );
};

const DayTabs = ({ days, active, onChange }) => (days.length < 2 ? null : (
    <div className="itinerary-map__tabs" role="tablist" aria-label="일차 선택">
        {days.map((day, index) => (
            <button key={day.dayNo} type="button" role="tab" aria-selected={active === index} className={active === index ? 'is-active' : ''}
                onClick={() => onChange(index)}>{day.dayNo}일차</button>
        ))}
    </div>
));

// 공개 일정 페이지 지도 (국내는 카카오맵, 해외는 Google)
const ItineraryMap = ({ itinerary }) => {
    const [active, setActive] = useState(0);
    const provider = providerFor(itinerary.region);
    if (!itinerary.days.some((day) => day.items.length > 0)) return null;
    return (
        <section className="itinerary-map">
            <h2>지도로 보기</h2>
            <DayTabs days={itinerary.days} active={active} onChange={setActive} />
            <MapScriptGate provider={provider}>
                <DayRouteMap key={active} day={itinerary.days[active]} travelMode={itinerary.travelMode} provider={provider} />
            </MapScriptGate>
        </section>
    );
};

export default ItineraryMap;
