import React,{useEffect, useState} from 'react';
import { MdAirplaneTicket } from "react-icons/md";
import { AiOutlinePlus } from "react-icons/ai";
import './LeftControlbar.scss'
import { useDispatch, useSelector } from 'react-redux';
import AddTurning from './AddTurning';
import { setDown, setRedo, setTop} from '../modules/add';
import useAsync from '../customHook/useAsync';
import Calendar from './Calendar';
import { useParams } from 'react-router';
import axios from 'axios';
import { API_URL } from '../config/apiurl';
import MonthDesc from './MonthDesc';
import Weather from './Weather';
import styled, { createGlobalStyle } from 'styled-components';
import { Skeleton } from 'antd';

async function monthFetch(places){
    const response = await axios.get(`${API_URL}/citydesc/${places}`);
    return response.data
}

const GlobalStyle = createGlobalStyle`
  *{  
    box-sizing: border-box;
  }
  html {
    font-size : 10px;
  }
  body {
    width: 100%;
    margin: 0;
  }
`;

const Wrapper = styled.div`
  width: 100%;
  height: 20%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
`;

const LeftControlbar = ({place,setToggle,toggle}) => {

    const dispatch = useDispatch() ;
    const [cold, setCold] = useState();
    const places = useSelector(state=>state.add)

    // 총시간의 합계 상태값
    const [time,setTime] = useState(0)
    const addTime = () =>{
        let added = 0
        places.left.forEach(T => {
            added=added+Number(T.time)
            console.log(T.time)
        });
        setTime(added)
    }
    useEffect(()=>{
        addTime()
        console.log(time)
    },[places.left])

    const uparr = (index)=>{
        if(index === 0 ){
            alert("순서를  올릴수없습니다.")
        }
        let upitem = places.left.splice(index,1)
        let newarr = places.left
        newarr.splice(index-1,0,upitem[0])
        dispatch(setTop(newarr))
        setToggle(!toggle)
    }

    const downarr = (index)=>{
        if(index >=  places.left.length){
            alert("순서를 내릴수없습니다.")
        }
        let downitem = places.left.splice(index,1)
        let newarr = places.left
        newarr.splice(index+1,0,downitem[0])
        dispatch(setDown(newarr))
        console.log(downitem,newarr)
        setToggle(!toggle)
    }

     //캘린더 날짜 상태관리
     const [ dates , setDates ] = useState({
        start:"",    
        end: ""
    })
    //시작날짜와 끝날짜 셋
    const hideDateDiv = (start,end) => {
        if(start && end){
           setDates({
            start: start,
            end: end
           })
        }else{
            return;
        }
    }
    const term= (dates.start && dates.end) ? <p name='start'>{dates.start}~{dates.end}</p>:<></>
    const monthInfo =Number(dates.start.slice(5,7));
    const {places:cityname} = useParams()
    const state = useAsync(()=>monthFetch(cityname),[]);
    const {loading,error,data} = state;
    if (loading) return <Skeleton/>
    if (error) return <div>에러발생</div>
    if (!data) return null
    let strArr = [];
    for (let Key in data[0]) {
        if(data[0].hasOwnProperty(Key)) {
            strArr.push(data[0][Key]);
        }
    }
    const recommend = strArr.filter((str,index)=>index == monthInfo-1)




    return (
        <div className='LeftControlbar'>
            <div className='background'>
                <div className='Place'>
                    <div id="korCityname">{place.kor_cityname}</div>
                    <div id="engCityname">{place.cityname}</div>
                    <Wrapper className='wheather' cold={cold}>
                        <GlobalStyle/>
                        <Weather setCold={setCold} cityname={place.cityname}/>
                    </Wrapper>
                </div>
                <div className='planeticketing'>
                    <div id="Flightbutton">
                        <button className="Flightbutton">
                            <MdAirplaneTicket/>
                            <img style={{width:"80px"}} src="../imgs/kyowon.png" alt="placephoto" loading='lazy'></img>
                        </button>
                    </div>
                </div>    
                <Calendar className="calendar" hideDateDiv={hideDateDiv}/>
                <div className='selectList'>
                    <p>선택목록</p>
                </div>
                <div className="center" style={{margin:"16px 0",width:"100%" }}>
                    <ul id="tabs" className="tabs tabs-fixed-width">
                        <li className="tab">
                            <a id="selecteSpotsTab" style={{textDecoration:"none !important"}}>장 소</a>
                        </li>
                    </ul>
                </div>
                <div className="left_bottom_ul">
                    <div className="center" style={{margin:"8px 0"}}>
                        <span id="seletedSpotsCount">{time}</span>
                        <span id="totalTimeArea"><span>(총</span><span id="sumOfSpotStayingH">{time}</span><span data-langnum="20">시간</span>)</span>
                    </div>
                    <div className="center2" style={{display:"flex", justifyContent: "center" , alignItems: "center", width: "100%" , padding: "8px 0"}}>
                        <button className="Clearbtn" onClick={()=>dispatch(setRedo(places.data))}>
                            <h6>장소전체삭제</h6>
                        </button>
                    </div>
                        {term}
                    <ul className="ul-style" id="cart">
                        { places.left.length != 0 ? places.left.map((d,index)=> <AddTurning key={index} adds={d} uparr={uparr} downarr={downarr} index={index}/>): 
                            <li id="cartList" className="center">
                                <hs>
                                    <span data-langnum="27">가고 싶은 장소들을 검색하여 추가해주세요.</span><br/>
                                    <span data-langnum="28">설정하신 일자별 여행시간 내에서 </span><br/>
                                    <span data-langnum="29">하루 평균 최대 8개의 장소까지 선택 가능합니다.</span><br/><br/>
                                    <AiOutlinePlus/>
                                </hs>
                            </li>
                        }
                    </ul>
                </div>
                </div>
                {recommend.length > 0 && <MonthDesc recommenddesc={recommend}/>}
                
            </div>            
    );
};

export default LeftControlbar;