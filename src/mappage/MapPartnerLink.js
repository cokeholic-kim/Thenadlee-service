import React from 'react';
import { MdAirplaneTicket } from 'react-icons/md';
import { FILE_URL } from '../config/apiurl';
import { MAP_PARTNER } from '../marketing/mainContent';

// 지도 화면 제휴 링크: 주소가 정해졌을 때만 보임 (외부 사이트로 이동만 하고 회원 정보는 넘기지 않음)
const MapPartnerLink = () => {
    if (!MAP_PARTNER.url) return null;
    return (
        <a className="map-partner" href={MAP_PARTNER.url} target="_blank" rel="sponsored noopener noreferrer">
            <MdAirplaneTicket aria-hidden="true" />
            <img src={`${FILE_URL}/imgs/${MAP_PARTNER.image}`} alt={MAP_PARTNER.label} loading="lazy" />
            <span className="map-partner__ad">광고</span>
        </a>
    );
};

export default MapPartnerLink;
