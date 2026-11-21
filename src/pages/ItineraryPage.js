import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { addItineraryLink, fetchItinerary, removeItineraryLink } from '../api/itineraryApi';
import SocialLinks from '../community/SocialLinks';
import LinkManager from '../community/LinkManager';
import PageLayout from '../components/PageLayout';
import usePageMeta from '../seo/usePageMeta';
import { CITY_NAMES } from '../seo/pageMeta';
import { findTravelMode } from '../route/travelModes';
import AdSenseUnit from '../marketing/AdSenseUnit';
import { ADSENSE_SLOTS } from '../config/ads';
import ItineraryMap from './ItineraryMap';
import CalendarExportButton from '../itinerary/CalendarExportButton';
import ItineraryShare from './ItineraryShare';
import ItineraryReactions from './ItineraryReactions';
import { trackEvent } from '../analytics/analytics';
import { toggleItineraryVisibility } from '../itinerary/visibilityToggle';
import './ItineraryPage.scss';

const SpotCard = ({ item, order }) => (
    <li className="itinerary-page__spot">
        {item.imageUrl ? <img src={item.imageUrl} alt={item.spotName} loading="lazy" referrerPolicy="no-referrer" /> : <div className="itinerary-page__noimg" aria-hidden="true">📍</div>}
        <div>
            <strong>{order}. {item.spotName}</strong>
            {item.memo && <p>{item.memo}</p>}
        </div>
    </li>
);

// 작성자의 영상·SNS (누구나 보기), 작성자 본인에게는 링크 관리 상자
const ItineraryLinks = ({ itinerary }) => {
    const [links, setLinks] = useState(itinerary.links || []);
    return (
        <>
            <SocialLinks title="작성자의 영상·SNS" links={links} />
            {itinerary.isOwner && <LinkManager links={links} onChange={setLinks} hint="이 일정으로 다녀온 영상이나 게시물이 있나요? 붙이면 추천 일정에서 '영상' 표시와 함께 위쪽에 보여요."
                onAdd={(url) => addItineraryLink(itinerary.id, url)} onRemove={(linkId) => removeItineraryLink(itinerary.id, linkId)} />}
        </>
    );
};

// 작성자에게만: 공개 상태와 공개·비공개 전환
const OwnerBar = ({ itinerary, onVisibility }) => {
    if (!itinerary.isOwner) return null;
    const isPublic = itinerary.visibility === 'PUBLIC';
    const toggle = async () => { const visibility = await toggleItineraryVisibility(itinerary); if (visibility) onVisibility(visibility); };
    return (
        <div className="itinerary-owner-bar">
            <span>내 일정 · <strong className={isPublic ? 'is-public' : ''}>{isPublic ? '공개 중' : '나만 보기'}</strong></span>
            <button type="button" onClick={toggle}>{isPublic ? '비공개로 바꾸기' : '공개하기'}</button>
        </div>
    );
};

const ItineraryBody = ({ itinerary, onVisibility }) => {
    const cityName = CITY_NAMES[itinerary.cityName] || itinerary.cityName;
    return (
        <article className="itinerary-page">
            <p className="itinerary-page__place">📍 {cityName} · {itinerary.dayCount}일 · {findTravelMode(itinerary.travelMode).label}</p>
            <h1>{itinerary.title}</h1>
            <p className="itinerary-page__author">{itinerary.authorNickName}님의 일정</p>
            <OwnerBar itinerary={itinerary} onVisibility={onVisibility} />
            <ItineraryShare itinerary={itinerary} title={itinerary.title} description={`${itinerary.authorNickName}님의 ${cityName} ${itinerary.dayCount}일 여행 일정`} />
            {itinerary.description && <p className="itinerary-page__description">{itinerary.description}</p>}
            <ItineraryMap itinerary={itinerary} />
            <CalendarExportButton itinerary={itinerary} />
            <ItineraryLinks itinerary={itinerary} />
            {itinerary.days.map((day) => (
                <section key={day.dayNo}>
                    <h2>{day.dayNo}일차</h2>
                    <ol>{day.items.map((item, index) => <SpotCard key={item.spotId} item={item} order={index + 1} />)}</ol>
                </section>
            ))}
            <ItineraryReactions key={itinerary.visibility} itineraryId={itinerary.id} />
            {itinerary.copyCount > 0 && <p className="itinerary-page__copies">{itinerary.copyCount}명이 이 일정으로 시작했어요</p>}
            <div className="itinerary-page__actions">
                {/* 남의 일정은 불러와 고쳐서 내 일정으로 저장, 내 일정은 그대로 열기 */}
                <Link className="itinerary-page__primary" to={`/map/${itinerary.cityName}?itinerary=${itinerary.id}`}
                    onClick={() => { if (!itinerary.isOwner) trackEvent('start_from_itinerary'); }}>{itinerary.isOwner ? '지도에서 열기' : '이 일정으로 시작하기'}</Link>
                <Link to={`/map/${itinerary.cityName}`}>{cityName} 여행 일정 직접 만들기</Link>
            </div>
        </article>
    );
};

// 공개 일정 페이지 (/itinerary/:id): 공개·숨김 아닌 일정만 보임 (서버 API 가 확인), 그 외는 "찾을 수 없음"
const ItineraryPage = () => {
    const { id } = useParams();
    const [state, setState] = useState({ itinerary: null, failed: false });
    useEffect(() => {
        fetchItinerary(id).then((itinerary) => setState({ itinerary, failed: false })).catch(() => setState({ itinerary: null, failed: true }));
    }, [id]);
    const { itinerary, failed } = state;
    const cityName = itinerary ? CITY_NAMES[itinerary.cityName] || itinerary.cityName : '';
    usePageMeta(itinerary
        ? { title: `${itinerary.title} - ${cityName} ${itinerary.dayCount}일 여행 일정`, description: `${itinerary.authorNickName}님의 ${cityName} ${itinerary.dayCount}일 여행 일정`, path: `/itinerary/${id}`, noindex: itinerary.visibility !== 'PUBLIC' }
        : { title: failed ? '페이지를 찾을 수 없습니다' : '여행 일정', path: `/itinerary/${id}`, noindex: failed });
    return (
        <PageLayout>
            {!itinerary && !failed && <p className="itinerary-page__message">불러오는 중…</p>}
            {failed && <article className="itinerary-page"><h1>일정을 찾을 수 없습니다</h1><p>비공개로 바뀌었거나 삭제된 일정입니다.</p><Link to="/">메인으로 돌아가기</Link></article>}
            {itinerary && <ItineraryBody itinerary={itinerary} onVisibility={(visibility) => setState({ itinerary: { ...itinerary, visibility }, failed: false })} />}
            {itinerary && <AdSenseUnit slot={ADSENSE_SLOTS.itinerary} />}
        </PageLayout>
    );
};

export default ItineraryPage;
