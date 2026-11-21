import React, { useEffect, useState } from 'react';
import { GoogleMap, InfoWindowF, MarkerF, OverlayViewF, PolylineF } from '@react-google-maps/api';
import { FILE_URL } from '../config/apiurl';
import './MapView.scss';

const DEFAULT_ZOOM = 12;
const LINE_WEIGHT = 5;
const LINE_OPACITY = 0.85;
// 여러 장소에 맞출 때 지도 가장자리 여백(px)
const FIT_PADDING = 60;
const NO_POINTS = [];
// 지도에서 보기로 고른 장소: 이보다 멀리 보고 있으면 이 배율까지 확대
const FOCUS_ZOOM = 15;
const HIGHLIGHT_PANE = 'floatPane';
const MAP_OPTIONS = { mapTypeControl: false, streetViewControl: false, fullscreenControl: false };

// 경로를 못 찾은 구간은 점선
const dashedOptions = (color) => ({
    strokeColor: color,
    strokeOpacity: 0,
    icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3 }, offset: '0', repeat: '14px' }],
});

const lineOptions = (line) => (line.dashed ? dashedOptions(line.color)
    : { strokeColor: line.color, strokeOpacity: LINE_OPACITY, strokeWeight: LINE_WEIGHT });

const LabeledMarker = ({ marker, icon }) => (
    <MarkerF position={{ lat: marker.lat, lng: marker.lng }} icon={icon}>
        {marker.label && (
            <InfoWindowF position={{ lat: marker.lat, lng: marker.lng }} options={{ pixelOffset: new window.google.maps.Size(0, -47) }}>
                <div className="map-label">{marker.label}</div>
            </InfoWindowF>
        )}
    </MarkerF>
);

// 고른 장소 표시: 파동 점 + 이름표 (카카오 화면과 같은 모양)
const HighlightPoint = ({ highlight }) => (
    <OverlayViewF position={{ lat: highlight.lat, lng: highlight.lng }} mapPaneName={HIGHLIGHT_PANE}>
        <div className="map-highlight">
            <span className="map-highlight__pulse" />
            <span className="map-highlight__dot" />
            <div className="map-highlight__label">{highlight.label}</div>
        </div>
    </OverlayViewF>
);

const useHighlightFocus = (map, highlight) => {
    useEffect(() => {
        if (!map || !highlight) return;
        if (map.getZoom() < FOCUS_ZOOM) map.setZoom(FOCUS_ZOOM);
        map.panTo({ lat: highlight.lat, lng: highlight.lng });
    }, [map, highlight]);
};

// 담은 장소가 바뀌면 모두 보이게 맞춤 (한 곳이면 그 위치로 이동)
const useFitTo = (map, points) => {
    useEffect(() => {
        if (!map || points.length === 0) return;
        if (points.length === 1) {
            map.panTo(points[0]);
            return;
        }
        const bounds = new window.google.maps.LatLngBounds();
        points.forEach((point) => bounds.extend(point));
        map.fitBounds(bounds, FIT_PADDING);
    }, [map, points]);
};

/**
 * Google 지도 (KakaoMapView 와 같은 props). markerIcon 'pin' 이면 기본 핀, 없으면 서비스 마커 이미지
 */
const GoogleMapView = ({ center, markers = [], lines = [], onReady, onClick, focus, fitTo, highlight, className, style, zoom, markerIcon }) => {
    const [map, setMap] = useState(null);
    useFitTo(map, fitTo || NO_POINTS);
    useHighlightFocus(map, highlight);
    const icon = markerIcon === 'pin' ? undefined : `${FILE_URL}/imgs/marker.gif`;
    return (
        <GoogleMap mapContainerClassName={className} mapContainerStyle={style} options={MAP_OPTIONS}
            center={focus || center} zoom={zoom || DEFAULT_ZOOM}
            onLoad={(loaded) => { setMap(loaded); onReady?.({ panTo: (point) => loaded.panTo(point) }); }}
            onClick={onClick ? (event) => onClick({ lat: event.latLng.lat(), lng: event.latLng.lng() }) : undefined}>
            {lines.map((line, index) => <PolylineF key={`${index}-${line.color}`} path={line.path} options={lineOptions(line)} />)}
            {/* 순서만 바뀌면 마커를 다시 만들지 않음 (다시 만들면 이름표(InfoWindow)가 열리며 키보드 초점을 가져감) */}
            {markers.map((marker) => <LabeledMarker key={`${marker.lat}-${marker.lng}-${marker.label || ''}`} marker={marker} icon={icon} />)}
            {highlight && <HighlightPoint highlight={highlight} />}
        </GoogleMap>
    );
};

export default GoogleMapView;
