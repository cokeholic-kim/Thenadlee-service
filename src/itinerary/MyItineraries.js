import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteItinerary, fetchMyItineraries } from '../api/itineraryApi';
import { CITY_NAMES } from '../seo/pageMeta';
import { getApiErrorMessage } from '../util/apiError';

const VISIBILITY_LABELS = { PRIVATE: '나만 보기', PUBLIC: '공개' };

const ItineraryRow = ({ item, onDelete }) => (
    <li className="my-itineraries__item">
        <div className="my-itineraries__info">
            <strong>{item.title}</strong>
            <span>
                {CITY_NAMES[item.cityName] || item.cityName} · {item.dayCount}일 · 장소 {item.spotCount}곳 ·{' '}
                {VISIBILITY_LABELS[item.visibility]} · {item.updatedAt.slice(0, 10)} 수정
            </span>
        </div>
        <div className="my-itineraries__actions">
            <Link to={`/map/${item.cityName}?itinerary=${item.id}`}>열기</Link>
            <Link to={`/itinerary/${item.id}`}>일정 페이지·SNS</Link>
            <button type="button" onClick={() => onDelete(item)}>삭제</button>
        </div>
    </li>
);

// 마이페이지 "내 일정" 목록
const MyItineraries = () => {
    const [items, setItems] = useState(null);
    const load = useCallback(() => {
        fetchMyItineraries().then(setItems).catch((error) => alert(getApiErrorMessage(error)));
    }, []);
    useEffect(load, [load]);

    const onDelete = async (item) => {
        if (!window.confirm(`"${item.title}" 일정을 삭제할까요? 삭제하면 되돌릴 수 없어요.`)) return;
        try {
            await deleteItinerary(item.id);
            load();
        } catch (error) {
            alert(getApiErrorMessage(error));
        }
    };

    return (
        <section className="mypage-section my-itineraries">
            <h2>내 일정</h2>
            {items === null && <p>불러오는 중…</p>}
            {items?.length === 0 && <p>저장한 일정이 없어요. 여행지에서 장소를 담고 "일정저장"을 눌러 보세요.</p>}
            {items?.length > 0 && (
                <ul>{items.map((item) => <ItineraryRow key={item.id} item={item} onDelete={onDelete} />)}</ul>
            )}
        </section>
    );
};

export default MyItineraries;
