import { computeLeg } from '../route/routeService';
import { dayTimetable } from './itineraryTimetable';

// 저장된 일정의 모든 일차 시간표 (캘린더·일정표 이미지·인쇄·엑셀 공용, 같은 구간은 지도에서 계산한 경로 캐시 사용)
const toPoint = (item) => ({ lat: Number(item.lat), lng: Number(item.lon) });

const computeDayLegs = async (items, travelMode, provider) => {
    const legs = [];
    for (let index = 1; index < items.length; index += 1) {
        legs.push(await computeLeg(toPoint(items[index - 1]), toPoint(items[index]), travelMode, null, provider));
    }
    return legs;
};

/** 일차 순서대로 시간표 [{ rows, end }] */
export const computeTimetables = async (itinerary, provider) => {
    const timetables = [];
    for (const day of itinerary.days) {
        const legs = await computeDayLegs(day.items, itinerary.travelMode, provider);
        timetables.push(dayTimetable(day, legs, itinerary.travelMode));
    }
    return timetables;
};
