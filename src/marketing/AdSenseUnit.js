import React, { useEffect, useRef } from 'react';
import { ADSENSE_CLIENT, isValidSlot } from '../config/ads';
import './AdSenseUnit.scss';

const SCRIPT_ID = 'adsbygoogle-loader';
const SCRIPT_URL = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';

// 광고가 있는 화면에 처음 들어올 때 한 번만 불러옴 (지도·모임 화면에는 광고 스크립트가 없음)
const loadAdScript = () => {
    if (document.getElementById(SCRIPT_ID)) return;
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `${SCRIPT_URL}?client=${ADSENSE_CLIENT}`;
    document.head.appendChild(script);
};

// 애드센스 디스플레이 광고 한 칸. 설정이 없거나 잘못되면 아무것도 그리지 않음
const AdSenseUnit = ({ slot }) => {
    const adRef = useRef(null);
    const enabled = isValidSlot(slot);
    useEffect(() => {
        const element = adRef.current;
        if (!enabled || !element || element.dataset.requested) return;
        loadAdScript();
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            element.dataset.requested = 'true';
        } catch (error) {
            console.warn('광고를 불러오지 못했습니다.', error?.message);
        }
    }, [enabled]);
    if (!enabled) return null;
    return (
        <aside className='adUnit' aria-label='광고'>
            <span className='adUnit__label'>광고</span>
            <ins ref={adRef} className='adsbygoogle' style={{ display: 'block' }} data-ad-client={ADSENSE_CLIENT}
                data-ad-slot={slot} data-ad-format='auto' data-full-width-responsive='true' />
        </aside>
    );
};

export default AdSenseUnit;
