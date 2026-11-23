import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import { fetchEditor } from '../api/editorApi';
import usePageMeta from '../seo/usePageMeta';
import { PAGE_META, editorPageMeta } from '../seo/pageMeta';
import { providerLabel } from '../community/SocialLinks';
import { categoryIcon, categoryLabel } from '../community/spotCategories';
import SpotThumbPlaceholder from '../community/SpotThumbPlaceholder';
import EditorStats from './EditorStats';
import { EDITORS_PATH } from './editorPaths';
import './Editor.scss';

const mapPath = (cityName) => `/map/${encodeURIComponent(cityName)}`;

const EditorLinks = ({ links }) => links.length > 0 && (
    <ul className="editor-links">
        {links.map((link) => (
            <li key={link.url}><a href={link.url} target="_blank" rel="noopener noreferrer"><span>{providerLabel(link.provider)}</span>{link.url.replace(/^https:\/\/(www\.)?/, '')}</a></li>
        ))}
    </ul>
);

const SpotGrid = ({ spots }) => (
    <ul className="editor-spots">
        {spots.map((spot) => (
            <li key={spot.id}>
                <Link to={mapPath(spot.cityName)}>
                    <span className="editor-spots__thumb">
                        {spot.imageUrl ? <img src={spot.imageUrl} alt="" loading="lazy" referrerPolicy="no-referrer" /> : <SpotThumbPlaceholder category={spot.category} />}
                    </span>
                    <strong>{spot.name}</strong>
                    <span>{spot.cityDisplayName}{spot.category && ` · ${categoryIcon(spot.category)} ${categoryLabel(spot.category)}`}</span>
                </Link>
            </li>
        ))}
    </ul>
);

const ItineraryList = ({ itineraries }) => (
    <ul className="editor-itineraries">
        {itineraries.map((item) => (
            <li key={item.id}><Link to={`/itinerary/${item.id}`}><strong>{item.title}</strong><span>{item.cityDisplayName} · {item.dayCount}일 · ♥ {item.likeCount}</span></Link></li>
        ))}
    </ul>
);

const ProfileBody = ({ editor }) => (
    <>
        <header className="editor-profile__head">
            <span className="editor-card__avatar" aria-hidden="true">{editor.nickName.slice(0, 1)}</span>
            <div>
                <h1>에디터 {editor.nickName}</h1>
                {editor.cities.length > 0 && <p className="editor-profile__cities">{editor.cities.map((city) => <Link key={city.id} to={mapPath(city.name)}>{city.displayName}</Link>)}</p>}
            </div>
        </header>
        {editor.intro && <p className="editor-profile__intro">{editor.intro}</p>}
        <EditorLinks links={editor.links} />
        <EditorStats stats={editor.stats} />
        {editor.spots.length > 0 && <section><h2>소개한 장소</h2><SpotGrid spots={editor.spots} /></section>}
        {editor.itineraries.length > 0 && <section><h2>공개 일정</h2><ItineraryList itineraries={editor.itineraries} /></section>}
        <p className="editor-page__recruit"><Link to={EDITORS_PATH}>다른 에디터 보기</Link></p>
    </>
);

// 에디터 공개 프로필 (/editors/:id): 공개를 켠 에디터만, 없으면 찾을 수 없음
const EditorProfilePage = () => {
    const { id } = useParams();
    const [editor, setEditor] = useState(undefined);
    useEffect(() => { setEditor(undefined); fetchEditor(id).then(setEditor).catch(() => setEditor(null)); }, [id]);
    usePageMeta(editor ? editorPageMeta(editor, id) : editor === null ? PAGE_META.notFound : {});
    return (
        <PageLayout>
            <div className="editor-page editor-profile">
                {editor === undefined && <p>불러오는 중…</p>}
                {editor === null && <p className="editor-page__empty">에디터를 찾을 수 없어요. <Link to={EDITORS_PATH}>에디터 소개</Link>에서 찾아보세요.</p>}
                {editor && <ProfileBody editor={editor} />}
            </div>
        </PageLayout>
    );
};

export default EditorProfilePage;
