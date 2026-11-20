const MINUTE_MILLIS = 60 * 1000;
const KILOMETER = 1000;

export const formatDuration = (durationMillis) => {
    if (durationMillis == null) return '';
    const totalMinutes = Math.max(1, Math.round(durationMillis / MINUTE_MILLIS));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0) return `${minutes}분`;
    return minutes === 0 ? `${hours}시간` : `${hours}시간 ${minutes}분`;
};

export const formatDistance = (distanceMeters) => {
    if (distanceMeters == null) return '';
    if (distanceMeters < KILOMETER) return `${Math.round(distanceMeters)}m`;
    return `${(distanceMeters / KILOMETER).toFixed(1)}km`;
};

// 직선 구간은 실제 이동 시간을 알 수 없어 합계에서 시간은 제외
// 시간을 아는 구간이 하나도 없으면(모두 직선) 합계 시간도 비움 → 화면에 "-"
const sumDurations = (legs) => {
    const timedLegs = legs.filter((leg) => leg.durationMillis != null);
    return timedLegs.length === 0 ? null : timedLegs.reduce((sum, leg) => sum + leg.durationMillis, 0);
};

export const summarizeLegs = (legs) => ({
    durationMillis: sumDurations(legs),
    distanceMeters: legs.reduce((sum, leg) => sum + (leg.distanceMeters || 0), 0),
    hasFallback: legs.some((leg) => leg.fallback && !leg.straight),
    hasStraight: legs.some((leg) => leg.straight),
    needsLogin: legs.some((leg) => leg.needsLogin),
});
