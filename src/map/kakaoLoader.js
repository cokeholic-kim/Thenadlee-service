import { useEffect, useState } from 'react';
import { KAKAO_JS_KEY } from './mapProvider';

// 카카오맵 SDK 를 한 번만 불러옴 (장소 검색용 services 라이브러리 포함)
const SDK_URL = 'https://dapi.kakao.com/v2/maps/sdk.js';
let loadPromise = null;

export const loadKakaoMaps = () => {
    loadPromise ??= new Promise((resolve, reject) => {
        if (!KAKAO_JS_KEY) return reject(new Error('카카오 지도 키가 설정되지 않았습니다.'));
        const script = document.createElement('script');
        script.src = `${SDK_URL}?appkey=${KAKAO_JS_KEY}&autoload=false&libraries=services`;
        script.async = true;
        script.onload = () => window.kakao.maps.load(() => resolve(window.kakao));
        script.onerror = () => { loadPromise = null; reject(new Error('카카오 지도를 불러오지 못했습니다.')); };
        document.head.appendChild(script);
        return undefined;
    });
    return loadPromise;
};

export const useKakaoLoader = () => {
    const [state, setState] = useState({ isLoaded: Boolean(window.kakao?.maps?.LatLng), error: null });
    useEffect(() => {
        if (state.isLoaded) return undefined;
        let cancelled = false;
        loadKakaoMaps()
            .then(() => { if (!cancelled) setState({ isLoaded: true, error: null }); })
            .catch((error) => { if (!cancelled) setState({ isLoaded: false, error }); });
        return () => { cancelled = true; };
    }, [state.isLoaded]);
    return state;
};
