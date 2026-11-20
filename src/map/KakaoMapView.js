import React, { useEffect, useRef, useState } from 'react';
import './MapView.scss';

const DEFAULT_LEVEL = 8;
// 여러 장소에 맞출 때 지도 가장자리 여백(px)
const FIT_PADDING = 60;
const LINE_WEIGHT = 5;
const LINE_OPACITY = 0.85;

const NO_POINTS = [];

const toLatLng = (point) => new window.kakao.maps.LatLng(point.lat, point.lng);

// 장소 이름표 (Google 화면의 InfoWindow 와 같은 역할)
const labelContent = (text) => {
    const element = document.createElement('div');
    element.className = 'map-label';
    element.textContent = text;
    return element;
};

const drawMarkers = (map, markers) => markers.flatMap((marker) => {
    const position = toLatLng(marker);
    const pin = new window.kakao.maps.Marker({ map, position });
    if (!marker.label) return [pin];
    const label = new window.kakao.maps.CustomOverlay({ map, position, content: labelContent(marker.label), yAnchor: 2.6 });
    return [pin, label];
});

const drawLines = (map, lines) => lines.map((line) => new window.kakao.maps.Polyline({
    map,
    path: line.path.map(toLatLng),
    strokeColor: line.color,
    strokeWeight: line.dashed ? 3 : LINE_WEIGHT,
    strokeOpacity: LINE_OPACITY,
    strokeStyle: line.dashed ? 'shortdash' : 'solid',
}));

// 그린 요소를 지우고 다시 그리는 효과 (마커·경로가 바뀔 때마다)
const useOverlays = (map, draw, items) => {
    useEffect(() => {
        if (!map) return undefined;
        const overlays = draw(map, items);
        return () => overlays.forEach((overlay) => overlay.setMap(null));
    }, [map, draw, items]);
};

const useKakaoMap = (containerRef, center, onReady, onClick) => {
    const [map, setMap] = useState(null);
    useEffect(() => {
        const created = new window.kakao.maps.Map(containerRef.current, { center: toLatLng(center), level: DEFAULT_LEVEL });
        // 지도 영역 크기가 바뀌면(모바일 회전, 패널 열림 등) 다시 그리기
        const observer = new ResizeObserver(() => created.relayout());
        observer.observe(containerRef.current);
        setMap(created);
        onReady?.({ panTo: (point) => created.panTo(toLatLng(point)) });
        return () => observer.disconnect();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (!map || !onClick) return undefined;
        const handler = (event) => onClick({ lat: event.latLng.getLat(), lng: event.latLng.getLng() });
        window.kakao.maps.event.addListener(map, 'click', handler);
        return () => window.kakao.maps.event.removeListener(map, 'click', handler);
    }, [map, onClick]);
    return map;
};

// 담은 장소가 바뀌면 모두 보이게 맞춤 (한 곳이면 그 위치로 이동)
const useFitTo = (map, points) => {
    useEffect(() => {
        if (!map || points.length === 0) return;
        if (points.length === 1) {
            map.panTo(toLatLng(points[0]));
            return;
        }
        const bounds = new window.kakao.maps.LatLngBounds();
        points.forEach((point) => bounds.extend(toLatLng(point)));
        map.setBounds(bounds, FIT_PADDING, FIT_PADDING, FIT_PADDING, FIT_PADDING);
    }, [map, points]);
};

/**
 * 카카오 지도. props: center {lat,lng}, markers [{lat,lng,label}], lines [{path,color,dashed}],
 * onReady({ panTo }), onClick({lat,lng}), focus {lat,lng}(바뀌면 그 위치로 이동), fitTo [{lat,lng}](바뀌면 모두 보이게 맞춤), className, style
 */
const KakaoMapView = ({ center, markers = [], lines = [], onReady, onClick, focus, fitTo, className, style }) => {
    const containerRef = useRef(null);
    const map = useKakaoMap(containerRef, center, onReady, onClick);
    useOverlays(map, drawMarkers, markers);
    useOverlays(map, drawLines, lines);
    useFitTo(map, fitTo || NO_POINTS);
    useEffect(() => {
        if (map && focus) map.panTo(toLatLng(focus));
    }, [map, focus]);
    return <div ref={containerRef} className={className} style={style} />;
};

export default KakaoMapView;
