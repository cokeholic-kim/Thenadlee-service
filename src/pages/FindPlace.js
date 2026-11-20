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

// 국내·해외 탭 (서버 city.region 값)
const REGION_TABS = [
    { value: 'DOMESTIC', label: '국내 여행' },
    { value: 'OVERSEAS', label: '해외 여행' },
];

const RegionTabs = ({ region, onChange, cities }) => (
    <div className='FindPlace_tabs' role='tablist' aria-label='여행지 구분'>
        {REGION_TABS.map((tab) => (
            <button key={tab.value} type='button' role='tab' aria-selected={region === tab.value}
                className={region === tab.value ? 'active' : ''} onClick={() => onChange(tab.value)}>
                {tab.label} <span>{cities ? cities.filter((city) => city.region === tab.value).length : ''}</span>
            </button>
        ))}
    </div>
);

// 메인 화면 여행지 목록 (관리자 화면에서 공개로 설정한 여행지, 노출 순서대로, 국내·해외 탭)
function FindPlace () {
    const [cities, setCities] = useState(null);
    const [region, setRegion] = useState(REGION_TABS[0].value);
    const visible = cities?.filter((city) => city.region === region);
    useEffect(() => {
        fetchCities().then(setCities).catch(() => setCities([]));
    }, []);

    return (
        <div className='FindPlace' id='places'>
            <div className='FindPlaceP'>
                <p className='FindPlaceP1'>어디로 여행을 떠나시나요?</p>
                <p className='FindPlaceP2'>여행지를 목록에서 골라 일정을 만들어 보세요</p>
            </div>
            <RegionTabs region={region} onChange={setRegion} cities={cities} />
            <div className='FindPlace_country'>
                {cities === null && <p>여행지를 불러오는 중…</p>}
                {visible?.length === 0 && <p>준비된 여행지가 없어요.</p>}
                {visible?.map((city) => <CityCard key={city.name} city={city} />)}
            </div>
        </div>
    );
};

export default FindPlace;
