import React, { useCallback, useMemo, useRef, useState } from "react";
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

// 지도가 화면 절반 이상 벗어나 있으면(휴대폰에서 목록을 보던 중) 지도까지 스크롤
const scrollMapIntoView = (element) => {
  const rect = element?.getBoundingClientRect();
  if (rect && (rect.top < -rect.height / 2 || rect.top > window.innerHeight / 2)) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// 추천 장소 "지도에서 보기": 그 좌표로 이동해 강조 표시 (같은 장소를 다시 누르면 표시 끄기)
const useSpotHighlight = (mapAreaRef) => {
  const [highlight, setHighlight] = useState(null);
  const locate = useCallback((spot) => {
    setHighlight((current) => (current?.id === spot.id ? null : { id: spot.id, lat: spot.lat, lng: spot.lon, label: spot.spotName }));
    scrollMapIntoView(mapAreaRef.current);
  }, [mapAreaRef]);
  return { highlight, locate };
};

const MapArea = ({ provider, center, places, highlight, areaRef }) => {
  const dispatch = useDispatch();
  const markers = useMemo(() => places.map((spot) => ({ lat: spot.lat, lng: spot.lon, label: spot.spotName })), [places]);
  const { travelMode, legs, loading } = useDayRoute(places, provider);
  const lines = useMemo(() => legsToLines(legs), [legs]);
  return (
    <div className="map-area" ref={areaRef}>
      <MapView provider={provider} center={center} markers={markers} lines={lines} fitTo={markers} highlight={highlight}
        className="map-container" style={MAP_STYLE}/>
      <RoutePanel travelMode={travelMode} onChangeMode={(mode) => dispatch(setTravelMode(mode))}
        legs={legs} places={places} loading={loading}/>
    </div>
  );
};

const ScheduleMap = ({ place, marker, month, provider }) => {
  const places = useSelector(state => state.add.left);
  const center = useMemo(() => ({ lat: place.lat, lng: place.lon }), [place.lat, place.lon]);
  const areaRef = useRef(null);
  const { highlight, locate } = useSpotHighlight(areaRef);
  return (
    <>
      <LeftControlbar place={place} month={month}/>
      <MapArea provider={provider} center={center} places={places} highlight={highlight} areaRef={areaRef}/>
      <RightControlbar marker={marker} place={place} onLocate={locate} highlightId={highlight?.id}/>
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
