import styled from "styled-components";
import React, { useState } from "react";
import axios from "axios";
import { useEffect } from "react";

const api = {
  key: process.env.REACT_APP_WHEATHER_API_KEY,
  base: process.env.REACT_APP_WHEATHER_BASE_URL
};

function Weather({ setCold, cityname }) {
  // 날짜 가져오기
  const dateBuilder = (d) => {
    let months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    // sunday 먼저..!!
    let days = ["Sun", "Mon", "Tue", "Wed", "Tur", "Fri", "Sat"];

    let day = days[d.getDay()];
    let month = months[d.getMonth()];
    let year = d.getFullYear();
    let date = d.getDate();

    return `${day} ${date} ${month} ${year}`;
  };

  const [weather, setWeather] = useState(null);

  // 날씨 가져오기 (API 키가 없거나 요청이 실패하면 날씨 없이 화면 유지)
  useEffect(() => {
    if (!api.key || !cityname) {
      return;
    }
    const url = `${api.base}weather?q=${encodeURIComponent(cityname)}&appid=${api.key}`;
    axios.get(url)
      .then((responseData) => {
        const data = responseData.data;
        setWeather({
          id: data.weather[0].id,
          temperature: data.main.temp,
          main: data.weather[0].main,
        });
      })
      .catch((error) => {
        console.warn("날씨 정보를 불러오지 못했습니다.", error?.response?.status);
      });
  }, [cityname]);

  // 기온(켈빈)이 290K(약 17℃) 미만이면 추운 날씨로 표시
  useEffect(() => {
    setCold(weather ? weather.temperature < 290 : false);
  }, [weather, setCold]);

  return (
    <Wrapper>
      <div className="locationBox">
        <DateDiv> {dateBuilder(new Date())} </DateDiv>
      </div>

      <div className="weatherBox">
        {weather ? (
          <>
            <Temperature>{(weather.temperature - 273.15).toFixed(2)}℃</Temperature>
            <h2>{weather.main}</h2>
          </>
        ) : (
          <EmptyWeather>날씨 정보 없음</EmptyWeather>
        )}
      </div>
    </Wrapper>
  );
}
export default Weather;

const Wrapper = styled.div``;

const DateDiv = styled.div`
  color: black;
  font-size: 15px;
  font-style: italic;
`;

const Temperature = styled.div`
  color: black;
  font-size: 50px;
  margin-top: 1rem;
`;

const EmptyWeather = styled.div`
  color: #999;
  font-size: 15px;
  margin-top: 1rem;
`;
