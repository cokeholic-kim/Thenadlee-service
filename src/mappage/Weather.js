import styled from "styled-components";
import React, { useEffect, useState } from "react";
import axios from "axios";

const api = {
  key: process.env.REACT_APP_WHEATHER_API_KEY,
  base: process.env.REACT_APP_WHEATHER_BASE_URL
};

// 17℃ 미만이면 추운 날씨로 표시 (왼쪽 패널 배경색)
const COLD_CELSIUS = 17;
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// OpenWeather 날씨 코드(앞자리) → 아이콘
const WEATHER_ICONS = { 2: '⛈️', 3: '🌦️', 5: '🌧️', 6: '❄️', 7: '🌫️', 8: '☁️' };
const iconOf = (id) => (id === 800 ? '☀️' : WEATHER_ICONS[Math.floor(id / 100)] || '🌤️');

const todayLabel = (date) => `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS[date.getDay()]})`;

// 날씨 가져오기 (섭씨·한국어 설명. API 키가 없거나 실패하면 날씨 없이 화면 유지)
const useCurrentWeather = (cityname) => {
  const [weather, setWeather] = useState(null);
  useEffect(() => {
    if (!api.key || !cityname) return;
    const url = `${api.base}weather?q=${encodeURIComponent(cityname)}&appid=${api.key}&units=metric&lang=kr`;
    axios.get(url)
      .then(({ data }) => setWeather({ id: data.weather[0].id, temperature: data.main.temp, description: data.weather[0].description }))
      .catch((error) => console.warn("날씨 정보를 불러오지 못했습니다.", error?.response?.status));
  }, [cityname]);
  return weather;
};

function Weather({ setCold, cityname }) {
  const weather = useCurrentWeather(cityname);
  useEffect(() => {
    setCold(weather ? weather.temperature < COLD_CELSIUS : false);
  }, [weather, setCold]);

  return (
    <Box aria-label="오늘 날씨">
      <DateText>{todayLabel(new Date())}</DateText>
      {weather ? (
        <Now><span aria-hidden="true">{iconOf(weather.id)}</span> <strong>{Math.round(weather.temperature)}°</strong> {weather.description}</Now>
      ) : <EmptyWeather>날씨 정보 없음</EmptyWeather>}
    </Box>
  );
}
export default Weather;

const Box = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`;

const DateText = styled.div`
  color: #616161;
  font-size: 13px;
`;

const Now = styled.div`
  color: #1f2d2e;
  font-size: 15px;
  strong {
    font-size: 26px;
    font-weight: 700;
  }
`;

const EmptyWeather = styled.div`
  color: #999;
  font-size: 13px;
`;
