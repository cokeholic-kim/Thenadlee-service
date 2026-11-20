import React, { useState } from 'react';
import './SocialLinks.scss';

const PROVIDER_LABELS = { YOUTUBE: '유튜브', INSTAGRAM: '인스타그램', TIKTOK: '틱톡', BLOG: '블로그' };
// 누를 때만 불러오는 플레이어 (그 전에는 외부 서비스로 접속 정보가 가지 않음)
const EMBED_URLS = {
    YOUTUBE: (id) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`,
    TIKTOK: (id) => `https://www.tiktok.com/embed/v2/${id}`,
};

export const providerLabel = (provider) => PROVIDER_LABELS[provider] || '링크';

const Player = ({ link }) => (
    <div className={`social-links__player is-${link.provider.toLowerCase()}`}>
        <iframe src={EMBED_URLS[link.provider](link.embedId)} title={`${providerLabel(link.provider)} 영상`}
            allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
    </div>
);

// 유튜브·틱톡 영상은 그 자리에서 재생, 인스타그램·블로그는 원문을 새 창으로
const LinkCard = ({ link }) => {
    const [playing, setPlaying] = useState(false);
    const playable = Boolean(link.embedId && EMBED_URLS[link.provider]);
    if (playing) return <li><Player link={link} /></li>;
    return (
        <li className="social-links__item">
            <span className={`social-links__badge is-${link.provider.toLowerCase()}`}>{providerLabel(link.provider)}</span>
            <a href={link.url} target="_blank" rel="noopener noreferrer ugc">{link.url.replace(/^https:\/\/(www\.)?/, '')}</a>
            {playable && <button type="button" onClick={() => setPlaying(true)}>▶ 여기서 보기</button>}
        </li>
    );
};

// 작성자가 직접 붙인 자기 SNS 게시물 (일정·장소를 볼 수 있는 사람에게만 서버가 함께 보내 줌)
const SocialLinks = ({ title, links }) => {
    if (!links?.length) return null;
    return (
        <section className="social-links" aria-label={title}>
            <h3>{title}</h3>
            <ul>{links.map((link) => <LinkCard key={link.id} link={link} />)}</ul>
        </section>
    );
};

export default SocialLinks;
