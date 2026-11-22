import { useEffect, useState } from 'react';
import axios from 'axios';
import { toDateString } from './groupFormat';
import { summarizeForecast } from './forecastSummary';

// 기존 지도 화면 날씨와 같은 OpenWeather 키 (5일 예보, 3시간 간격)
const WEATHER_KEY = process.env.REACT_APP_WHEATHER_API_KEY;
const WEATHER_BASE = process.env.REACT_APP_WHEATHER_BASE_URL;
export const FORECAST_DAYS = 5;
const DAY_MILLIS = 86400000;
const addDays = (date, days) => toDateString(new Date(new Date(`${date}T00:00:00`).getTime() + days * DAY_MILLIS));

/**
 * 여행 일차별 날씨 { byDay: { 1: {date, min, max, emoji, wet, pop} }, tooFar } — 여행이 5일 안에 시작할 때만 예보를 불러옴
 * 공개 정보(여행지 이름으로 조회)만 사용
 */
const useForecast = (cityName, startDate, dayCount) => {
    const [forecast, setForecast] = useState(null);
    const today = toDateString(new Date());
    const inRange = Boolean(startDate) && startDate <= addDays(today, FORECAST_DAYS - 1) && addDays(startDate, dayCount - 1) >= today;
    useEffect(() => {
        if (!inRange || !cityName || !WEATHER_KEY) return;
        axios.get(`${WEATHER_BASE}forecast`, { params: { q: cityName, appid: WEATHER_KEY, units: 'metric', lang: 'kr' } })
            .then((response) => setForecast(summarizeForecast(response.data.list, response.data.city?.timezone))).catch(() => setForecast(null));
    }, [inRange, cityName]);
    const byDay = {};
    if (forecast && startDate) {
        for (let day = 1; day <= dayCount; day += 1) {
            const date = addDays(startDate, day - 1);
            if (forecast[date]) byDay[day] = { date, ...forecast[date] };
        }
    }
    return { byDay, tooFar: Boolean(startDate) && !inRange && startDate > today };
};

export default useForecast;
