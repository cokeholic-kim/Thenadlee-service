import { straightDistance } from '../route/geoDistance';

// 동선 자동 정렬: 첫 장소(출발지)는 그대로 두고, 나머지를 직선거리 기준으로 가까운 순서로 다시 배열
//   8곳 이하는 모든 순서를 따져 가장 짧은 순서, 그보다 많으면 가까운 곳부터 고른 뒤 구간 뒤집기·옮기기로 줄여 나감
// 길찾기 API 를 부르지 않으므로(호출 몫·비용 없음) 결과는 "직선거리 기준"으로 안내
export const MIN_SPOTS_TO_OPTIMIZE = 3;
const MIN_SAVING_RATIO = 0.01;
const EXACT_LIMIT = 8;

const toPoint = (spot) => ({ lat: Number(spot.lat), lng: Number(spot.lon) });

const isNumberLike = (value) => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));

const hasCoordinate = (spot) => isNumberLike(spot.lat) && isNumberLike(spot.lon);

const pathLength = (points, order) => order.slice(1)
    .reduce((sum, index, step) => sum + straightDistance(points[order[step]], points[index]), 0);

const nearestNeighborOrder = (points) => {
    const order = [0];
    const remaining = new Set(points.keys());
    remaining.delete(0);
    while (remaining.size > 0) {
        const last = points[order[order.length - 1]];
        const next = [...remaining].reduce((best, index) =>
            (straightDistance(last, points[index]) < straightDistance(last, points[best]) ? index : best));
        order.push(next);
        remaining.delete(next);
    }
    return order;
};

// 장소가 적으면 모든 순서를 따져 가장 짧은 순서 (첫 장소 고정)
const exactOrder = (points) => {
    let best = { order: null, length: Infinity };
    const visit = (order, rest, length) => {
        if (length >= best.length) return;
        if (rest.length === 0) { best = { order, length }; return; }
        rest.forEach((index) => visit([...order, index], rest.filter((other) => other !== index),
            length + straightDistance(points[order[order.length - 1]], points[index])));
    };
    visit([0], [...points.keys()].slice(1), 0);
    return best.order;
};

// 바꿔 볼 순서들: i~j 구간 뒤집기(2-opt), i~j 구간을 다른 자리로 옮기기 (첫 장소는 고정, 끝은 열린 경로)
const neighborOrders = (order, i, j) => {
    const segment = order.slice(i, j + 1);
    const rest = [...order.slice(0, i), ...order.slice(j + 1)];
    const moved = [...Array(rest.length).keys()].slice(1).map((at) => [...rest.slice(0, at), ...segment, ...rest.slice(at)]);
    return [[...order.slice(0, i), ...[...segment].reverse(), ...order.slice(j + 1)], ...moved];
};

const findShorter = (points, order) => {
    const current = pathLength(points, order);
    for (let i = 1; i < order.length - 1; i += 1) {
        for (let j = i; j < order.length; j += 1) {
            const shorter = neighborOrders(order, i, j).find((candidate) => pathLength(points, candidate) + 1 < current);
            if (shorter) return shorter;
        }
    }
    return null;
};

const improveOrder = (points, initialOrder) => {
    let order = initialOrder;
    for (let next = findShorter(points, order); next; next = findShorter(points, order)) {
        order = next;
    }
    return order;
};

const bestOrder = (points) => (points.length <= EXACT_LIMIT ? exactOrder(points) : improveOrder(points, nearestNeighborOrder(points)));

/**
 * @returns {{ spots, beforeMeters, afterMeters, changed }} changed=false 면 이미 충분히 가까운 순서
 */
export const optimizeSpotOrder = (spots) => {
    if (spots.length < MIN_SPOTS_TO_OPTIMIZE || !spots.every(hasCoordinate)) {
        return { spots, beforeMeters: 0, afterMeters: 0, changed: false };
    }
    const points = spots.map(toPoint);
    const original = [...points.keys()];
    const order = bestOrder(points);
    const beforeMeters = pathLength(points, original);
    const afterMeters = pathLength(points, order);
    const changed = beforeMeters - afterMeters > beforeMeters * MIN_SAVING_RATIO;
    return { spots: changed ? order.map((index) => spots[index]) : spots, beforeMeters, afterMeters, changed };
};
