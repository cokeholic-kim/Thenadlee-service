import React from 'react';
import { GoogleMap, InfoWindowF, MarkerF, PolylineF } from '@react-google-maps/api';
import { FILE_URL } from '../config/apiurl';
import './MapView.scss';

const DEFAULT_ZOOM = 12;
const LINE_WEIGHT = 5;
const LINE_OPACITY = 0.85;
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

/**
 * Google 지도 (KakaoMapView 와 같은 props). markerIcon 'pin' 이면 기본 핀, 없으면 서비스 마커 이미지
 */
const GoogleMapView = ({ center, markers = [], lines = [], onReady, onClick, focus, className, style, zoom, markerIcon }) => {
    const icon = markerIcon === 'pin' ? undefined : `${FILE_URL}/imgs/marker.gif`;
    return (
        <GoogleMap mapContainerClassName={className} mapContainerStyle={style} options={MAP_OPTIONS}
            center={focus || center} zoom={zoom || DEFAULT_ZOOM}
            onLoad={(map) => onReady?.({ panTo: (point) => map.panTo(point) })}
            onClick={onClick ? (event) => onClick({ lat: event.latLng.lat(), lng: event.latLng.lng() }) : undefined}>
            {lines.map((line, index) => <PolylineF key={`${index}-${line.color}`} path={line.path} options={lineOptions(line)} />)}
            {markers.map((marker, index) => <LabeledMarker key={`${index}-${marker.lat}-${marker.lng}`} marker={marker} icon={icon} />)}
        </GoogleMap>
    );
};

export default GoogleMapView;
