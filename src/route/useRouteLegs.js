import { useEffect, useState } from 'react';
import { computeLeg } from './routeService';

const toPoint = (place) => ({ lat: Number(place.lat), lng: Number(place.lon) });

/**
 * 담은 장소 순서대로 구간(장소 → 다음 장소)별 경로를 계산
 * 장소·이동수단·출발 시각·지도 공급자가 바뀌면 다시 계산하고, 늦게 도착한 이전 결과는 버림
 */
const useRouteLegs = (places, travelMode, enabled, departureTime = null, provider) => {
    const [legs, setLegs] = useState([]);
    const [loading, setLoading] = useState(false);
    const pointsKey = places.map((place) => `${place.lat},${place.lon}`).join('|');
    const departureKey = departureTime?.getTime() ?? null;

    useEffect(() => {
        const points = places.map(toPoint);
        if (!enabled || points.length < 2) {
            setLegs([]);
            return undefined;
        }
        let cancelled = false;
        setLoading(true);
        Promise.all(points.slice(1).map((destination, index) =>
            computeLeg(points[index], destination, travelMode, departureTime, provider)))
            .then((result) => { if (!cancelled) setLegs(result); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [pointsKey, travelMode, enabled, departureKey, provider]); // eslint-disable-line react-hooks/exhaustive-deps

    return { legs, loading };
};

export default useRouteLegs;
