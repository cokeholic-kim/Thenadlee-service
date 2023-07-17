import { React, useEffect, useMemo, useState } from "react";
import { GoogleMap, Marker, MarkerF, Polyline, useJsApiLoader,DrawingManager, useGoogleMap,InfoWindow } from "@react-google-maps/api";
import axios from "axios";
import { API_URL } from "../config/apiurl";
import { useParams } from "react-router-dom";
import useAsync from "../customHook/useAsync";
import { useDispatch, useSelector } from "react-redux";
import { SearchBox } from "./SearchBox";
import RightControlbar from "./RightControlbar";
import LeftControlbar from "./LeftControlbar";
import { Skeleton } from "antd";

const google_key = process.env.REACT_APP_GOOGLE_API_KEY;
const containerStyle = {
  width: '100%',
  height: '100vh',
};

async function markerFetch(places){
  const response = await axios.get(`${API_URL}/marker/${places}`);
  return response.data
}

//google map library
const libs = ['places', 'visualization', 'drawing', 'geometry'];

//CreateSchedule

const CreateSchedule = ({place}) => {
  const[toggle,setToggle]=useState(true);
  const Markerposition = useSelector(state=>state.Marker) //오른쪽에 마우스호버된 좌표값.
  const state_places = useSelector(state=>state.add.left)

  const center = useMemo(() => ({ lat: place.city_lat, lng: place.city_lng }), []);
//맵구현
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: google_key,
    libraries: libs
  });

console.log(isLoaded.googleMapsApiKey)

  const[map,setMaps]=useState(/**@type google.maps.Map*/(null)) //google map 상태관리. , @type을 써줘야 panTo 사용가능
  const {places} = useParams()
  const state = useAsync(()=>markerFetch(places),[]);
  const {loading,error,data} = state;
  if (loading) return <div>로딩중</div>
  if (error) return <div>에러발생</div>
  if (!data) return null

  const onLoad = (marker,polyline,drawingManager) => {
    //구글 api가 실행될때 실행할 함수들
  };

  const infoStyle = {
    background: 'white',
    textAlign: 'center',
    width: '100px',
    height: '10px',
    fontSize: '5px'
  }


  const options = {
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  };
  
  //polyline 경로 배열
  const path = [];
  state_places.forEach(d => {
    let lat = d.lat
    let lng = d.lng
    path.push({lat,lng})
  });

  const optionsPolyline = {
    clickable: false,
    draggable: false,
    editable: false,
    visible: true,
    radius: 30000,
    paths:path,
    zIndex: 1
  };
  //drawing manager
  const onPolylineComplete = polyline => {
    console.log(polyline);
  }
  


  if (!isLoaded) return <Skeleton/>;

  return (
    <>
      <LeftControlbar place={place} setToggle={setToggle} toggle={toggle}/>
      <GoogleMap
        zoom={place.zoom}
        options={options}
        libraries={libs}
        center={center}
        mapContainerClassName="map-container"
        mapContainerStyle={containerStyle}
        onLoad={map=>setMaps(map)}
        >
        <Polyline 
        onLoad={onLoad} 
        path={path} 
        optionsPolyline={optionsPolyline}
        options={{
          strokeColor: 'yellow',
          strokeWeight: 5,
          fillColor: 'yellow',
          fillOpacity: 0.35,
        }}
        />
        {state_places.map((d,index)=><Marker
        key={index}
        onLoad = {onLoad}
        position={{lat:d.lat, lng:d.lng}}
        options={{
          width: '30px',
          height: '30px',
          icon: '../imgs/marker.gif',
        }}
        >
          <InfoWindow
            onLoad={onLoad}
            position={{lat:d.lat, lng:d.lng}}
            options={{
              pixelOffset: new window.google.maps.Size(
                0,-47
              )
            }}
          >
            <div style={infoStyle}>
              <h2>{`${d.spotname}`}</h2>
            </div>
          </InfoWindow>
        </Marker>)}
        {Markerposition && <Marker position={{lat:Markerposition.lat, lng:Markerposition.lng}}/>}
        <DrawingManager 
        onLoad={onLoad}
        onPolygonComplete={onPolylineComplete}
        />
        <SearchBox map={map}/>
      </GoogleMap>
      <RightControlbar map={map} place={place}/>
    </>
  );
};

export default CreateSchedule;
