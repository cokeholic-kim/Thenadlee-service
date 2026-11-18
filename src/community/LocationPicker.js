import React, { useCallback, useMemo } from 'react';
import MapView from '../map/MapView';

const MAP_STYLE = { width: '100%', height: '240px', borderRadius: '6px' };
const PICKED_ZOOM = 15;
const CITY_ZOOM = 11;
const COORD_DIGITS = 6;

const roundCoord = (value) => Number(value.toFixed(COORD_DIGITS));

// 지도를 눌러 장소 위치를 고름. 지도 스크립트(카카오/Google)는 지도 화면에서 이미 불러온 상태
const LocationPicker = ({ provider, center, position, onChange }) => {
    const pick = useCallback((point) => onChange({ lat: roundCoord(point.lat), lng: roundCoord(point.lng) }), [onChange]);
    const markers = useMemo(() => (position ? [position] : []), [position]);
    return (
        <MapView provider={provider} center={center} focus={position} markers={markers} onClick={pick}
            zoom={position ? PICKED_ZOOM : CITY_ZOOM} markerIcon="pin" style={MAP_STYLE} />
    );
};

export default LocationPicker;
