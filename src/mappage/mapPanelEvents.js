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

// 추천 장소 목록을 한 종류로 거르기 요청 (선택목록 "구성 안내"의 버튼)
const CATEGORY_EVENT_NAME = 'map-spot-category-request';

export const requestSpotCategory = (category) => window.dispatchEvent(new CustomEvent(CATEGORY_EVENT_NAME, { detail: category }));

export const useSpotCategoryRequest = (handler) => {
    useEffect(() => {
        const listener = (event) => handler(event.detail);
        window.addEventListener(CATEGORY_EVENT_NAME, listener);
        return () => window.removeEventListener(CATEGORY_EVENT_NAME, listener);
    }, [handler]);
};

// 추천 장소 목록을 상황 태그 하나로 거르기 요청 (선택목록 "비 예보" 안내의 버튼)
const TAG_EVENT_NAME = 'map-spot-tag-request';

export const requestSpotTag = (tag) => window.dispatchEvent(new CustomEvent(TAG_EVENT_NAME, { detail: tag }));

export const useSpotTagRequest = (handler) => {
    useEffect(() => {
        const listener = (event) => handler(event.detail);
        window.addEventListener(TAG_EVENT_NAME, listener);
        return () => window.removeEventListener(TAG_EVENT_NAME, listener);
    }, [handler]);
};
