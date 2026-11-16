import React, { useEffect, useMemo, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader, InfoWindow } from "@react-google-maps/api";
import axios from "axios";
import { API_URL, FILE_URL } from "../config/apiurl";
import { useParams } from "react-router-dom";
import useAsync from "../customHook/useAsync";
import { useDispatch, useSelector } from "react-redux";
import { SearchBox } from "./SearchBox";
import RightControlbar from "./RightControlbar";
import LeftControlbar from "./LeftControlbar";
import { Skeleton } from "antd";
import useRouteLegs from "../route/useRouteLegs";
import RouteLines from "../route/RouteLines";
import RoutePanel from "../route/RoutePanel";
import { setTravelMode } from "../modules/itinerary";
import { departureTimeOfDay } from "../itinerary/tripDates";
import "./CreateSchedule.scss";

const google_key = process.env.REACT_APP_GOOGLE_API_KEY;
const containerStyle = {
  width: '100%',
  height: '100vh',
};

//google map library
const libs = ['places', 'visualization', 'geometry'];


const CreateSchedule = ({place,marker,month}) => {
  const[toggle,setToggle]=useState(true);
  const Markerposition = useSelector(state=>state.Marker) //오른쪽에 마우스호버된 좌표값.
  const state_places = useSelector(state=>state.add.left)

  const center = useMemo(() => ({ lat: place.lat, lng: place.lon }), []);
//맵구현
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: google_key,
    libraries: libs
  });

  // 현재 일차에 담은 장소 사이의 실제 이동 경로 (이동수단은 사용자가 선택, 일정과 함께 저장)
  const dispatch = useDispatch();
  const { travelMode, startDate } = useSelector(state => state.itinerary);
  const activeDay = useSelector(state => state.add.activeDay);
  const departureTime = useMemo(() => departureTimeOfDay(startDate, activeDay), [startDate, activeDay]);
  const { legs, loading: routeLoading } = useRouteLegs(state_places, travelMode, isLoaded, departureTime);


  const[map,setMaps]=useState(/**@type google.maps.Map*/(null)) //google map 상태관리. , @type을 써줘야 panTo 사용가능



  const onLoad = (marker,polyline,drawingManager) => {
    //구글 api가 실행될때 실행할 함수들
  };

  const infoStyle = {
    background: 'white',
    textAlign: 'center',
    width: '100px',
    fontSize: '15px'
  }


  const options = {
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  };
  
  if (!isLoaded) return <Skeleton/>;

  return (
    <>
      <LeftControlbar place={place} setToggle={setToggle} toggle={toggle} month={month}/>
      <div className="map-area">
        <GoogleMap
          zoom={12}
          options={options}
          libraries={libs}
          center={center}
          mapContainerClassName="map-container"
          mapContainerStyle={containerStyle}
          onLoad={map=>setMaps(map)}
          >

          <RouteLines legs={legs}/>

          {state_places.map((d,index)=>
            <Marker
            key={index}
            onLoad = {onLoad}
            position={{lat:d.lat, lng:d.lon}}
            options={{
              width: '30px',
              height: '30px',
              icon: `${FILE_URL}/imgs/marker.gif`,
            }}
            >
            <InfoWindow
              onLoad={onLoad}
              position={{lat:d.lat, lng:d.lon}}
              options={{
                pixelOffset: new window.google.maps.Size(
                  0,-47
                )
              }}
              
            >
              <div style={infoStyle}>
                {`${d.spotName}`}
              </div>
            </InfoWindow>
          </Marker>)}

          {/* {Markerposition && <Marker position={{lat:marker.lat, lng:marker.lng}}/>} */}
          {/* DrawingManager 는 Google Maps JS API v3.65 에서 제거되어 사용 중단 */}
          {/* <SearchBox map={map}/> */}
        </GoogleMap>
        <RoutePanel travelMode={travelMode} onChangeMode={(mode) => dispatch(setTravelMode(mode))}
          legs={legs} places={state_places} loading={routeLoading}/>
      </div>
      <RightControlbar map={map} marker={marker} place={place}/>
    </>
  );
};

export default CreateSchedule;
