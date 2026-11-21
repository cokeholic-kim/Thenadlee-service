import React, { useCallback, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import RightControlbar from "./RightControlbar";
import LeftControlbar from "./LeftControlbar";
import useRouteLegs from "../route/useRouteLegs";
import { legsToLines } from "../route/legsToLines";
import RoutePanel from "../route/RoutePanel";
import MonthDesc from "./MonthDesc";
import MobilePanelTabs from "./MobilePanelTabs";
import { MAP_PANELS, useMapPanelRequest } from "./mapPanelEvents";
import { setTravelMode } from "../modules/itinerary";
import { departureTimeOfDay } from "../itinerary/tripDates";
import MapView from "../map/MapView";
import MapScriptGate from "../map/MapScriptGate";
import { providerFor } from "../map/mapProvider";
import "./CreateSchedule.scss";
import { trackEvent } from "../analytics/analytics";

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
    trackEvent('locate_spot');
    scrollMapIntoView(mapAreaRef.current);
  }, [mapAreaRef]);
  return { highlight, locate };
};

const MapArea = ({ provider, center, places, highlight, areaRef, cityName, monthList, toolbar, panel, onPanel }) => {
  const dispatch = useDispatch();
  const markers = useMemo(() => places.map((spot) => ({ lat: spot.lat, lng: spot.lon, label: spot.spotName })), [places]);
  const { travelMode, legs, loading } = useDayRoute(places, provider);
  const lines = useMemo(() => legsToLines(legs), [legs]);
  return (
    <div className="map-area" ref={areaRef}>
      {/* 경로 패널은 지도 크기 기준으로 띄움 (휴대폰에서 아래에 붙는 여행 tip 과 겹치지 않게) */}
      <div className="map-area__map">
        {toolbar}
        <MapView provider={provider} center={center} markers={markers} lines={lines} fitTo={markers} highlight={highlight}
          className="map-container" style={MAP_STYLE}/>
        <RoutePanel travelMode={travelMode} onChangeMode={(mode) => dispatch(setTravelMode(mode))}
          legs={legs} places={places} loading={loading}/>
      </div>
      <MonthDesc monthList={monthList} cityName={cityName} className="is-desktop-only"/>
      <MobilePanelTabs panel={panel} onChange={onPanel}/>
    </div>
  );
};

// 휴대폰은 탭으로 목록 하나만 보여 주고 맨 위로, PC 는 추천 장소 목록으로 초점 이동
const useMobilePanel = () => {
  const [panel, setPanel] = useState(MAP_PANELS.SPOTS);
  const show = useCallback((next) => {
    setPanel(next);
    if (window.matchMedia('(max-width: 600px)').matches) window.scrollTo({ top: 0, behavior: 'smooth' });
    else if (next === MAP_PANELS.SPOTS) document.querySelector('.spot-toolbar button')?.focus();
  }, []);
  useMapPanelRequest(show);
  return { panel, show };
};

const ScheduleMap = ({ place, marker, month, provider, toolbar }) => {
  const places = useSelector(state => state.add.left);
  const center = useMemo(() => ({ lat: place.lat, lng: place.lon }), [place.lat, place.lon]);
  const areaRef = useRef(null);
  const { highlight, locate } = useSpotHighlight(areaRef);
  const { panel, show } = useMobilePanel();
  return (
    <>
      <LeftControlbar place={place} monthList={month} mobileHidden={panel !== MAP_PANELS.PLAN}/>
      <MapArea provider={provider} center={center} places={places} highlight={highlight} areaRef={areaRef}
        cityName={place.name} monthList={month} toolbar={toolbar} panel={panel} onPanel={show}/>
      <RightControlbar marker={marker} place={place} onLocate={locate} highlightId={highlight?.id} mobileHidden={panel !== MAP_PANELS.SPOTS}/>
    </>
  );
};

// 지도 화면 본문: 국내 여행지는 카카오맵, 해외는 Google Maps (공급자 스크립트를 불러온 뒤 표시)
const CreateSchedule = ({ place, marker, month, toolbar }) => {
  const provider = providerFor(place.region);
  return (
    <MapScriptGate provider={provider}>
      <ScheduleMap place={place} marker={marker} month={month} provider={provider} toolbar={toolbar}/>
    </MapScriptGate>
  );
};

export default CreateSchedule;
