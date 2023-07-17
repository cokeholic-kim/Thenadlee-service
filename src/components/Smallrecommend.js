import React from 'react';
import { SiStrapi } from "react-icons/si";
import { useDispatch } from 'react-redux';
import { setLeft, setRight } from '../modules/add';

const Smallrecommend = ({data}) => {
    const dispatch = useDispatch()
    const onClick=(e)=>{
        e.target.classList.toggle('click')
        if(e.target.className.split(" ")[1]=="click"){
            dispatch(setLeft(data.spot_name,data.Nation,data.spot_lat,data.spot_lng,data.img_url,data.time))
        }else{
            dispatch(setRight(data.spot_name,data.Nation,data.spot_lat,data.spot_lng,data.img_url,data.time));
        }
    }
    const passleft=()=>{
        dispatch(setLeft(data.spot_name,data.Nation,data.spot_lat,data.spot_lng,data.img_url,data.time))
    } 

    return (
        <div className="chip" onClick={e=>onClick(e)}>
            <SiStrapi/>
            <hs disabled="false">{data.spot_name}</hs>
        </div>    
    );
};

export default Smallrecommend;

