import React from 'react';
import { createPortal } from 'react-dom';
import './MapModal.scss';

// 지도 화면 팝업 공통 틀. 지도 화면의 모바일 CSS(.map :nth-child) 영향을 받지 않도록 body 에 그림
const MapModal = ({ title, onClose, wide = false, children }) => createPortal(
    <div className="map-modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className={`map-modal__box${wide ? ' is-wide' : ''}`}>
            <div className="map-modal__head">
                <h2>{title}</h2>
                <button type="button" className="map-modal__close" onClick={onClose} aria-label="닫기">×</button>
            </div>
            <div className="map-modal__body">{children}</div>
        </div>
    </div>,
    document.body,
);

export default MapModal;
