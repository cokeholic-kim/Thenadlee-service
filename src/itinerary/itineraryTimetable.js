import { DEFAULT_START_TIME, DEFAULT_STAY_MINUTES, buildTimetable } from './timetable';

// 저장된 일정(상세 응답)의 하루 시간표: day = { startTime, items: [{ spotId, lat, lon, stayMinutes }] }
export const dayTimetable = (day, legs, travelMode) => buildTimetable(
    day.items.map((item) => ({ ...item, id: item.spotId })),
    {
        startTime: day.startTime || DEFAULT_START_TIME,
        stayOf: (item) => item.stayMinutes ?? DEFAULT_STAY_MINUTES,
        legs,
        travelMode,
    },
);
