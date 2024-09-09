import React from 'react';
import { SiStrapi } from "react-icons/si";
import { useDispatch } from 'react-redux';
import { setLeft, setRight } from '../modules/add';

const Smallrecommend = ({data}) => {
    const dispatch = useDispatch()
    
    const onClick=(e)=>{
        e.target.classList.toggle('click')
        if(e.target.className.split(" ")[1]==="click"){
            dispatch(setLeft(data.spotName,data.lat,data.lon,data.imageUrl))
        }else{
            dispatch(setRight(data.spotName,data.lat,data.lon,data.imageUrl));
        }
    }
    const passleft=()=>{
        dispatch(setLeft(data.spotName,data.lat,data.lon,data.imageUrl))
    } 

    return (
        <div className="chip" onClick={e=>onClick(e)}>
            <SiStrapi/>
            <hs disabled="false">{data.spotName}</hs>
        </div>    
    );
};

export default Smallrecommend;

