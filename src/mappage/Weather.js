import styled from "styled-components";
import React, { useState } from "react";
import axios from "axios";
import { useEffect } from "react";

const api = {
  key: "b3514c282b0881d3c62d1738e4d0f678",
  base: "https://api.openweathermap.org/data/2.5/",
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

  const url = `${api.base}weather?q=${cityname}&appid=${api.key}`;
  const [weather, setWeather] = useState("");

  // 날씨 가져오기
  useEffect(()=>{
        console.log(url)
      axios.get(url).then((responseData) => {
        const data = responseData.data;
        setWeather({
          id: data.weather[0].id,
          temperature: data.main.temp,
          main: data.weather[0].main,
          loading: false,
        });
      });
  },[])

  setCold(weather.temperature < 290 ? true : false);

  return (
    <Wrapper>
      <div className="locationBox"> 
        <DateDiv> {dateBuilder(new Date())} </DateDiv>
      </div>

      <div className="weatherBox">
        <Temperature>{(weather.temperature - 273.15).toFixed(2)}℃</Temperature>
        <h2>{weather.main}</h2>
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
