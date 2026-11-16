import React from 'react';
import { GoogleMap, MarkerF } from '@react-google-maps/api';

const MAP_STYLE = { width: '100%', height: '240px', borderRadius: '6px' };
const MAP_OPTIONS = { mapTypeControl: false, streetViewControl: false, fullscreenControl: false, clickableIcons: false };
const PICKED_ZOOM = 15;
const CITY_ZOOM = 11;
const COORD_DIGITS = 6;

const roundCoord = (value) => Number(value.toFixed(COORD_DIGITS));

// 지도를 눌러(또는 표시를 끌어) 장소 위치를 고름. 구글 지도 스크립트는 지도 화면에서 이미 불러온 상태
const LocationPicker = ({ center, position, onChange }) => {
    const pick = (event) => onChange({ lat: roundCoord(event.latLng.lat()), lng: roundCoord(event.latLng.lng()) });
    return (
        <GoogleMap mapContainerStyle={MAP_STYLE} options={MAP_OPTIONS}
            center={position || center} zoom={position ? PICKED_ZOOM : CITY_ZOOM} onClick={pick}>
            {position && <MarkerF position={position} draggable onDragEnd={pick} />}
        </GoogleMap>
    );
};

export default LocationPicker;
