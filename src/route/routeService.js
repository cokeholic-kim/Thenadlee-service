import { FALLBACK_ORDER } from './travelModes';

const ROUTE_FIELDS = ['distanceMeters', 'durationMillis', 'path'];

// 같은 구간·수단은 다시 요청하지 않도록 세션 동안 결과를 보관 (Routes API 는 요청당 과금)
const routeCache = new Map();
let routeClassPromise = null;

const loadRouteClass = () => {
    routeClassPromise ??= window.google.maps.importLibrary('routes').then((library) => library.Route);
    return routeClassPromise;
};

const readCoordinate = (value) => (typeof value === 'function' ? value() : value);

const toLatLng = (point) => ({ lat: readCoordinate(point.lat), lng: readCoordinate(point.lng) });

const TRANSIT_MODE = 'TRANSIT';

// 출발 시각은 대중교통에만 적용 (자동차에 넣으면 교통량 반영 상위 요금으로 과금됨)
const departureFor = (mode, departureTime) => (mode === TRANSIT_MODE ? departureTime : null);

const cacheKey = (origin, destination, mode, departureTime) =>
    `${origin.lat},${origin.lng}>${destination.lat},${destination.lng}@${mode}#${departureTime?.getTime() ?? 'now'}`;

const buildRequest = (origin, destination, mode, departureTime) => {
    const request = { origin, destination, travelMode: mode, fields: ROUTE_FIELDS };
    if (departureTime) request.departureTime = departureTime;
    return request;
};

const fetchRoute = async (origin, destination, mode, departureTime) => {
    const Route = await loadRouteClass();
    const { routes } = await Route.computeRoutes(buildRequest(origin, destination, mode, departureTime));
    const route = routes?.[0];
    if (!route) return null;
    return {
        mode,
        distanceMeters: route.distanceMeters,
        durationMillis: route.durationMillis,
        path: route.path.map(toLatLng),
    };
};

// 경로 없음(null)은 캐시에 남기고, 네트워크·권한 오류는 다음에 다시 시도할 수 있게 캐시에서 제거
const requestRoute = (origin, destination, mode, departureTime) => {
    const departure = departureFor(mode, departureTime);
    const key = cacheKey(origin, destination, mode, departure);
    if (!routeCache.has(key)) {
        const pending = fetchRoute(origin, destination, mode, departure).catch((error) => {
            console.warn('경로 요청 실패', mode, error?.message);
            routeCache.delete(key);
            return null;
        });
        routeCache.set(key, pending);
    }
    return routeCache.get(key);
};

const straightLeg = (origin, destination) => ({
    mode: null,
    straight: true,
    fallback: true,
    distanceMeters: window.google.maps.geometry.spherical.computeDistanceBetween(origin, destination),
    durationMillis: null,
    path: [origin, destination],
});

/**
 * 한 구간의 경로. 선택한 수단 → 나머지 수단 순으로 시도하고, 모두 없으면 직선
 * (예: 제주는 자동차·도보 경로가 없어 대중교통으로 대체)
 */
export const computeLeg = async (origin, destination, preferredMode, departureTime = null) => {
    const candidates = [preferredMode, ...FALLBACK_ORDER.filter((mode) => mode !== preferredMode)];
    for (const mode of candidates) {
        const route = await requestRoute(origin, destination, mode, departureTime);
        if (route) return { ...route, straight: false, fallback: mode !== preferredMode };
    }
    return straightLeg(origin, destination);
};
