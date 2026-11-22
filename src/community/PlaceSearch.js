import React, { useState } from 'react';
import { searchPlaces } from './placeSearchApi';

const FAILED = 'FAILED';

const useSearch = (provider, center) => {
    const [keyword, setKeyword] = useState('');
    const [results, setResults] = useState(null);
    const [searching, setSearching] = useState(false);
    const onSearch = async () => {
        if (keyword.trim() === '' || searching) return;
        setSearching(true);
        try {
            setResults(await searchPlaces(provider, keyword.trim(), center));
        } catch (error) {
            setResults(FAILED);
        }
        setSearching(false);
    };
    return { keyword, setKeyword, results, setResults, searching, onSearch };
};

const ResultList = ({ results, onPick }) => (
    <ul className="place-search__results">
        {results.map((place) => (
            <li key={place.id}>
                <button type="button" onClick={() => onPick({ name: place.name, position: place.position })}>
                    <strong>{place.name}</strong><span>{place.address}</span>
                </button>
            </li>
        ))}
    </ul>
);

/** 장소 이름 검색 (국내 카카오·해외 Google). 결과를 고르면 onPick({ name, position }) */
const PlaceSearch = ({ provider, center, onPick }) => {
    const search = useSearch(provider, center);
    const pick = (place) => { onPick(place); search.setResults(null); };
    return (
        <div className="place-search">
            <div className="place-search__row">
                <input value={search.keyword} onChange={(e) => search.setKeyword(e.target.value)} placeholder="장소 이름으로 검색 (예: 성산일출봉)" aria-label="장소 이름 검색"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); search.onSearch(); } }} />
                <button type="button" className="map-modal__button is-small" onClick={search.onSearch} disabled={search.searching}>{search.searching ? '찾는 중…' : '검색'}</button>
            </div>
            {search.results === FAILED && <p className="map-modal__hint">지금은 검색할 수 없어요. 지도를 눌러 직접 위치를 정해 주세요.</p>}
            {search.results?.length === 0 && <p className="map-modal__hint">검색 결과가 없어요. 지도를 눌러 직접 위치를 정해 주세요.</p>}
            {Array.isArray(search.results) && search.results.length > 0 && <ResultList results={search.results} onPick={pick} />}
        </div>
    );
};

export default PlaceSearch;
