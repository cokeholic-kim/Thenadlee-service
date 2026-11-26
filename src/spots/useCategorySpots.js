import { useEffect, useState } from 'react';
import { fetchSpots } from '../api/communityApi';
import { fetchCities } from '../api/cityApi';
import { getApiErrorMessage, isNotFoundError } from '../util/apiError';

/** 공개 여행지 정보와 그 여행지의 공개 장소 (지도 화면과 같은 API → 보이는 범위도 같음) */
const useCategorySpots = (cityName) => {
    const [state, setState] = useState({ city: null, spots: [], cities: [], loading: true, error: null, notFound: false });
    useEffect(() => {
        let alive = true;
        setState((s) => ({ ...s, loading: true, error: null, notFound: false }));
        Promise.all([fetchCities(), fetchSpots(cityName)])
            .then(([cities, spots]) => alive && setState({ city: cities.find((c) => c.name === cityName) || null, spots, cities, loading: false, error: null, notFound: false }))
            .catch((error) => alive && setState({ city: null, spots: [], cities: [], loading: false, error: getApiErrorMessage(error), notFound: isNotFoundError(error) }));
        return () => { alive = false; };
    }, [cityName]);
    return state;
};

export default useCategorySpots;
