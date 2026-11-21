import { CITY_NAMES } from '../seo/pageMeta';

export const VISIBILITY_OPTIONS = [
    { value: 'PRIVATE', label: '나만 보기' },
    { value: 'PUBLIC', label: '공개 (링크가 있으면 누구나 보기)' },
];

export const defaultTitle = (cityName, dayCount) => `${CITY_NAMES[cityName] || cityName} ${dayCount}일 여행`;

export const countSpots = (days) => days.reduce((sum, spots) => sum + spots.length, 0);

// 서버 저장 형식: 일차 순서대로 장소 ID 목록
export const buildItineraryPayload = ({ cityName, days, itinerary, form }) => ({
    cityName,
    title: form.title.trim(),
    description: form.description.trim(),
    startDate: itinerary.startDate || '',
    endDate: itinerary.endDate || '',
    travelMode: itinerary.travelMode,
    visibility: form.visibility,
    // 시간표: 일차별 출발 시각, 장소별 머무는 시간 (정하지 않았으면 비워서 보냄)
    days: days.map((spots, index) => ({
        startTime: itinerary.dayStartTimes?.[index] || '',
        items: spots.map((spot) => ({ spotId: spot.id, stayMinutes: itinerary.stayMinutes?.[spot.id] ?? null })),
    })),
    // 남의 공개 일정을 불러와 새로 저장하면 원본 기록 ("○명이 이 일정으로 시작했어요")
    ...(itinerary.id && !itinerary.isOwner ? { sourceItineraryId: itinerary.id } : {}),
});
