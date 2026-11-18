import axios from 'axios';
import { API_URL } from '../config/apiurl';
import { MAP_PROVIDERS } from '../map/mapProvider';
import { FALLBACK_ORDER } from './travelModes';

const GOOGLE_ROUTE_FIELDS = ['distanceMeters', 'durationMillis', 'path'];
const TRANSIT_MODE = 'TRANSIT';
const SECOND_MILLIS = 1000;
const EARTH_RADIUS_METERS = 6371000;

// 같은 구간·수단은 다시 요청하지 않도록 세션 동안 결과를 보관 (Google 은 요청당 과금, 카카오는 서버에서도 캐시)
const routeCache = new Map();
let googleRouteClassPromise = null;

const readCoordinate = (value) => (typeof value === 'function' ? value() : value);
const toLatLng = (point) => ({ lat: readCoordinate(point.lat), lng: readCoordinate(point.lng) });

// 출발 시각은 Google 대중교통에만 적용 (자동차에 넣으면 교통량 반영 상위 요금으로 과금, 카카오는 출발 시각 미지원)
const departureFor = (mode, departureTime, provider) =>
    (mode === TRANSIT_MODE && provider === MAP_PROVIDERS.GOOGLE ? departureTime : null);

const cacheKey = (origin, destination, mode, departureTime, provider) =>
    `${provider}:${origin.lat},${origin.lng}>${destination.lat},${destination.lng}@${mode}#${departureTime?.getTime() ?? 'now'}`;

const fetchGoogleRoute = async (origin, destination, mode, departureTime) => {
    googleRouteClassPromise ??= window.google.maps.importLibrary('routes').then((library) => library.Route);
    const Route = await googleRouteClassPromise;
    const request = { origin, destination, travelMode: mode, fields: GOOGLE_ROUTE_FIELDS };
    if (departureTime) request.departureTime = departureTime;
    const route = (await Route.computeRoutes(request)).routes?.[0];
    if (!route) return null;
    return { mode, distanceMeters: route.distanceMeters, durationMillis: route.durationMillis, path: route.path.map(toLatLng) };
};

// 국내: 백엔드가 카카오 길찾기를 대신 호출 (REST 키 보호·캐시·일일 상한)
// available=false(상한 도달 등)는 "경로 없음"과 달리 다시 시도할 수 있게 오류로 처리
const fetchKakaoRoute = async (origin, destination, mode) => {
    const params = { mode, from: `${origin.lat},${origin.lng}`, to: `${destination.lat},${destination.lng}` };
    const body = (await axios.get(`${API_URL}/routes`, { params })).data.body;
    if (!body.available) throw new Error('국내 길찾기를 지금은 사용할 수 없습니다.');
    if (!body.found) return null;
    return {
        mode,
        distanceMeters: body.distanceMeters,
        durationMillis: body.durationSeconds * SECOND_MILLIS,
        path: body.path.map(([lat, lng]) => ({ lat, lng })),
    };
};

// 경로 없음(null)은 캐시에 남기고, 네트워크·권한·상한 오류는 다음에 다시 시도할 수 있게 캐시에서 제거
const requestRoute = (origin, destination, mode, departureTime, provider) => {
    const departure = departureFor(mode, departureTime, provider);
    const key = cacheKey(origin, destination, mode, departure, provider);
    if (!routeCache.has(key)) {
        const fetcher = provider === MAP_PROVIDERS.KAKAO ? fetchKakaoRoute : fetchGoogleRoute;
        const pending = fetcher(origin, destination, mode, departure).catch((error) => {
            console.warn('경로 요청 실패', mode, error?.message);
            routeCache.delete(key);
            return null;
        });
        routeCache.set(key, pending);
    }
    return routeCache.get(key);
};

// 두 지점 사이 직선거리(m, 하버사인 공식) — 지도 라이브러리와 무관하게 계산
const straightDistance = (origin, destination) => {
    const toRadian = (degree) => (degree * Math.PI) / 180;
    const dLat = toRadian(destination.lat - origin.lat);
    const dLng = toRadian(destination.lng - origin.lng);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadian(origin.lat)) * Math.cos(toRadian(destination.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(a));
};

const straightLeg = (origin, destination) => ({
    mode: null,
    straight: true,
    fallback: true,
    distanceMeters: straightDistance(origin, destination),
    durationMillis: null,
    path: [origin, destination],
});

/**
 * 한 구간의 경로. 선택한 수단 → 나머지 수단 순으로 시도하고, 모두 없으면 직선
 * provider: 'google'(해외) | 'kakao'(국내)
 */
export const computeLeg = async (origin, destination, preferredMode, departureTime = null, provider = MAP_PROVIDERS.GOOGLE) => {
    const candidates = [preferredMode, ...FALLBACK_ORDER.filter((mode) => mode !== preferredMode)];
    for (const mode of candidates) {
        const route = await requestRoute(origin, destination, mode, departureTime, provider);
        if (route) return { ...route, straight: false, fallback: mode !== preferredMode };
    }
    return straightLeg(origin, destination);
};
