const EARTH_RADIUS_METERS = 6371000;

const toRadian = (degree) => (degree * Math.PI) / 180;

// 두 지점({lat, lng}) 사이 직선거리(m, 하버사인 공식) — 지도 라이브러리와 무관하게 계산
export const straightDistance = (origin, destination) => {
    const dLat = toRadian(destination.lat - origin.lat);
    const dLng = toRadian(destination.lng - origin.lng);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadian(origin.lat)) * Math.cos(toRadian(destination.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(a));
};
