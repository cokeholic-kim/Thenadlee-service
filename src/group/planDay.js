import { DEFAULT_START_TIME, DEFAULT_STAY_MINUTES, buildTimetable } from '../itinerary/timetable';
import { optimizeSpotOrder } from '../itinerary/routeOrder';

// 모임 계획 탭 하루 정보: 시간표(직선거리로 이동 시간 어림, 길찾기 호출 없음)와 더 짧은 순서가 있는지
//   day = { startTime, spots: [{ spotId, lat, lon, stayMinutes }] }
export const planDayTimetable = (day, travelMode) => buildTimetable(
    day.spots.map((spot) => ({ ...spot, id: spot.spotId })),
    { startTime: day.startTime || DEFAULT_START_TIME, stayOf: (spot) => spot.stayMinutes ?? DEFAULT_STAY_MINUTES, travelMode },
);

/** 직선거리 기준으로 줄일 수 있으면 { beforeMeters, afterMeters }, 아니면 null */
export const shorterOrder = (day) => {
    const result = optimizeSpotOrder(day.spots);
    return result.changed ? { beforeMeters: result.beforeMeters, afterMeters: result.afterMeters } : null;
};
