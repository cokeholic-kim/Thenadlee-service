import './RightControlbar.scss' ;
import useAsync from '../customHook/useAsync';
import { API_URL } from '../config/apiurl';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import AddSpot from './AddSpot';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { setRedo } from '../modules/add';
import { Skeleton } from 'antd';



export async function markerFetch(places){
    const response = await axios.get(`${API_URL}/marker/${places}`);
    return response.data
  }


// SET_RIGHT상태가 필요

const RightControlbar = ({place,map}) => {

    const {places} = useParams()
    const state = useAsync(()=>markerFetch(places),[]);
    const {loading,error,data} = state;
    if (loading) return <Skeleton/>
    if (error) return <div>에러발생</div>
    if (!data) return null
   
    return (
        <RightControlPage data={data} map={map}/>
    );
};

export default RightControlbar;



// RightControlPage

function RightControlPage({data,map}){
    const dispatch=useDispatch()
    useEffect(()=>{
        dispatch(setRedo(data))
    },[])
    const rightdata = useSelector(state=>state.add.right)

    return (
        <div className=" RightControlbar">
            <div className=" RightControlbar_inner">
                <div className=" RightControlbar_header">
                    <p>추천장소</p>
                </div>
                <ul className=" RightControlbar_contents">
                    {rightdata.map((d,index)=><AddSpot key={index} spotname={d.spot_name} 
                    nation={d.Nation} p_lat={d.spot_lat} p_lng={d.spot_lng} img={d.img_url} time={d.time} map={map}/>)}
                </ul>
            </div>
        </div>
    )
}