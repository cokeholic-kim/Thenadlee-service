import React, { useEffect, useState } from 'react';
import MapModal from '../community/MapModal';
import { VideoCard } from '../community/SpotMedia';
import { fetchCityMedia } from '../api/communityApi';
import { CITY_NAMES } from '../seo/pageMeta';
import '../community/SpotMedia.scss';

const VideoSection = ({ title, videos }) => (videos.length === 0 ? null : (
    <>
        <h3>{title}</h3>
        <ul className="spot-media__videos">{videos.map((video) => <VideoCard key={video.url} video={video} />)}</ul>
    </>
));

// 도시 인기 여행 영상과 그달 축제·행사 영상 (검색 결과라 내용은 각 원작자의 것, 유튜브는 누를 때만 재생)
const CityVideosModal = ({ cityName, month, onClose }) => {
    const [media, setMedia] = useState(null);
    useEffect(() => {
        let cancelled = false;
        fetchCityMedia(cityName, month).then((data) => { if (!cancelled) setMedia(data); }).catch(() => { if (!cancelled) setMedia(false); });
        return () => { cancelled = true; };
    }, [cityName, month]);
    const label = CITY_NAMES[cityName] || cityName;
    const empty = media && media.videos.length === 0 && media.festivalVideos.length === 0;
    return (
        <MapModal title={`${label} 여행 영상`} onClose={onClose} wide>
            <section className="spot-media">
                {media === null && <p className="spot-media__loading">영상을 불러오는 중…</p>}
                {(media === false || empty) && <p className="spot-media__loading">지금은 영상을 불러올 수 없어요. 잠시 후 다시 열어 주세요.</p>}
                {media && <VideoSection title={`인기 ${label} 여행 영상`} videos={media.videos} />}
                {media && <VideoSection title={`${month}월 축제·행사 영상`} videos={media.festivalVideos} />}
                {media && !empty && <p className="spot-media__source">검색 결과: {media.source} · 제목을 누르면 원문이 새 창으로 열려요</p>}
            </section>
        </MapModal>
    );
};

export default CityVideosModal;
