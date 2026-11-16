import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCities } from '../api/cityApi';
import './FindPlace.scss' ;

const CityCard = ({ city }) => (
    <div className='FindPlace_country_detail'>
        <div className='FindPlace_country_detail_left'>
            <div className='FindPlace_country_detail_left_img'>
                {city.titleImageUrl && <img src={city.titleImageUrl} alt={city.displayName} loading='lazy' />}
            </div>
        </div>
        <div className='FindPlace_country_detail_right'>
            <div className='FindPlace_country_detail_right_title'>
                <p>{city.name}</p>
                <p><span>{city.displayName}</span></p>
            </div>
            <p className='FindPlace_country_detail_right_p'>{city.description}</p>
            <div className='FindPlace_country_detail_right_button'>
                <Link to={`/map/${city.name}`}><button>일정만들기</button></Link>
            </div>
        </div>
    </div>
);

// 메인 화면 여행지 목록 (관리자 화면에서 공개로 설정한 여행지, 노출 순서대로)
function FindPlace () {
    const [cities, setCities] = useState(null);
    useEffect(() => {
        fetchCities().then(setCities).catch(() => setCities([]));
    }, []);

    return (
        <div className='FindPlace'>
            <div className='FindPlaceP'>
                <p className='FindPlaceP1'>어디로 여행을 떠나시나요?</p>
                <p className='FindPlaceP2'>여행지를 목록에서 골라 일정을 만들어 보세요</p>
            </div>
            <div className='FindPlace_country'>
                {cities === null && <p>여행지를 불러오는 중…</p>}
                {cities?.length === 0 && <p>준비된 여행지가 없어요.</p>}
                {cities?.map((city) => <CityCard key={city.name} city={city} />)}
            </div>
        </div>
    );
};

export default FindPlace;
