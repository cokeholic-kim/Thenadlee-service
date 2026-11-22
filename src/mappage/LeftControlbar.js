import { CITY_NAMES } from '../seo/pageMeta';
import React,{ useState } from 'react';
import './LeftControlbar.scss'
import { useDispatch, useSelector } from 'react-redux';
import AddTurning from './AddTurning';
import { clearDay, moveSpot, reorderSpot, restoreDay } from '../modules/add';
import useDragSort from '../itinerary/useDragSort';
import { changeTripDates } from '../modules/itinerary';
import DayTabs from '../itinerary/DayTabs';
import Calendar from './Calendar';
import Weather from './Weather';
import MapPartnerLink from './MapPartnerLink';
import OptimizeRouteButton from './OptimizeRouteButton';
import RedistributeDaysButton from './RedistributeDaysButton';
import PlanBalance from './PlanBalance';
import { DayEndTime, DayStartTime, useDayTimetable } from './DayTimetable';
import MonthDesc from './MonthDesc';
import { MAP_PANELS, requestMapPanel } from './mapPanelEvents';
import { toast } from '../ui/feedback';
import styled, { createGlobalStyle } from 'styled-components';
import { trackEvent } from '../analytics/analytics';

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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 0.6rem;
`;

// 비우기는 확인 창 없이 바로 하고, 몇 초 동안 "되돌리기"를 보여 줌
const ClearDayButton = ({ activeDay, spots }) => {
    const dispatch = useDispatch();
    if (spots.length === 0) return null;
    const onClear = () => {
        dispatch(clearDay());
        toast(`${activeDay + 1}일차를 비웠어요.`, { actionLabel: '되돌리기', onAction: () => dispatch(restoreDay(activeDay, spots)) });
    };
    return <button type="button" className="Clearbtn" onClick={onClear}>{activeDay + 1}일차 비우기</button>;
};

const EmptyPlan = () => (
    <li id="cartList" className="center">
        <p className="empty-cart-guide">아직 담은 장소가 없어요.<br/>추천 장소에서 + 를 눌러 가고 싶은 곳을 담아 보세요.</p>
        <button type="button" className="empty-cart-button" onClick={() => requestMapPanel(MAP_PANELS.SPOTS)}>추천 장소 보기</button>
    </li>
);

// 현재 일차 안에서 순서 바꾸기: 끌어서 놓기, 또는 손잡이에서 화살표 키 (맨 위/맨 아래에서는 무시)
const PlanList = ({ spots, timetable }) => {
    const dispatch = useDispatch();
    const { itemProps, dragging } = useDragSort((from, to) => { dispatch(reorderSpot(from, to)); trackEvent('reorder_spot', { method: 'drag' }); });
    const onKeyMove = (index, offset) => dispatch(moveSpot(index, offset));
    return (
        <ul className={`ul-style${dragging ? ' is-dragging' : ''}`} id="cart">
            {spots.length ? spots.map((data, index) => <AddTurning key={data.id} adds={data} index={index} onKeyMove={onKeyMove} dragProps={itemProps(index)} timing={timetable.rows[index]}/>)
                : <EmptyPlan/>}
        </ul>
    );
};

// 일차 탭 + (2일 이상일 때) 일차 고르게 나누기
const DayTabsSection = () => (
    <div className="center day-tabs-section">
        <DayTabs/>
        <RedistributeDaysButton/>
    </div>
);

const CityHeading = ({ place }) => {
    const [cold, setCold] = useState();
    const name = CITY_NAMES[place.name] || place.name;
    return (
        <div className='Place'>
            {/* 페이지 제목: 한글 도시 이름 (검색엔진·화면 낭독기에는 "제주 여행 일정 만들기") */}
            <h1 id="korCityname">{name}<span className="sr-only"> 여행 일정 만들기</span></h1>
            <Wrapper className='wheather' cold={cold}>
                <GlobalStyle/>
                <Weather setCold={setCold} cityname={place.name}/>
            </Wrapper>
        </div>
    );
};

const LeftControlbar = ({ place, monthList, mobileHidden, route }) => {
    const dispatch = useDispatch() ;
    const places = useSelector(state=>state.add)
    const timetable = useDayTimetable(places.left, route)
    const { startDate, endDate } = useSelector(state=>state.itinerary)
    // 여행 기간을 고르면 일차 수가 함께 바뀜
    const onChangeDates = (start,end) => { if(start && end) dispatch(changeTripDates(start, end)) }
    return (
        <div className={`LeftControlbar${mobileHidden ? ' is-mobile-hidden' : ''}`}>
            <div className='background'>
                <CityHeading place={place}/>
                <MonthDesc monthList={monthList} cityName={place.name} className="is-mobile-only"/>
                <div className='planeticketing'><MapPartnerLink/></div>
                <Calendar className="calendar" startDate={startDate} endDate={endDate} onChangeDates={onChangeDates}/>
                <div className='selectList'><p>선택목록</p></div>
                <DayTabsSection/>
                <div className="left_bottom_ul">
                    {startDate && endDate && <p name='start' className="trip-term">{startDate} ~ {endDate}</p>}
                    <DayStartTime hasSpots={places.left.length > 0}/>
                    <PlanList spots={places.left} timetable={timetable}/>
                    <DayEndTime timetable={timetable}/>
                    <PlanBalance activeDay={places.activeDay} spots={places.left}/>
                    <div className="center2"><OptimizeRouteButton activeDay={places.activeDay} spots={places.left}/><ClearDayButton activeDay={places.activeDay} spots={places.left}/></div>
                </div>
            </div>
        </div>
    );
};

export default LeftControlbar;
