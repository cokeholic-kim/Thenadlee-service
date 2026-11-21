import React from 'react';
import { formatStay, travelModeLabel } from '../itinerary/timetable';

const clockText = (clock) => `${clock.text}${clock.nextDay ? '(+1)' : ''}`;

// 일정 페이지 지도 아래 그날 시간표 (도착–출발, 머무는 시간, 다음 장소까지 이동)
const DayTimetableList = ({ items, timetable }) => (
    <ol className="day-timetable" aria-label="시간표">
        {timetable.rows.map((row, index) => (
            <li key={row.id}>
                {row.travel && <p className="day-timetable__travel">↓ {travelModeLabel(row.travel.mode)} {row.travel.estimated ? '약 ' : ''}{formatStay(row.travel.minutes)}</p>}
                <div className="day-timetable__row">
                    <span className="day-timetable__clock">{clockText(row.arrive)}–{clockText(row.leave)}</span>
                    <strong>{items[index].spotName}</strong>
                    <span className="day-timetable__stay">{formatStay(row.stay)}</span>
                </div>
            </li>
        ))}
    </ol>
);

export default DayTimetableList;
