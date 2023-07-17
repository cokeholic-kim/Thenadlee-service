import { click } from '@testing-library/user-event/dist/click';
import { Carousel, Skeleton } from 'antd';
import axios from 'axios';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { API_URL } from '../config/apiurl';
import useAsync from '../customHook/useAsync';
import { setLeftAll, setRedo, setReset } from '../modules/add';
import './Recommend.scss'
import Smallrecommend from './Smallrecommend';

const contentStyle = {
    maxWidth: "100%",
    height: "100%",
    width: "auto",
    display: "block",
    margin:"0 auto",
    color: '#fff',
    textAlign: 'center',
    background: '#364d79',  };

//추천지역 받아오기 
export async function recommendFetch(places){
    const response = await axios.get(`${API_URL}/recommend/${places}`);
    return response.data
  }






const Recommend = ({place,setRecommend}) => {
    const {places} = useParams() // 나라이름 받아오기
    const dispatch = useDispatch()
    const state = useAsync(()=>recommendFetch(places),[]);
    const {loading,error,data:recomdata} = state;


    const data = useSelector(state=>state.add.data)
    const left =useSelector(state => state.add.left)
    const onChange = (currentSlide) => {
        console.log(currentSlide);
    };
    const clickall = ()=>{
        const newdata = recomdata.map(data=>({
            img:data.img_url,
            lat:data.spot_lat,
            lng:data.spot_lng,
            nation:data.Nation,
            spotname:data.spot_name,
            time:data.time,
        }))
        let check = document.querySelectorAll('.chip')
        check.forEach(chip=>chip.classList.toggle('click'))
        if(left.length == 0){
            dispatch(setLeftAll(newdata))
        }else{
            dispatch(setRedo(data))
        }
    }
    if (loading) return <Skeleton/>
    if (error) return <div>에러발생</div>
    if (!recomdata) return null
    console.log(recomdata)
    return (
        <div className='recommendModal'>
            <div className='recommendModal_inner'>
                <div className='recommendTop'>
                    <h1>추천일정</h1>
                    <div className='Recommend_close' onClick={()=>setRecommend(false)}>X</div>
                </div>
                <div className="recommendBox">
                    <div className='innerRecommend'>
                        <div className='recommendimg'>
                            <Carousel className='slide' afterChange={onChange} >
                                {recomdata.map(data=><div key={data.recommend}><img src={data.img_url} style={contentStyle}/>X</div>)}
                            </Carousel>
                            <button title='전체선택' className='allSelect' onClick={clickall}>모두 선택</button>
                        </div>
                        <div className='recomendplace'>
                            {recomdata.map(data=><Smallrecommend data={data}/>)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Recommend;