import React from 'react';
import { useSelector } from 'react-redux';
import ReportModal from './ReportModal';
import SpotDetailModal from './SpotDetailModal';
import SpotFormModal from './SpotFormModal';

// 추천 장소 팝업 묶음 (상세 → 수정·신고로 이어짐)
const SpotModals = ({ cityName, center, provider, actions }) => {
    const days = useSelector((state) => state.add.days);
    const { modal, open, close, refresh, remove, add } = actions;
    if (!modal) return null;
    const { type, spot } = modal;
    if (type === 'form') {
        return <SpotFormModal cityName={cityName} center={center} provider={provider} spot={spot} onClose={close}
            onSaved={() => { close(); refresh(); }} />;
    }
    if (type === 'report') {
        return <ReportModal target={{ type: 'SPOT', id: spot.id, title: spot.spotName }} onClose={close} />;
    }
    const isAdded = days.some((daySpots) => daySpots.some((item) => item.id === spot.id));
    return <SpotDetailModal spot={spot} isAdded={isAdded} onClose={close} onAdd={() => add(spot)}
        onEdit={() => open('form', spot)} onDelete={() => remove(spot)} onReport={() => open('report', spot)} />;
};

export default SpotModals;
