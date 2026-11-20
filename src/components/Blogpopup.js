import React from 'react';
import MapModal from '../community/MapModal';
import { CITY_NAMES } from '../seo/pageMeta';
import './Blogpopup.scss';

const isWebUrl = (url) => /^https?:\/\//i.test(url || '');

const siteOf = (url) => {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return url;
    }
};

// 운영진이 고른 여행기(블로그 글) 목록. 네이버 블로그 등은 다른 사이트 안에 넣어 보여 주는 것(iframe)을 막아서 원문을 새 창으로 엶
const Blogpopup = ({ setBlog, place }) => {
    const posts = (place.postUrl || []).filter(isWebUrl);
    return (
        <MapModal title={`${CITY_NAMES[place.name] || place.name} 여행기`} onClose={() => setBlog(false)}>
            {posts.length === 0 && <p className="map-modal__hint">아직 등록된 여행기가 없어요.</p>}
            <ul className="travel-posts">
                {posts.map((url, index) => (
                    <li key={url}>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                            <strong>여행기 {index + 1}</strong>
                            <span>{siteOf(url)}</span>
                        </a>
                    </li>
                ))}
            </ul>
            {posts.length > 0 && <p className="map-modal__hint">누르면 원문이 새 창으로 열려요. 장소별 영상·후기는 추천 장소의 ⓘ 에서 볼 수 있어요.</p>}
        </MapModal>
    );
};

export default Blogpopup;
