import { straightDistance } from '../route/geoDistance';
import { optimizeSpotOrder } from './routeOrder';

// 일차 사이 장소 재배분: 담은 장소 전체를 가까운 것끼리 일차 수만큼 묶고(일차별 장소 수는 고르게), 일차 안은 가까운 순서로
//   직선거리 기준이라 길찾기 API 를 부르지 않음. 묶음은 지도 중심 둘레를 도는 방향 순서로 1일차부터 배치
const MAX_ROUNDS = 12;
// 일차 안 이동 거리 합이 이만큼 줄지 않으면 바꾸지 않음
const MIN_SAVING_RATIO = 0.05;

const toPoint = (spot) => ({ lat: Number(spot.lat), lng: Number(spot.lon) });
const hasCoordinate = (spot) => Number.isFinite(Number(spot.lat)) && Number.isFinite(Number(spot.lon)) && spot.lat !== null && spot.lon !== null;

const centroid = (points) => ({
    lat: points.reduce((sum, p) => sum + p.lat, 0) / points.length,
    lng: points.reduce((sum, p) => sum + p.lng, 0) / points.length,
});

// 서로 멀리 떨어진 점부터 중심으로 고름 (첫 중심은 전체 중심에서 가장 먼 점)
const initialCenters = (points, count) => {
    const center = centroid(points);
    const far = (from) => points.reduce((best, p) => (from(p) > from(best) ? p : best), points[0]);
    const centers = [far((p) => straightDistance(p, center))];
    while (centers.length < count) centers.push(far((p) => Math.min(...centers.map((c) => straightDistance(p, c)))));
    return centers;
};

// 가까운 (장소, 중심) 짝부터 정원(ceil(N/k))이 찰 때까지 배정
const assign = (points, centers) => {
    const capacity = Math.ceil(points.length / centers.length);
    const pairs = points.flatMap((p, i) => centers.map((c, j) => ({ i, j, d: straightDistance(p, c) }))).sort((a, b) => a.d - b.d);
    const groupOf = new Array(points.length).fill(-1);
    const sizes = new Array(centers.length).fill(0);
    pairs.forEach(({ i, j }) => {
        if (groupOf[i] !== -1 || sizes[j] >= capacity) return;
        groupOf[i] = j;
        sizes[j] += 1;
    });
    return groupOf;
};

const clusterPoints = (points, count) => {
    let centers = initialCenters(points, count);
    let groupOf = assign(points, centers);
    for (let round = 0; round < MAX_ROUNDS; round += 1) {
        centers = centers.map((c, j) => { const members = points.filter((_, i) => groupOf[i] === j); return members.length ? centroid(members) : c; });
        const next = assign(points, centers);
        if (next.every((g, i) => g === groupOf[i])) break;
        groupOf = next;
    }
    return { groupOf, centers };
};

// 일차 안 순서: 전체 중심(숙소 근처로 봄)에 가장 가까운 장소에서 출발해 가까운 순서로
const orderDay = (spots, center) => {
    if (spots.length < 2) return spots;
    const start = spots.reduce((best, s) => (straightDistance(toPoint(s), center) < straightDistance(toPoint(best), center) ? s : best), spots[0]);
    return optimizeSpotOrder([start, ...spots.filter((s) => s !== start)]).spots;
};

const dayLength = (spots) => spots.slice(1).reduce((sum, s, i) => sum + straightDistance(toPoint(spots[i]), toPoint(s)), 0);
const totalLength = (days) => days.reduce((sum, spots) => sum + dayLength(spots), 0);

/** 재배분할 수 있는지: 2일 이상, 장소가 일차 수보다 많고 모두 좌표가 있을 때 */
export const canRedistribute = (days) => {
    const spots = days.flat();
    return days.length >= 2 && spots.length > days.length && spots.every(hasCoordinate);
};

/**
 * @param days 일차별 장소 목록
 * @returns {{ days, beforeMeters, afterMeters, changed }}
 */
export const redistributeDays = (days) => {
    if (!canRedistribute(days)) return { days, beforeMeters: 0, afterMeters: 0, changed: false };
    const spots = days.flat();
    const points = spots.map(toPoint);
    const center = centroid(points);
    const { groupOf, centers } = clusterPoints(points, days.length);
    const angle = (c) => Math.atan2(c.lat - center.lat, c.lng - center.lng);
    const dayOrder = centers.map((c, j) => ({ j, a: angle(c) })).sort((x, y) => x.a - y.a).map(({ j }) => j);
    const next = dayOrder.map((j) => orderDay(spots.filter((_, i) => groupOf[i] === j), center));
    const beforeMeters = totalLength(days);
    const afterMeters = totalLength(next);
    const changed = beforeMeters - afterMeters > beforeMeters * MIN_SAVING_RATIO;
    return { days: changed ? next : days, beforeMeters, afterMeters, changed };
};
