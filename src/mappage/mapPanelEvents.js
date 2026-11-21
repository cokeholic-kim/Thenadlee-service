import { useEffect } from 'react';

// 지도 화면 안에서 "이 패널을 보여 줘" 요청 (예: 빈 선택목록의 "추천 장소 보기" → 추천 장소)
const EVENT_NAME = 'map-panel-request';

export const MAP_PANELS = { MAP: 'map', PLAN: 'plan', SPOTS: 'spots' };

export const requestMapPanel = (panel) => window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: panel }));

export const useMapPanelRequest = (handler) => {
    useEffect(() => {
        const listener = (event) => handler(event.detail);
        window.addEventListener(EVENT_NAME, listener);
        return () => window.removeEventListener(EVENT_NAME, listener);
    }, [handler]);
};
