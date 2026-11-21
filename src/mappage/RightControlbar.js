import './RightControlbar.scss' ;
import { useParams } from 'react-router-dom';
import AddSpot from './AddSpot';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useMemo, useState } from 'react';
import { providerFor } from '../map/mapProvider';
import { setRedo } from '../modules/add';
import useSpotActions from '../community/useSpotActions';
import SpotModals from '../community/SpotModals';
import { GroupMapBanner } from '../group/GroupMapContext';
import { ALL_CATEGORIES, countCategories } from '../community/spotCategories';
import '../community/Community.scss';

// 추천 장소 보기 필터 (서버 spot.source 값)
const SPOT_FILTERS = [
    { value: 'ALL', label: '전체' },
    { value: 'OFFICIAL', label: '운영진 추천' },
    { value: 'USER', label: '여행자 추천' },
];

// 그 도시 목록에 있는 종류만 개수와 함께 (종류가 하나뿐이면 숨김)
const CategoryFilter = ({ categories, value, onChange }) => (categories.length < 2 ? null : (
    <div className="spot-toolbar__categories" role="group" aria-label="장소 종류">
        <button type="button" className={value === ALL_CATEGORIES ? 'is-active' : ''} onClick={() => onChange(ALL_CATEGORIES)}>모든 종류</button>
        {categories.map((category) => (
            <button key={category.value} type="button" className={value === category.value ? 'is-active' : ''}
                onClick={() => onChange(category.value)}>{category.label} <span>{category.count}</span></button>
        ))}
    </div>
));

const SpotToolbar = ({ filters, onRegister }) => (
    <div className="spot-toolbar">
        <div className="spot-toolbar__filters">
            {SPOT_FILTERS.map((option) => (
                <button key={option.value} type="button" className={filters.source === option.value ? 'is-active' : ''}
                    onClick={() => filters.setSource(option.value)}>{option.label}</button>
            ))}
        </div>
        <CategoryFilter categories={filters.categories} value={filters.category} onChange={filters.setCategory} />
        <button type="button" className="spot-toolbar__register" onClick={onRegister}>+ 나만 아는 장소 등록</button>
    </div>
);

// 출처(운영진·여행자)와 종류를 함께 적용. 고른 종류가 목록에서 사라지면(일정에 다 담음 등) 전체로 되돌림
const useSpotFilters = (spots) => {
    const [source, setSource] = useState('ALL');
    const [picked, setCategory] = useState(ALL_CATEGORIES);
    const bySource = spots.filter((spot) => source === 'ALL' || spot.source === source);
    const categories = countCategories(bySource);
    const category = categories.some((option) => option.value === picked) ? picked : ALL_CATEGORIES;
    const visible = bySource.filter((spot) => category === ALL_CATEGORIES || spot.category === category);
    return { source, setSource, category, setCategory, categories, visible };
};

const RightControlbar = ({ marker, place, onLocate, highlightId, mobileHidden }) => (
    <RightControlPage data={marker} place={place} onLocate={onLocate} highlightId={highlightId} mobileHidden={mobileHidden} />
);

export default RightControlbar;

// 오른쪽 추천 장소 목록: 운영진 추천 / 여행자 추천 구분, 여행자 장소 등록
function RightControlPage({ data, place, onLocate, highlightId, mobileHidden }) {
    const dispatch = useDispatch()
    const { places } = useParams()
    const actions = useSpotActions(places)
    useEffect(()=>{
        dispatch(setRedo(data))
    },[])
    const rightdata = useSelector(state=>state.add.right)
    const center = useMemo(() => ({ lat: place.lat, lng: place.lon }), [place.lat, place.lon])
    const filters = useSpotFilters(rightdata)

    return (
        <div className={` RightControlbar${mobileHidden ? ' is-mobile-hidden' : ''}`}>
            <div className=" RightControlbar_inner">
                <div className=" RightControlbar_header">
                    <p>추천장소</p>
                </div>
                <GroupMapBanner />
                <SpotToolbar filters={filters} onRegister={() => actions.open('form')} />
                <ul className=" RightControlbar_contents">
                    {filters.visible.map((d)=><AddSpot key={d.id} spot={d} onLocate={onLocate} isLocated={highlightId === d.id} onOpen={(spot) => actions.open('detail', spot)}/>)}
                </ul>
            </div>
            <SpotModals cityName={places} center={center} provider={providerFor(place.region)} actions={actions} />
        </div>
    )
}
