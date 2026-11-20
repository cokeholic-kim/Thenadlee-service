import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import RightControlbar from "./RightControlbar";
import LeftControlbar from "./LeftControlbar";
import useRouteLegs from "../route/useRouteLegs";
import { legsToLines } from "../route/legsToLines";
import RoutePanel from "../route/RoutePanel";
import { setTravelMode } from "../modules/itinerary";
import { departureTimeOfDay } from "../itinerary/tripDates";
import MapView from "../map/MapView";
import MapScriptGate from "../map/MapScriptGate";
import { providerFor } from "../map/mapProvider";
import "./CreateSchedule.scss";

const MAP_STYLE = { width: '100%', height: '100vh' };

// 현재 일차에 담은 장소 사이의 실제 이동 경로 (이동수단은 사용자가 선택, 일정과 함께 저장)
const useDayRoute = (places, provider) => {
  const { travelMode, startDate } = useSelector(state => state.itinerary);
  const activeDay = useSelector(state => state.add.activeDay);
  const departureTime = useMemo(() => departureTimeOfDay(startDate, activeDay), [startDate, activeDay]);
  const { legs, loading } = useRouteLegs(places, travelMode, true, departureTime, provider);
  return { travelMode, legs, loading };
};

const ScheduleMap = ({ place, marker, month, provider }) => {
  const dispatch = useDispatch();
  const places = useSelector(state => state.add.left);
  const [mapApi, setMapApi] = useState(null);
  const center = useMemo(() => ({ lat: place.lat, lng: place.lon }), [place.lat, place.lon]);
  const markers = useMemo(() => places.map((spot) => ({ lat: spot.lat, lng: spot.lon, label: spot.spotName })), [places]);
  const { travelMode, legs, loading } = useDayRoute(places, provider);
  const lines = useMemo(() => legsToLines(legs), [legs]);

  return (
    <>
      <LeftControlbar place={place} month={month}/>
      <div className="map-area">
        <MapView provider={provider} center={center} markers={markers} lines={lines} fitTo={markers} onReady={setMapApi}
          className="map-container" style={MAP_STYLE}/>
        <RoutePanel travelMode={travelMode} onChangeMode={(mode) => dispatch(setTravelMode(mode))}
          legs={legs} places={places} loading={loading}/>
      </div>
      <RightControlbar map={mapApi} marker={marker} place={place}/>
    </>
  );
};

// 지도 화면 본문: 국내 여행지는 카카오맵, 해외는 Google Maps (공급자 스크립트를 불러온 뒤 표시)
const CreateSchedule = ({ place, marker, month }) => {
  const provider = providerFor(place.region);
  return (
    <MapScriptGate provider={provider}>
      <ScheduleMap place={place} marker={marker} month={month} provider={provider}/>
    </MapScriptGate>
  );
};

export default CreateSchedule;
