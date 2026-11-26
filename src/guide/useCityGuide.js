import { useEffect, useState } from 'react';
import { fetchCities, fetchMonthInfo } from '../api/cityApi';
import { fetchCityItineraries, fetchCityMedia, fetchSpots } from '../api/communityApi';
import { isNotFoundError } from '../util/apiError';

const EMPTY = { loading: true, failed: false, notFound: false, city: null, months: [], spots: [], itineraries: [] };

// 여행지 정보·월별 정보·장소·공개 일정 (공개 일정은 실패해도 페이지는 보여 줌)
const loadGuide = async (cityName) => {
    const [cities, months, spots] = await Promise.all([fetchCities(), fetchMonthInfo(cityName), fetchSpots(cityName)]);
    const itineraries = await fetchCityItineraries(cityName).catch(() => []);
    return { city: cities.find((city) => city.name === cityName) || null, months, spots, itineraries };
};

/** 월별 여행 가이드 데이터 (서버가 404 로 답한 경우만 notFound, 그 밖의 실패는 failed) */
export const useCityGuide = (cityName) => {
    const [state, setState] = useState(EMPTY);
    useEffect(() => {
        let alive = true;
        setState(EMPTY);
        loadGuide(cityName)
            .then((data) => alive && setState({ ...EMPTY, ...data, loading: false, notFound: !data.city }))
            .catch((error) => alive && setState({ ...EMPTY, loading: false, failed: !isNotFoundError(error), notFound: isNotFoundError(error) }));
        return () => { alive = false; };
    }, [cityName]);
    return state;
};

/** 그달 축제·행사 영상 (검색 결과, 못 불러오면 빈 목록) */
export const useFestivalVideos = (cityName, month, enabled) => {
    const [videos, setVideos] = useState([]);
    useEffect(() => {
        let alive = true;
        setVideos([]);
        if (enabled) fetchCityMedia(cityName, month).then((media) => alive && setVideos(media.festivalVideos || [])).catch(() => {});
        return () => { alive = false; };
    }, [cityName, month, enabled]);
    return videos;
};
