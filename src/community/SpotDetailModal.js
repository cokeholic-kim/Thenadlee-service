import React from 'react';
import MapModal from './MapModal';
import { GroupSpotComments, GroupWishButton } from '../group/GroupMapContext';
import './Community.scss';

export const SourceBadge = ({ spot }) => (spot.source === 'USER'
    ? <span className="map-modal__badge">여행자 추천</span>
    : <span className="map-modal__badge is-official">운영진 추천</span>);

const SpotActions = ({ spot, isAdded, onAdd, onEdit, onDelete, onReport }) => (
    <div className="map-modal__actions">
        <button type="button" className="map-modal__button is-mint" disabled={isAdded} onClick={onAdd}>
            {isAdded ? '일정에 담김' : '일정에 담기'}
        </button>
        {spot.isMine && <button type="button" className="map-modal__button" onClick={onEdit}>수정</button>}
        {spot.isMine && <button type="button" className="map-modal__button is-danger" onClick={onDelete}>삭제</button>}
        {!spot.isMine && <button type="button" className="map-modal__button is-danger" onClick={onReport}>신고</button>}
    </div>
);

// 추천 장소 상세: 사진, 소개, 등록자. 내가 등록한 장소면 수정·삭제, 아니면 신고
const SpotDetailModal = ({ spot, onClose, ...actions }) => (
    <MapModal title={spot.spotName} onClose={onClose}>
        {spot.images.length > 0 && (
            <div className="spot-detail__photos">
                {spot.images.map((url) => <img key={url} src={url} alt={spot.spotName} referrerPolicy="no-referrer" />)}
            </div>
        )}
        <p className="spot-detail__meta">
            <SourceBadge spot={spot} />
            {spot.source === 'USER' && <span>{spot.authorNickName || '탈퇴한 회원'} 님이 등록</span>}
        </p>
        {spot.description && <p className="spot-detail__description">{spot.description}</p>}
        {spot.credit && <p className="map-modal__hint">자료 제공: {spot.credit}</p>}
        <SpotActions spot={spot} {...actions} />
        <div className="map-modal__actions"><GroupWishButton spot={spot} /></div>
        <GroupSpotComments spot={spot} />
    </MapModal>
);

export default SpotDetailModal;
