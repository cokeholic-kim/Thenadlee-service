import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDayStartTime } from '../modules/itinerary';
import { DEFAULT_START_TIME, DEFAULT_STAY_MINUTES, buildTimetable } from '../itinerary/timetable';

// 현재 일차 시간표 (경로를 다시 찾는 중에는 이전 구간 대신 거리로 어림)
export const useDayTimetable = (spots, route) => {
    const { dayStartTimes, stayMinutes } = useSelector((state) => state.itinerary);
    const activeDay = useSelector((state) => state.add.activeDay);
    const startTime = dayStartTimes[activeDay] || DEFAULT_START_TIME;
    const legs = route?.loading ? [] : route?.legs;
    return useMemo(() => buildTimetable(spots, {
        startTime, legs, travelMode: route?.travelMode, stayOf: (spot) => stayMinutes[spot.id] ?? DEFAULT_STAY_MINUTES,
    }), [spots, startTime, legs, route?.travelMode, stayMinutes]);
};

// 일차별 출발 시각 (장소를 담았을 때만)
export const DayStartTime = ({ hasSpots }) => {
    const dispatch = useDispatch();
    const activeDay = useSelector((state) => state.add.activeDay);
    const startTime = useSelector((state) => state.itinerary.dayStartTimes[activeDay]) || DEFAULT_START_TIME;
    if (!hasSpots) return null;
    return (
        <label className="day-start-time">
            <span>{activeDay + 1}일차 출발</span>
            <input type="time" value={startTime} step={600} onChange={(e) => dispatch(setDayStartTime(activeDay, e.target.value))} />
        </label>
    );
};

export const DayEndTime = ({ timetable }) => {
    if (timetable.rows.length === 0) return null;
    return <p className="day-end-time">일정 끝 <strong>{timetable.end.text}</strong>{timetable.end.nextDay && ' (다음 날)'}</p>;
};
