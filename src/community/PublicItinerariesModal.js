import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { changeItineraryLike, fetchCityItineraries } from '../api/communityApi';
import { clearDay, setLeftAll } from '../modules/add';
import { getApiErrorMessage } from '../util/apiError';
import MapModal from './MapModal';
import ReportModal from './ReportModal';
import './Community.scss';
import { confirmDialog, toast, toastError } from '../ui/feedback';

const ItineraryItem = ({ item, onOpen, onLike, onReport }) => (
    <li className="itinerary-list__item">
        <div className="itinerary-list__title">
            {item.isFeatured && <span className="map-modal__badge is-official">운영진 추천</span>}
            {item.hasVideo && <span className="map-modal__badge is-video">▶ 영상</span>}
            <span>{item.title}</span>
        </div>
        <p className="itinerary-list__meta">{item.authorNickName} · {item.dayCount}일 · 장소 {item.spotCount}곳 · 좋아요 {item.likeCount}{item.copyCount > 0 ? ` · ${item.copyCount}명이 가져감` : ''}</p>
        {item.description && <p className="itinerary-list__description">{item.description}</p>}
        <div className="itinerary-list__actions">
            <button type="button" className="map-modal__button is-small is-mint" onClick={() => onOpen(item)}>{item.isMine ? '지도에서 보기' : '이 일정으로 시작하기'}</button>
            <Link className="map-modal__button is-small" to={`/itinerary/${item.id}`}>일정 페이지</Link>
            {!item.isMine && (
                <button type="button" className={`map-modal__button is-small like-button${item.likedByMe ? ' is-liked' : ''}`}
                    onClick={() => onLike(item)}>{item.likedByMe ? '♥ 좋아요 취소' : '♡ 좋아요'}</button>
            )}
            {!item.isMine && <button type="button" className="map-modal__button is-small is-danger" onClick={() => onReport(item)}>신고</button>}
        </div>
    </li>
);

const useCityItineraries = (cityName) => {
    const [items, setItems] = useState(null);
    const load = useCallback(() => {
        fetchCityItineraries(cityName).then(setItems).catch((error) => toastError(getApiErrorMessage(error)));
    }, [cityName]);
    useEffect(load, [load]);
    const like = async (item) => {
        try {
            const result = await changeItineraryLike(item.id, !item.likedByMe);
            setItems((list) => list.map((row) => (row.id === item.id ? { ...row, likedByMe: result.liked, likeCount: result.likeCount } : row)));
        } catch (error) {
            toast(error.response?.status === 401 ? '좋아요는 로그인 후 누를 수 있어요.' : getApiErrorMessage(error));
        }
    };
    return { items, like };
};

const SelectAllButton = () => {
    const dispatch = useDispatch();
    const { data, left, activeDay } = useSelector((state) => state.add);
    return (
        <button type="button" className="map-modal__button is-small" onClick={() => dispatch(left.length === 0 ? setLeftAll(data) : clearDay())}>
            {left.length === 0 ? `${activeDay + 1}일차에 추천 장소 모두 담기` : `${activeDay + 1}일차 비우기`}
        </button>
    );
};

// 지도 화면 "추천일정": 다른 여행자가 공개한 일정 (운영진 추천 → 좋아요 순), 열어서 내 일정으로 저장 가능
const PublicItinerariesModal = ({ cityName, onClose }) => {
    const navigate = useNavigate();
    const hasSpots = useSelector((state) => state.add.days.some((spots) => spots.length > 0));
    const { items, like } = useCityItineraries(cityName);
    const [reporting, setReporting] = useState(null);
    const openItinerary = async (item) => {
        if (hasSpots && !await confirmDialog('지금 담아 둔 장소 대신 이 일정을 불러올까요? 저장하지 않은 내용은 사라져요.')) return;
        navigate(`/map/${cityName}?itinerary=${item.id}`);
        onClose();
    };
    if (reporting) {
        return <ReportModal target={{ type: 'ITINERARY', id: reporting.id, title: reporting.title }} onClose={() => setReporting(null)} />;
    }
    return (
        <MapModal title="추천 일정" onClose={onClose} wide>
            <div className="itinerary-list__toolbar">
                <p className="map-modal__message">여행자들이 공개한 일정이에요. 열어 보고 "일정 저장"으로 내 일정에 담을 수 있어요.</p>
                <SelectAllButton />
            </div>
            <ItineraryList items={items} onOpen={openItinerary} onLike={like} onReport={setReporting} />
        </MapModal>
    );
};

const ItineraryList = ({ items, ...handlers }) => {
    if (items === null) return <p className="map-modal__message">불러오는 중…</p>;
    if (items.length === 0) return <p className="map-modal__message">아직 공개된 일정이 없어요. 일정을 만들어 "공개"로 저장하면 여기에 보여요.</p>;
    return <ul className="itinerary-list">{items.map((item) => <ItineraryItem key={item.id} item={item} {...handlers} />)}</ul>;
};

export default PublicItinerariesModal;
