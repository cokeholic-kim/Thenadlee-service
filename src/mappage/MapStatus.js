import React from 'react';
import { Link } from 'react-router-dom';
import './MapStatus.scss';

const NOT_FOUND = 404;

// 지도 화면을 불러오는 중: 화면 모양 그대로의 회색 자리표시
export const MapLoading = () => (
    <div className="map-status map-status--loading" role="status" aria-live="polite">
        <div className="map-status__skeleton is-side" />
        <div className="map-status__skeleton is-map"><span>여행지를 불러오는 중…</span></div>
        <div className="map-status__skeleton is-side" />
    </div>
);

// 없는·비공개 여행지는 안내와 여행지 목록 링크, 그 밖의 오류는 다시 시도
export const MapError = ({ error }) => {
    const notFound = error?.response?.status === NOT_FOUND;
    return (
        <div className="map-status map-status--error">
            <h1>{notFound ? '찾을 수 없는 여행지예요' : '여행지를 불러오지 못했어요'}</h1>
            <p>{notFound ? '주소가 바뀌었거나 아직 공개되지 않은 여행지예요.' : '잠시 후 다시 시도해 주세요.'}</p>
            <div className="map-status__actions">
                {!notFound && <button type="button" onClick={() => window.location.reload()}>다시 시도</button>}
                <Link to="/#places">여행지 목록 보기</Link>
            </div>
        </div>
    );
};
