import { cityPageMeta } from '../seo/pageMeta';
import React,{useEffect, useState} from 'react';
import { MdAirplaneTicket } from "react-icons/md";
import { AiOutlinePlus } from "react-icons/ai";
import './LeftControlbar.scss'
import { useDispatch, useSelector } from 'react-redux';
import AddTurning from './AddTurning';
import { clearDay, moveSpot, reorderSpot } from '../modules/add';
import useDragSort from '../itinerary/useDragSort';
import { changeTripDates } from '../modules/itinerary';
import DayTabs from '../itinerary/DayTabs';
import useAsync from '../customHook/useAsync';
import Calendar from './Calendar';
import { useParams } from 'react-router';
import axios from 'axios';
import { API_URL, FILE_URL } from '../config/apiurl';
import MonthDesc from './MonthDesc';
import Weather from './Weather';
import styled, { createGlobalStyle } from 'styled-components';
import { Skeleton } from 'antd';

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


const LeftControlbar = ({place,setToggle,toggle,month}) => {
    const dispatch = useDispatch() ;
    const [cold, setCold] = useState();
    const places = useSelector(state=>state.add)
    const { startDate, endDate } = useSelector(state=>state.itinerary)

    // 현재 일차 안에서 순서 바꾸기: 끌어서 놓기, 또는 손잡이에서 화살표 키 (맨 위/맨 아래에서는 무시)
    const { itemProps, dragging } = useDragSort((from, to) => dispatch(reorderSpot(from, to)))
    const onKeyMove = (index, offset) => dispatch(moveSpot(index, offset))

    // 여행 기간을 고르면 일차 수가 함께 바뀜
    const onChangeDates = (start,end) => {
        if(start && end) dispatch(changeTripDates(start, end))
    }
    const term = (startDate && endDate) ? <p name='start'>{startDate}~{endDate}</p>:<></>
    // 월별 정보는 여행 시작월 기준 (기간을 안 골랐으면 이번 달)
    const monthInfo = startDate ? Number(startDate.slice(5,7)) : new Date().getMonth() + 1;

    const recommend = month.find(({month})=> month === monthInfo)
    return (
        <div className='LeftControlbar'>
            <div className='background'>
                <div className='Place'>
                    {/* 페이지 제목: 화면에는 도시 영문 이름, 검색엔진·화면 낭독기에는 "제주 여행 일정 만들기" */}
                    <h1 id="korCityname"><span aria-hidden="true">{place.name}</span><span className="sr-only">{cityPageMeta(place.name).title}</span></h1>
                    {/* <div id="engCityname">{place.cityname}</div> */}
                    <Wrapper className='wheather' cold={cold}>
                        <GlobalStyle/>
                        <Weather setCold={setCold} cityname={place.name}/>
                    </Wrapper>
                </div>
                <div className='planeticketing'>
                    <div id="Flightbutton">
                        <button className="Flightbutton">
                            <MdAirplaneTicket/>
                            <img style={{width:"80px"}} src={`${FILE_URL}/imgs/kyowon.png`} alt="placephoto" loading='lazy'></img>
                        </button>
                    </div>
                </div>    
                <Calendar className="calendar" startDate={startDate} endDate={endDate} onChangeDates={onChangeDates}/>
                <div className='selectList'>
                    <p>선택목록</p>
                </div>
                <div className="center" style={{margin:"16px 0",width:"100%" }}>
                    <DayTabs/>
                </div>
                <div className="left_bottom_ul">
                    <div className="center" style={{margin:"8px 0"}}>
                    </div>
                    <div className="center2" style={{display:"flex", justifyContent: "center" , alignItems: "center", width: "100%" , padding: "8px 0"}}>
                        <button className="Clearbtn" onClick={()=>dispatch(clearDay())}>
                            <h6>{places.activeDay + 1}일차 비우기</h6>
                        </button>
                    </div>
                        {term}
                    <ul className={`ul-style${dragging ? ' is-dragging' : ''}`} id="cart">
                        { places.left.length != 0 ? places.left.map((data,index)=> <AddTurning key={data.id} adds={data} index={index} onKeyMove={onKeyMove} dragProps={itemProps(index)}/>):
                            <li id="cartList" className="center">
                                <p className="empty-cart-guide">
                                    아직 담은 장소가 없어요.<br/>
                                    오른쪽 추천 장소에서 + 를 눌러<br/>
                                    가고 싶은 곳을 담아 보세요.<br/><br/>
                                    <AiOutlinePlus/>
                                </p>
                            </li>
                        }
                    </ul>
                </div>
                </div>
                <MonthDesc recommenddesc={recommend?.description} cityName={place.name} month={monthInfo}/>
                
            </div>            
    );
};

export default LeftControlbar;