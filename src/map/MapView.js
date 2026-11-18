import React from 'react';
import GoogleMapView from './GoogleMapView';
import KakaoMapView from './KakaoMapView';
import { MAP_PROVIDERS } from './mapProvider';

// 공급자에 맞는 지도 (스크립트는 호출한 쪽에서 미리 불러온 상태여야 함)
const MapView = ({ provider, ...props }) => (provider === MAP_PROVIDERS.KAKAO
    ? <KakaoMapView {...props} />
    : <GoogleMapView {...props} />);

export default MapView;
