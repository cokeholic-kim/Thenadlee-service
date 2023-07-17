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

const Map = () => {
    html2canvas(document.querySelector(".map-container")).then(canvas=>{
        document.querySelector(".map-container").appendChild(canvas);
    })
    const [blog,setBlog] = useState(false)
    const [recommend,setRecommend] = useState(false)
    const {places} = useParams()
    const state = useAsync(()=>productFetch(places),[]);
    const {loading,error,data} = state;
    if (loading) return <div>로딩중</div>
    if (error) return <div>에러발생</div>
    if (!data) return null
    const [place] = data;   
    return (
        <div style={{display:"flex"}} className="map">
            <MultiButton setBlog={setBlog} setRecommend={setRecommend}/>
            {blog && <Blogpopup setBlog={setBlog} place={place}/>}
            {recommend && <Recommend setRecommend={setRecommend} place={place}/>}
            <CreateSchedule place={place}/>
        </div>
    );
};

export default Map;