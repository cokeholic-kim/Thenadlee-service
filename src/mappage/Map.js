import React, { useEffect, useState } from 'react';
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
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SaveItineraryModal from '../itinerary/SaveItineraryModal';
import useItineraryLoader from '../itinerary/useItineraryLoader';
import { loadLoginUser } from '../modules/logincheck';


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
    // 주소에 ?itinerary=ID 가 있으면 저장된 일정을 불러옴
    useItineraryLoader(searchParams.get('itinerary'), Boolean(markerData && cityData && monthData))


    if (cityLoading || markerLoading || monthLoading) return <div>로딩중</div>
    if (cityError || markerError || monthError) return <div>에러발생</div>
    if (!cityData || !markerData || !monthData) return <div>데이터 없음</div>
    // const [name,lat,lon] = data;
    return (
        <div style={{display:"flex"}} className="map">
            <MultiButton setBlog={setBlog} setRecommend={setRecommend} setSaving={setSaving}/>
            {blog && <Blogpopup setBlog={setBlog} place={cityData.body}/>}
            {recommend && <PublicItinerariesModal cityName={places} onClose={()=>setRecommend(false)}/>}
            {saving && <SaveItineraryModal cityName={places} onClose={()=>setSaving(false)}/>}

            <CreateSchedule place={cityData.body} marker={markerData.body} month={monthData.body}/>
        </div>
    );
};

export default Map;