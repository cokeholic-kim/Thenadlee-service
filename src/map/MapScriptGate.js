import React from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { Skeleton } from 'antd';
import { useKakaoLoader } from './kakaoLoader';
import { GOOGLE_API_KEY, MAP_PROVIDERS } from './mapProvider';

// Google Maps 라이브러리 (경로는 Routes 라이브러리를 importLibrary 로 따로 불러옴)
const GOOGLE_LIBRARIES = ['places', 'geometry'];

const GoogleGate = ({ children }) => {
    const { isLoaded, loadError } = useJsApiLoader({ googleMapsApiKey: GOOGLE_API_KEY, libraries: GOOGLE_LIBRARIES });
    if (loadError) return <p className="map-load-error">지도를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</p>;
    return isLoaded ? children : <Skeleton />;
};

const KakaoGate = ({ children }) => {
    const { isLoaded, error } = useKakaoLoader();
    if (error) return <p className="map-load-error">{error.message}</p>;
    return isLoaded ? children : <Skeleton />;
};

// 공급자 지도 스크립트를 불러온 뒤에 화면을 그림 (해외는 Google, 국내는 카카오만 불러옴)
const MapScriptGate = ({ provider, children }) => (provider === MAP_PROVIDERS.KAKAO
    ? <KakaoGate>{children}</KakaoGate>
    : <GoogleGate>{children}</GoogleGate>);

export default MapScriptGate;
