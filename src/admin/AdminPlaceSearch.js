import React, { createContext, useContext, useState } from 'react';
import MapScriptGate from '../map/MapScriptGate';
import { providerFor } from '../map/mapProvider';
import PlaceSearch from '../community/PlaceSearch';

// 편집 중인 여행지의 중심 좌표·지역 (장소 검색 기준점, 국내는 카카오·해외는 Google)
export const SpotCityContext = createContext(null);

// 좌표는 소수 6자리(약 10cm)까지만 저장
const COORDINATE_DIGITS = 6;
const round = (value) => Number(value.toFixed(COORDINATE_DIGITS));

/**
 * 장소 이름으로 검색해 위도·경도(이름이 비어 있으면 이름도)를 채움
 *   지도 스크립트는 "장소 검색"을 눌렀을 때만 불러옴 (관리자 화면을 열 때마다 불러오지 않음)
 */
const AdminPlaceSearch = ({ onPick }) => {
    const city = useContext(SpotCityContext);
    const [open, setOpen] = useState(false);
    if (!city) return null;
    if (!open) return <button type="button" className="admin-button admin-place-search__open" onClick={() => setOpen(true)}>🔍 장소 이름으로 검색해 위치 채우기</button>;
    const pick = ({ name, position }) => { onPick({ name, lat: round(position.lat), lng: round(position.lng) }); setOpen(false); };
    const provider = providerFor(city.region);
    return (
        <div className="admin-place-search">
            <MapScriptGate provider={provider}>
                <PlaceSearch provider={provider} center={{ lat: city.lat, lng: city.lon }} onPick={pick} />
            </MapScriptGate>
            <button type="button" className="admin-button is-small" onClick={() => setOpen(false)}>검색 닫기</button>
        </div>
    );
};

export default AdminPlaceSearch;
