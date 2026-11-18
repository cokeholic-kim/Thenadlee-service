import React from 'react';

// 일차별 동선 색 (요약 카드 범례와 같은 순서)
export const DAY_COLORS = ['#3a9ea5', '#f2a65a', '#e56b8a', '#7b6cd9', '#5aa469', '#d9a21b', '#4a90d9'];
export const dayColor = (dayNo) => DAY_COLORS[(dayNo - 1) % DAY_COLORS.length];

const WIDTH = 320;
const HEIGHT = 200;
const PADDING = 18;

const DEGREE_TO_RADIAN = Math.PI / 180;

// 좌표 범위를 그림 크기에 꽉 차게 맞춤 (경도는 위도에 따라 줄여 실제 모양 유지, 한 곳뿐이면 가운데)
const projector = (points) => {
    const lats = points.map((point) => point.lat);
    const lngScale = Math.cos(((Math.min(...lats) + Math.max(...lats)) / 2) * DEGREE_TO_RADIAN);
    const xs = points.map((point) => point.lng * lngScale);
    const [minX, minY] = [Math.min(...xs), Math.min(...lats)];
    const [rangeX, rangeY] = [Math.max(...xs) - minX, Math.max(...lats) - minY];
    const scale = Math.min((WIDTH - PADDING * 2) / (rangeX || 1), (HEIGHT - PADDING * 2) / (rangeY || 1));
    const offsetX = (WIDTH - rangeX * scale) / 2;
    const offsetY = (HEIGHT - rangeY * scale) / 2;
    return (point) => ({
        x: offsetX + (point.lng * lngScale - minX) * scale,
        y: HEIGHT - offsetY - (point.lat - minY) * scale,
    });
};

/** 지도 대신 그리는 동선 스케치 (이미지 저장이 되도록 외부 지도 타일을 쓰지 않음) */
const RouteSketch = ({ days }) => {
    const points = days.flatMap((day) => day.spots);
    if (points.length === 0) return null;
    const project = projector(points);
    return (
        <svg className="route-sketch" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="날짜별 동선">
            {days.map((day) => {
                const projected = day.spots.map(project);
                return (
                    <g key={day.dayNo} stroke={dayColor(day.dayNo)} fill={dayColor(day.dayNo)}>
                        <polyline points={projected.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" strokeWidth="2.5" strokeLinejoin="round" strokeDasharray="6 4" />
                        {projected.map((p, index) => (
                            <g key={`${day.dayNo}-${day.spots[index].name}`}>
                                <circle cx={p.x} cy={p.y} r="9" stroke="#fff" strokeWidth="2" />
                                <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff" stroke="none">{index + 1}</text>
                            </g>
                        ))}
                    </g>
                );
            })}
        </svg>
    );
};

export default RouteSketch;
