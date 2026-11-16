import React from 'react';
import { Polyline } from '@react-google-maps/api';
import { STRAIGHT_LINE_COLOR, findTravelMode } from './travelModes';

const ROUTE_LINE_WEIGHT = 5;
const ROUTE_LINE_OPACITY = 0.85;

// 경로를 못 찾은 구간은 점선 직선으로 구분
const straightLineOptions = {
    strokeColor: STRAIGHT_LINE_COLOR,
    strokeOpacity: 0,
    icons: [{
        icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3 },
        offset: '0',
        repeat: '14px',
    }],
};

const lineOptions = (leg) => {
    if (leg.straight) return straightLineOptions;
    return {
        strokeColor: findTravelMode(leg.mode)?.color,
        strokeOpacity: ROUTE_LINE_OPACITY,
        strokeWeight: ROUTE_LINE_WEIGHT,
    };
};

const RouteLines = ({ legs }) => (
    <>
        {legs.map((leg, index) => (
            <Polyline key={`${index}-${leg.mode || 'straight'}`} path={leg.path} options={lineOptions(leg)} />
        ))}
    </>
);

export default RouteLines;
