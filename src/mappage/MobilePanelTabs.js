import React from 'react';
import { useSelector } from 'react-redux';
import { MAP_PANELS } from './mapPanelEvents';

// 휴대폰 지도 화면: 지도 아래 탭 (추천 장소 / 내 일정). PC 에서는 CSS 로 숨김
const MobilePanelTabs = ({ panel, onChange }) => {
    const planCount = useSelector((state) => state.add.days.reduce((sum, spots) => sum + spots.length, 0));
    const tab = (value, label, extra) => (
        <button type="button" role="tab" aria-selected={panel === value} className={panel === value ? 'is-active' : ''}
            onClick={() => onChange(value)}>{label}{extra}</button>
    );
    return (
        <div className="map-mobile-tabs" role="tablist" aria-label="지도 화면 목록">
            {tab(MAP_PANELS.SPOTS, '추천 장소')}
            {tab(MAP_PANELS.PLAN, '내 일정', <span className="map-mobile-tabs__count">{planCount}</span>)}
        </div>
    );
};

export default MobilePanelTabs;
