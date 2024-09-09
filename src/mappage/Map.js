import React, { useEffect, useState } from 'react';
import LeftControlbar from './LeftControlbar';
import RightControlbar from './RightControlbar';
import CreateSchedule from './CreateSchedule';
import { API_URL } from '../config/apiurl';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import useAsync from '../customHook/useAsync';
import { useDispatch } from 'react-redux';
import { setReset } from '../modules/add';
import './Map.scss' ;
import MultiButton from './MultiButton';
import Blogpopup from '../components/Blogpopup';
import html2canvas from 'html2canvas';
import Recommend from '../components/Recommend';


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
    
    const [blog,setBlog] = useState(false)
    const [recommend,setRecommend] = useState(false)
    
    const productState = useAsync(()=>productFetch(places),[]);
    const markerState = useAsync(()=>markerFetch(places),[]);
    const monthState = useAsync(()=>monthFetch(places),[]);
    
    console.log(productState,markerState,monthState)
    const {loading:cityLoading,error:cityError,data:cityData} = productState;
    const {loading:markerLoading,error:markerError,data:markerData} = markerState;
    const {loading:monthLoading,error:monthError,data:monthData} = monthState;


    if (cityLoading || markerLoading) return <div>로딩중</div>
    if (cityError || markerError) return <div>에러발생</div>
    if (!cityData || !markerData) return <div>데이터 없음</div>
    // const [name,lat,lon] = data;
    return (
        <div style={{display:"flex"}} className="map">
            <MultiButton setBlog={setBlog} setRecommend={setRecommend}/>
            {blog && <Blogpopup setBlog={setBlog} place={cityData.body}/>}
            {recommend && <Recommend setRecommend={setRecommend} place={markerData.body}/>}

            <CreateSchedule place={cityData.body} marker={markerData.body} month={monthData.body}/>
        </div>
    );
};

export default Map;