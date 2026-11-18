import { STRAIGHT_LINE_COLOR, findTravelMode } from './travelModes';

// 구간 경로를 지도 공통 선 형식으로 변환 (경로를 못 찾은 구간은 회색 점선)
export const legsToLines = (legs) => legs.map((leg) => ({
    path: leg.path,
    color: leg.straight ? STRAIGHT_LINE_COLOR : findTravelMode(leg.mode)?.color,
    dashed: leg.straight,
}));
