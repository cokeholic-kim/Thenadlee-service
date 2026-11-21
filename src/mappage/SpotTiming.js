import React from 'react';
import { useDispatch } from 'react-redux';
import { setStayMinutes } from '../modules/itinerary';
import { STAY_OPTIONS, formatStay, travelModeLabel } from '../itinerary/timetable';

// 이전 장소에서 오는 이동 (경로를 못 찾은 구간은 "약")
export const TravelLine = ({ travel }) => (
    <p className="AddTurning_travel">
        ↓ {travelModeLabel(travel.mode)} {travel.estimated ? '약 ' : ''}{formatStay(travel.minutes)}
    </p>
);

const clockText = (clock) => `${clock.text}${clock.nextDay ? '(+1)' : ''}`;

// 도착–출발 시각과 머무는 시간 고르기 (저장된 값이 보기에 없으면 함께 보여 줌)
export const TimingRow = ({ spot, timing }) => {
    const dispatch = useDispatch();
    const options = STAY_OPTIONS.includes(timing.stay) ? STAY_OPTIONS : [...STAY_OPTIONS, timing.stay].sort((a, b) => a - b);
    return (
        <div className="AddTurning_timing">
            <span className="AddTurning_clock">{clockText(timing.arrive)}–{clockText(timing.leave)}</span>
            <select aria-label={`${spot.spotName} 머무는 시간`} value={timing.stay}
                onChange={(e) => dispatch(setStayMinutes(spot.id, Number(e.target.value)))}>
                {options.map((minutes) => <option key={minutes} value={minutes}>{formatStay(minutes)}</option>)}
            </select>
        </div>
    );
};
