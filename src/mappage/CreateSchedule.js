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

//google map library
const libs = ['places', 'visualization', 'drawing', 'geometry'];


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
  
  //polyline 경로 배열
  const path = [];
  state_places.forEach(d => {
    let lat = d.lat
    let lng = d.lon
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
      <LeftControlbar place={place} setToggle={setToggle} toggle={toggle} month={month}/>
        <GoogleMap
          zoom={12}
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
          
          {state_places.map((d,index)=>
            <Marker
            key={index}
            onLoad = {onLoad}
            position={{lat:d.lat, lng:d.lon}}
            options={{
              width: '30px',
              height: '30px',
              icon: '../imgs/marker.gif',
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
          <DrawingManager 
          onLoad={onLoad}
          onPolygonComplete={onPolylineComplete}
          />
          {/* <SearchBox map={map}/> */}
        </GoogleMap>
      <RightControlbar map={map} marker={marker}/>
    </>
  );
};

export default CreateSchedule;
