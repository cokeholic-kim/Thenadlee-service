import './RightControlbar.scss' ;
import { useParams } from 'react-router-dom';
import AddSpot from './AddSpot';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { setRedo } from '../modules/add';
import useSpotActions from '../community/useSpotActions';
import SpotModals from '../community/SpotModals';
import '../community/Community.scss';

// 추천 장소 보기 필터 (서버 spot.source 값)
const SPOT_FILTERS = [
    { value: 'ALL', label: '전체' },
    { value: 'OFFICIAL', label: '운영진 추천' },
    { value: 'USER', label: '여행자 추천' },
];

const SpotToolbar = ({ filter, onFilter, onRegister }) => (
    <div className="spot-toolbar">
        <div className="spot-toolbar__filters">
            {SPOT_FILTERS.map((option) => (
                <button key={option.value} type="button" className={filter === option.value ? 'is-active' : ''}
                    onClick={() => onFilter(option.value)}>{option.label}</button>
            ))}
        </div>
        <button type="button" className="spot-toolbar__register" onClick={onRegister}>+ 나만 아는 장소 등록</button>
    </div>
);

const RightControlbar = ({ map, marker, place }) => <RightControlPage data={marker} map={map} place={place} />;

export default RightControlbar;

// 오른쪽 추천 장소 목록: 운영진 추천 / 여행자 추천 구분, 여행자 장소 등록
function RightControlPage({ data, map, place }) {
    const dispatch = useDispatch()
    const { places } = useParams()
    const [filter, setFilter] = useState('ALL')
    const actions = useSpotActions(places)
    useEffect(()=>{
        dispatch(setRedo(data))
    },[])
    const rightdata = useSelector(state=>state.add.right)
    const visible = rightdata.filter((spot) => filter === 'ALL' || spot.source === filter)

    return (
        <div className=" RightControlbar">
            <div className=" RightControlbar_inner">
                <div className=" RightControlbar_header">
                    <p>추천장소</p>
                </div>
                <SpotToolbar filter={filter} onFilter={setFilter} onRegister={() => actions.open('form')} />
                <ul className=" RightControlbar_contents">
                    {visible.map((d)=><AddSpot key={d.id} spot={d} map={map} onOpen={(spot) => actions.open('detail', spot)}/>)}
                </ul>
            </div>
            <SpotModals cityName={places} center={{ lat: place.lat, lng: place.lon }} actions={actions} />
        </div>
    )
}
