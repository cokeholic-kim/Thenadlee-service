import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistance } from '../route/formatRoute';
import { travelModeLabel } from '../itinerary/timetable';
import { shorterOrder } from './planDay';

export const clockText = (clock) => `${clock.text}${clock.nextDay ? '(+1)' : ''}`;

/** 그날 출발·끝 시각 요약 (이동은 직선거리 어림이라 "약") */
export const DaySchedule = ({ timetable, travelMode }) => (timetable.rows.length === 0 ? null : (
    <p className="plan-day__schedule">
        🕘 {clockText(timetable.rows[0].arrive)} 출발 → 약 {clockText(timetable.end)} 끝
        <span> · {travelModeLabel(travelMode)} 기준 어림</span>
    </p>
));

// 직선거리로 더 짧은 순서가 있으면 안내 (방장은 지도에서 "동선 정리", 멤버는 안내만)
export const RouteHint = ({ day, group }) => {
    const shorter = shorterOrder(day);
    if (!shorter) return null;
    const mapPath = `/map/${group.city.name}?itinerary=${group.plan.itineraryId}&group=${group.id}`;
    return (
        <p className="plan-day__hint">
            더 짧은 순서가 있어요 (직선거리 {formatDistance(shorter.beforeMeters)} → {formatDistance(shorter.afterMeters)}).
            {group.myRole === 'OWNER' ? <> <Link to={mapPath}>지도에서 동선 정리</Link></> : ' 방장에게 알려 주세요.'}
        </p>
    );
};
