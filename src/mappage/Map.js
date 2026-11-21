import React, { useEffect, useMemo, useState } from 'react';
import LeftControlbar from './LeftControlbar';
import RightControlbar from './RightControlbar';
import CreateSchedule from './CreateSchedule';
import { API_URL } from '../config/apiurl';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import useAsync from '../customHook/useAsync';
import { useDispatch } from 'react-redux';
import './Map.scss' ;
import MultiButton from './MultiButton';
import Blogpopup from '../components/Blogpopup';
import html2canvas from 'html2canvas';
import PublicItinerariesModal from '../community/PublicItinerariesModal';
import usePageMeta from '../seo/usePageMeta';
import { cityPageMeta } from '../seo/pageMeta';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SaveItineraryModal from '../itinerary/SaveItineraryModal';
import useItineraryLoader from '../itinerary/useItineraryLoader';
import { loadLoginUser } from '../modules/logincheck';
import { GroupMapProvider } from '../group/GroupMapContext';
import { setRedo } from '../modules/add';
import { MapError, MapLoading } from './MapStatus';
import { useMapDraftSaver, useResumeSave } from './useMapDraft';
import { readMapDraft } from '../itinerary/mapDraft';


async function productFetch(places){
    const response = await axios.get(`${API_URL}/place/${places}`);
    return response.data
}

async function markerFetch(places){
    const response = await axios.get(`${API_URL}/place/spot/${places}`);
    return response.data
  }

async function monthFetch(places){
    const response = await axios.get(`${API_URL}/place/month/${places}`);
    return response.data
}

const Map = () => {
    // html2canvas(document.querySelector(".map-container")).then(canvas=>{
    //     document.querySelector(".map-container").appendChild(canvas);
    // })
    const {places} = useParams()
    usePageMeta(cityPageMeta(places))

    const [blog,setBlog] = useState(false)
    const [recommend,setRecommend] = useState(false)
    const [saving,setSaving] = useState(false)
    const [searchParams] = useSearchParams()
    const { search } = useLocation()
    const dispatch = useDispatch()
    const loginChecked = useSelector(state=>state.logincheck.checked)

    const productState = useAsync(()=>productFetch(places),[]);
    const markerState = useAsync(()=>markerFetch(places),[]);
    const monthState = useAsync(()=>monthFetch(places),[]);

    const {loading:cityLoading,error:cityError,data:cityData} = productState;
    const {loading:markerLoading,error:markerError,data:markerData} = markerState;
    const {loading:monthLoading,error:monthError,data:monthData} = monthState;

    // 지도 화면에는 헤더가 없어서 일정 저장 전 로그인 상태를 직접 확인
    useEffect(()=>{
        if(!loginChecked) dispatch(loadLoginUser())
    },[loginChecked, dispatch])
    // 같은 화면에서 담던 일정이 있으면 되살리고, 아니면 ?itinerary=ID 로 저장된 일정을 불러옴 (임시 보관보다 먼저 실행)
    const spotsReady = Boolean(markerData && cityData && monthData)
    // 도시 장소 목록 채우기는 일정 준비보다 먼저 (예전엔 지도 스크립트를 불러온 뒤 오른쪽 목록이 나타날 때 해서, 그사이 불러온 일정을 지우는 일이 있었음)
    useEffect(() => {
        if (spotsReady) dispatch(setRedo(markerData.body))
    }, [spotsReady, markerData, dispatch])
    // 임시 일정은 화면을 그릴 때 한 번 읽어 둠 (효과 안에서 읽으면 임시 보관이 먼저 덮어쓸 수 있음)
    const draft = useMemo(() => readMapDraft(places, search), [places, search])
    const spotIds = useMemo(() => new Set((markerData?.body || []).map((spot) => spot.id)), [markerData])
    useItineraryLoader(searchParams.get('itinerary'), spotsReady, draft, spotIds)
    useMapDraftSaver(places, search, spotsReady)
    useResumeSave(spotsReady, () => setSaving(true))


    if (cityLoading || markerLoading || monthLoading) return <MapLoading/>
    if (cityError || markerError || monthError) return <MapError error={cityError || markerError || monthError}/>
    if (!cityData || !markerData || !monthData) return <MapLoading/>
    // const [name,lat,lon] = data;
    return (
        <GroupMapProvider groupId={searchParams.get('group')} cityName={places}>
        <div style={{display:"flex"}} className="map">
            {blog && <Blogpopup setBlog={setBlog} place={cityData.body}/>}
            {recommend && <PublicItinerariesModal cityName={places} onClose={()=>setRecommend(false)}/>}
            {saving && <SaveItineraryModal cityName={places} onClose={()=>setSaving(false)}/>}

            <CreateSchedule place={cityData.body} marker={markerData.body} month={monthData.body}
                toolbar={<MultiButton setBlog={setBlog} setRecommend={setRecommend} setSaving={setSaving}/>}/>
        </div>
        </GroupMapProvider>
    );
};

export default Map;