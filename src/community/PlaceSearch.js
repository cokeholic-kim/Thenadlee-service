import React, { useState } from 'react';

const MAX_RESULTS = 5;

// 카카오 장소 검색 (국내 여행지에서만). 반경 제한(최대 20km)을 두면 제주처럼 넓은 여행지의 장소가 빠지므로
// 범위 제한 없이 정확도순으로 검색하고, 여행지 중심 좌표는 정렬 기준점으로만 넘김
const searchPlaces = (keyword, center) => new Promise((resolve) => {
    const places = new window.kakao.maps.services.Places();
    const options = { location: new window.kakao.maps.LatLng(center.lat, center.lng) };
    places.keywordSearch(keyword, (data, status) => {
        resolve(status === window.kakao.maps.services.Status.OK ? data.slice(0, MAX_RESULTS) : []);
    }, options);
});

const toPicked = (place) => ({ name: place.place_name, position: { lat: Number(place.y), lng: Number(place.x) } });

/** 검색 결과를 고르면 onPick({ name, position }) */
const PlaceSearch = ({ center, onPick }) => {
    const [keyword, setKeyword] = useState('');
    const [results, setResults] = useState(null);
    const onSearch = async () => {
        if (keyword.trim() === '') return;
        setResults(await searchPlaces(keyword.trim(), center));
    };
    return (
        <div className="place-search">
            <div className="place-search__row">
                <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="장소 이름으로 검색 (예: 성산일출봉)"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onSearch(); } }} />
                <button type="button" className="map-modal__button is-small" onClick={onSearch}>검색</button>
            </div>
            {results?.length === 0 && <p className="map-modal__hint">검색 결과가 없어요. 지도를 눌러 직접 위치를 정해 주세요.</p>}
            {results?.length > 0 && (
                <ul className="place-search__results">
                    {results.map((place) => (
                        <li key={place.id}>
                            <button type="button" onClick={() => { onPick(toPicked(place)); setResults(null); }}>
                                <strong>{place.place_name}</strong><span>{place.road_address_name || place.address_name}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PlaceSearch;
