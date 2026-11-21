import { straightDistance } from '../route/geoDistance';
import { findTravelMode } from '../route/travelModes';

// 일정 시간표: 출발 시각 → 머무는 시간 → 이동 시간 → 다음 장소 … 순서로 도착·출발 시각 계산
export const DEFAULT_START_TIME = '10:00';
export const DEFAULT_STAY_MINUTES = 60;
export const STAY_OPTIONS = [30, 60, 90, 120, 180, 240];

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;
const MILLIS_PER_MINUTE = 60 * 1000;
// 경로를 못 찾은(직선) 구간의 이동 시간 어림용 평균 속도 (km/h)
const ESTIMATE_SPEED_KMH = { WALKING: 4, TRANSIT: 18, DRIVING: 35 };
const METERS_PER_KM = 1000;

const toMinutes = (time) => {
    const [hours, minutes] = (time || DEFAULT_START_TIME).split(':').map(Number);
    return hours * MINUTES_PER_HOUR + minutes;
};

// 분 → "HH:MM" (자정을 넘으면 nextDay 로 표시)
export const formatClock = (totalMinutes) => {
    const dayMinutes = ((Math.round(totalMinutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
    const hours = String(Math.floor(dayMinutes / MINUTES_PER_HOUR)).padStart(2, '0');
    const minutes = String(dayMinutes % MINUTES_PER_HOUR).padStart(2, '0');
    return { text: `${hours}:${minutes}`, nextDay: totalMinutes >= MINUTES_PER_DAY };
};

export const formatStay = (minutes) => {
    const hours = Math.floor(minutes / MINUTES_PER_HOUR);
    const rest = minutes % MINUTES_PER_HOUR;
    if (hours === 0) return `${rest}분`;
    return rest === 0 ? `${hours}시간` : `${hours}시간 ${rest}분`;
};

const estimateMinutes = (meters, mode) => (meters / METERS_PER_KM / (ESTIMATE_SPEED_KMH[mode] || ESTIMATE_SPEED_KMH.TRANSIT)) * MINUTES_PER_HOUR;

const toPoint = (spot) => ({ lat: Number(spot.lat), lng: Number(spot.lon) });

// 구간 이동 시간: 계산된 경로가 있으면 그 시간, 없으면(직선·아직 계산 전) 거리로 어림
const travelOf = (leg, from, to, travelMode) => {
    const mode = leg?.mode || travelMode;
    if (leg?.durationMillis != null) return { minutes: Math.round(leg.durationMillis / MILLIS_PER_MINUTE), estimated: false, mode };
    const meters = leg?.distanceMeters ?? straightDistance(toPoint(from), toPoint(to));
    return { minutes: Math.max(1, Math.round(estimateMinutes(meters, mode))), estimated: true, mode };
};

export const travelModeLabel = (mode) => findTravelMode(mode)?.label || '';

/**
 * @param spots 그날 장소 순서대로 ({id, lat, lon})
 * @param options { startTime "HH:MM", stayOf(spot) → 분, legs (장소 i → i+1, 개수가 안 맞으면 모두 어림), travelMode }
 * @returns {{ rows: [{ id, arrive, leave, stay, travel }], end }} arrive·leave·end 는 formatClock 결과
 */
export const buildTimetable = (spots, { startTime, stayOf, legs = [], travelMode }) => {
    const usableLegs = legs.length === spots.length - 1 ? legs : [];
    let clock = toMinutes(startTime);
    const rows = spots.map((spot, index) => {
        const travel = index === 0 ? null : travelOf(usableLegs[index - 1], spots[index - 1], spot, travelMode);
        clock += travel?.minutes || 0;
        const arrive = clock;
        const stay = stayOf(spot);
        clock += stay;
        return { id: spot.id, arrive: formatClock(arrive), leave: formatClock(clock), stay, travel, arriveMinutes: arrive, leaveMinutes: clock };
    });
    return { rows, end: formatClock(clock) };
};
