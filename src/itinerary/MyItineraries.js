import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteItinerary, fetchMyItineraries } from '../api/itineraryApi';
import { CITY_NAMES } from '../seo/pageMeta';
import { getApiErrorMessage } from '../util/apiError';
import { confirmDialog, toast, toastError } from '../ui/feedback';
import SpotThumbPlaceholder from '../community/SpotThumbPlaceholder';

const VISIBILITY_LABELS = { PRIVATE: '나만 보기', PUBLIC: '공개' };

// 자주 쓰지 않는 동작(일정 페이지·삭제)은 ⋯ 메뉴 안에
const MoreMenu = ({ item, onDelete }) => (
    <details className="my-itineraries__more">
        <summary aria-label={`${item.title} 더 보기`}>⋯</summary>
        <div className="my-itineraries__menu">
            <Link to={`/itinerary/${item.id}`}>일정 페이지·SNS 링크</Link>
            <button type="button" className="is-danger" onClick={() => onDelete(item)}>삭제</button>
        </div>
    </details>
);

const ItineraryCard = ({ item, onDelete }) => (
    <li className="my-itineraries__item">
        <div className="my-itineraries__thumb">
            {item.thumbnailUrl ? <img src={item.thumbnailUrl} alt="" loading="lazy" referrerPolicy="no-referrer" /> : <SpotThumbPlaceholder />}
        </div>
        <div className="my-itineraries__info">
            <strong>{item.title}</strong>
            <span>
                {CITY_NAMES[item.cityName] || item.cityName} · {item.dayCount}일 · {item.spotCount}곳
                <em className={`my-itineraries__badge${item.visibility === 'PUBLIC' ? ' is-public' : ''}`}>{VISIBILITY_LABELS[item.visibility]}</em>
            </span>
            <span className="my-itineraries__date">{item.updatedAt.slice(0, 10)} 수정</span>
        </div>
        <div className="my-itineraries__actions">
            <Link className="my-itineraries__open" to={`/map/${item.cityName}?itinerary=${item.id}`}>열기</Link>
            <MoreMenu item={item} onDelete={onDelete} />
        </div>
    </li>
);

const useMyItineraries = () => {
    const [items, setItems] = useState(null);
    const load = useCallback(() => {
        fetchMyItineraries().then(setItems).catch((error) => toastError(getApiErrorMessage(error)));
    }, []);
    useEffect(load, [load]);
    const onDelete = async (item) => {
        if (!await confirmDialog(`"${item.title}" 일정을 삭제할까요? 삭제하면 되돌릴 수 없어요.`, { title: '일정 삭제', confirmLabel: '삭제', danger: true })) return;
        try {
            await deleteItinerary(item.id);
            toast('일정을 삭제했어요.');
            load();
        } catch (error) {
            toastError(getApiErrorMessage(error));
        }
    };
    return { items, onDelete };
};

// 마이페이지 "내 일정" 목록 (카드형: 사진, 제목, 요약 한 줄, 열기 + ⋯ 메뉴)
const MyItineraries = () => {
    const { items, onDelete } = useMyItineraries();
    return (
        <section className="mypage-section my-itineraries">
            <h2>내 일정</h2>
            {items === null && <p>불러오는 중…</p>}
            {items?.length === 0 && <p>저장한 일정이 없어요. 여행지에서 장소를 담고 "일정 저장"을 눌러 보세요.</p>}
            {items?.length > 0 && (
                <ul>{items.map((item) => <ItineraryCard key={item.id} item={item} onDelete={onDelete} />)}</ul>
            )}
        </section>
    );
};

export default MyItineraries;
