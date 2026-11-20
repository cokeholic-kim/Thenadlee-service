import React, { useState } from 'react';
import CityVideosModal from './CityVideosModal';
import { CITY_NAMES } from '../seo/pageMeta';
import './MonthDesc.scss'

// 지도 위 "여행 tip": 그달 여행 정보 + 도시 인기·축제 영상 보기 버튼
const MonthDesc = ({ recommenddesc, cityName, month }) => {
    const [videoOpen, setVideoOpen] = useState(false);
    return (
        <>
            <div className='descdiv'>
                <h2 className='titleh4'>여행 tip</h2>
                {/* 관리자가 입력한 줄바꿈(날씨 / 축제 등)을 그대로 보여 줌 */}
                {recommenddesc && <p style={{fontSize:14, whiteSpace:'pre-line'}}>{recommenddesc}</p>}
                <button type="button" className="descdiv__video" onClick={() => setVideoOpen(true)}>
                    ▶ {CITY_NAMES[cityName] || cityName} 여행·{month}월 축제 영상
                </button>
            </div>
            {videoOpen && <CityVideosModal cityName={cityName} month={month} onClose={() => setVideoOpen(false)} />}
        </>
    );
};

export default MonthDesc;
