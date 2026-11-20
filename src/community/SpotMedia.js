import React, { useEffect, useState } from 'react';
import { fetchSpotMedia } from '../api/communityApi';
import './SpotMedia.scss';

// 쿠키를 남기지 않는 유튜브 플레이어 (누를 때만 불러와서 그 전에는 유튜브로 접속 정보가 가지 않음)
const YOUTUBE_EMBED_URL = 'https://www.youtube-nocookie.com/embed/';
const SECONDS_PER_MINUTE = 60;

const formatDuration = (seconds) => (seconds == null ? ''
    : `${Math.floor(seconds / SECONDS_PER_MINUTE)}:${String(seconds % SECONDS_PER_MINUTE).padStart(2, '0')}`);

const hashtagOf = (spotName) => `#${spotName.replace(/\s*[([][^)\]]*[)\]]/g, '').replace(/[^\p{L}\p{N}_]/gu, '')}`;

const ExternalLink = ({ href, className, children }) => (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}</a>
);

const VideoPlayer = ({ video }) => (
    <div className="spot-media__player">
        <iframe src={`${YOUTUBE_EMBED_URL}${video.youtubeId}?autoplay=1&rel=0`} title={video.title}
            allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
    </div>
);

// 유튜브 영상은 그 자리에서 재생, 그 밖의 영상은 원래 사이트를 새 창으로
const VideoCard = ({ video }) => {
    const [playing, setPlaying] = useState(false);
    const play = () => (video.youtubeId ? setPlaying(true) : window.open(video.url, '_blank', 'noopener,noreferrer'));
    return (
        <li className="spot-media__video">
            {playing ? <VideoPlayer video={video} /> : (
                <button type="button" className="spot-media__thumb" onClick={play} aria-label={`${video.title} 영상 보기`}>
                    {video.thumbnailUrl && <img src={video.thumbnailUrl} alt="" loading="lazy" referrerPolicy="no-referrer" />}
                    <span className="spot-media__play" aria-hidden="true">▶</span>
                    {video.durationSeconds != null && <span className="spot-media__duration">{formatDuration(video.durationSeconds)}</span>}
                </button>
            )}
            <ExternalLink href={video.url} className="spot-media__title">{video.pinned && <span className="spot-media__pin">추천</span>}{video.title}</ExternalLink>
            {video.author && <span className="spot-media__author">{video.author}</span>}
        </li>
    );
};

const BlogCard = ({ blog }) => (
    <li>
        <ExternalLink href={blog.url} className="spot-media__blog">
            <strong>{blog.pinned && <span className="spot-media__pin">추천</span>}{blog.title}</strong>
            {blog.snippet && <p>{blog.snippet}</p>}
            <span>{[blog.author, blog.publishedAt].filter(Boolean).join(' · ')}</span>
        </ExternalLink>
    </li>
);

const MediaLists = ({ media, spotName }) => (
    <>
        {media.videos.length > 0 && <h3>영상으로 미리 보기</h3>}
        {media.videos.length > 0 && <ul className="spot-media__videos">{media.videos.map((video) => <VideoCard key={video.url} video={video} />)}</ul>}
        {media.blogs.length > 0 && <h3>여행자 후기</h3>}
        {media.blogs.length > 0 && <ul className="spot-media__blogs">{media.blogs.map((blog) => <BlogCard key={blog.url} blog={blog} />)}</ul>}
        {media.instagramUrl && <ExternalLink href={media.instagramUrl} className="spot-media__instagram">인스타그램에서 {hashtagOf(spotName)} 보기</ExternalLink>}
        <p className="spot-media__source">검색 결과: {media.source} · 제목을 누르면 원문이 새 창으로 열려요</p>
    </>
);

// 장소 상세: 다른 여행자의 영상·블로그 후기로 미리 보기 (검색 결과라 내용은 각 원작자의 것)
const SpotMedia = ({ spotId, spotName }) => {
    const [media, setMedia] = useState(null);
    useEffect(() => {
        let cancelled = false;
        setMedia(null);
        fetchSpotMedia(spotId).then((data) => { if (!cancelled) setMedia(data); }).catch(() => { if (!cancelled) setMedia(false); });
        return () => { cancelled = true; };
    }, [spotId]);
    if (media === false) return null;
    return (
        <section className="spot-media" aria-label="영상과 후기">
            {media === null ? <p className="spot-media__loading">영상과 후기를 불러오는 중…</p> : <MediaLists media={media} spotName={spotName} />}
        </section>
    );
};

export default SpotMedia;
