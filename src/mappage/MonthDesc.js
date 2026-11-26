import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import CityVideosModal from './CityVideosModal';
import CategoryPageLinks from './CategoryPageLinks';
import { Link } from 'react-router-dom';
import { CITY_NAMES } from '../seo/pageMeta';
import { guidePath } from '../guide/guidePaths';
import './MonthDesc.scss'

// 월별 정보는 여행 시작월 기준 (기간을 안 골랐으면 이번 달)
const useTripMonth = () => {
    const startDate = useSelector((state) => state.itinerary.startDate);
    return startDate ? Number(startDate.slice(5, 7)) : new Date().getMonth() + 1;
};

// 지도 왼쪽 아래 "여행 tip": 그달 여행 정보 + 도시 인기·축제 영상 보기 버튼 + 종류별 추천 링크 (휴대폰은 지도 아래)
const MonthDesc = ({ monthList = [], cityName, className = '' }) => {
    const [videoOpen, setVideoOpen] = useState(false);
    const month = useTripMonth();
    const recommenddesc = monthList.find((info) => info.month === month)?.description;
    return (
        <>
            <div className={`descdiv ${className}`}>
                <h2 className='titleh4'>여행 tip</h2>
                {/* 관리자가 입력한 줄바꿈(날씨 / 축제 등)을 그대로 보여 줌 */}
                {recommenddesc && <p style={{fontSize:14, whiteSpace:'pre-line'}}>{recommenddesc}</p>}
                {recommenddesc && <Link className="descdiv__guide" to={guidePath(cityName, month)}>{month}월 {CITY_NAMES[cityName] || cityName} 여행 가이드 보기 →</Link>}
                <button type="button" className="descdiv__video" onClick={() => setVideoOpen(true)}>
                    ▶ {CITY_NAMES[cityName] || cityName} 여행·{month}월 축제 영상
                </button>
                <CategoryPageLinks cityName={cityName} />
            </div>
            {videoOpen && <CityVideosModal cityName={cityName} month={month} onClose={() => setVideoOpen(false)} />}
        </>
    );
};

export default MonthDesc;
