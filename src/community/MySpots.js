import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteSpot, fetchMySpots } from '../api/communityApi';
import { CITY_NAMES } from '../seo/pageMeta';
import { getApiErrorMessage } from '../util/apiError';

const STATUS_LABELS = { ACTIVE: '공개 중', HIDDEN: '숨김(신고 검토 중)' };

const SpotRow = ({ spot, onDelete }) => (
    <li className="my-itineraries__item">
        <div className="my-itineraries__info">
            <strong>{spot.name}</strong>
            <span>
                {CITY_NAMES[spot.cityName] || spot.cityName} · {STATUS_LABELS[spot.status] || spot.status} · {spot.createdAt.slice(0, 10)} 등록
            </span>
        </div>
        <div className="my-itineraries__actions">
            <Link to={`/map/${spot.cityName}`}>지도에서 보기</Link>
            <button type="button" onClick={() => onDelete(spot)}>삭제</button>
        </div>
    </li>
);

// 마이페이지 "내가 등록한 장소" (수정은 지도 화면의 장소 상세에서)
const MySpots = () => {
    const [spots, setSpots] = useState(null);
    const load = useCallback(() => {
        fetchMySpots().then(setSpots).catch((error) => alert(getApiErrorMessage(error)));
    }, []);
    useEffect(load, [load]);

    const onDelete = async (spot) => {
        if (!window.confirm(`"${spot.name}" 장소를 삭제할까요? 이 장소를 담은 다른 여행자의 일정에서도 빠져요.`)) return;
        try {
            await deleteSpot(spot.id);
            load();
        } catch (error) {
            alert(getApiErrorMessage(error));
        }
    };

    return (
        <section className="mypage-section my-itineraries">
            <h2>내가 등록한 장소</h2>
            {spots === null && <p>불러오는 중…</p>}
            {spots?.length === 0 && <p>등록한 장소가 없어요. 지도 화면 오른쪽 "나만 아는 장소 등록"으로 추천해 보세요.</p>}
            {spots?.length > 0 && <ul>{spots.map((spot) => <SpotRow key={spot.id} spot={spot} onDelete={onDelete} />)}</ul>}
        </section>
    );
};

export default MySpots;
