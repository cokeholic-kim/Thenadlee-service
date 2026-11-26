import React from 'react';
import { Link, useParams } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import usePageMeta from '../seo/usePageMeta';
import { CITY_NAMES, PAGE_META, guidePageMeta } from '../seo/pageMeta';
import { VideoCard } from '../community/SpotMedia';
import SpotThumbPlaceholder from '../community/SpotThumbPlaceholder';
import { categoryLabel } from '../community/spotCategories';
import { spotPageLinks } from '../spots/categoryLinks';
import { trackEvent } from '../analytics/analytics';
import { useCityGuide, useFestivalVideos } from './useCityGuide';
import { MONTHS, guideMonths, guidePath, parseMonth } from './guidePaths';
import '../community/SpotMedia.scss';
import './CityGuide.scss';

// 보여 줄 장소·일정 수 (사진 있는 장소 먼저)
const SPOT_COUNT = 8;
const ITINERARY_COUNT = 4;

const pickSpots = (spots) => [...spots].sort((a, b) => Number(Boolean(b.imageUrl)) - Number(Boolean(a.imageUrl))).slice(0, SPOT_COUNT);

const MonthNav = ({ cityName, month, available }) => (
    <nav className="city-guide__months" aria-label="다른 달 여행 가이드">
        {MONTHS.map((value) => (available.includes(value)
            ? <Link key={value} to={guidePath(cityName, value)} className={value === month ? 'is-active' : ''} aria-current={value === month ? 'page' : undefined}>{value}월</Link>
            : <span key={value} className="is-empty">{value}월</span>))}
    </nav>
);

const FestivalSection = ({ label, month, videos }) => (videos.length === 0 ? null : (
    <section className="city-guide__section">
        <h2>{label} {month}월 축제·행사 영상</h2>
        <ul className="spot-media__videos">{videos.map((video) => <VideoCard key={video.url} video={video} />)}</ul>
        <p className="city-guide__note">검색 결과라 내용은 각 원작자의 것이에요. 유튜브는 누를 때만 재생돼요.</p>
    </section>
));

const ThemeLinks = ({ cityName, spots }) => {
    const links = spotPageLinks(cityName, spots);
    return links.length === 0 ? null : (
        <nav className="city-guide__themes" aria-label="테마별 추천">
            {links.map((link) => <Link key={link.value} to={link.path}>{link.icon} {link.name}</Link>)}
        </nav>
    );
};

const SpotSection = ({ label, cityName, spots }) => (spots.length === 0 ? null : (
    <section className="city-guide__section">
        <h2>{label} 추천 장소</h2>
        <ThemeLinks cityName={cityName} spots={spots} />
        <ul className="city-guide__spots">{pickSpots(spots).map((spot) => (
            <li key={spot.id}>
                <span className="city-guide__thumb">{spot.imageUrl ? <img src={spot.imageUrl} alt="" loading="lazy" referrerPolicy="no-referrer" /> : <SpotThumbPlaceholder category={spot.category} />}</span>
                <strong>{spot.spotName}</strong>
                {spot.category && <span>{categoryLabel(spot.category)}</span>}
            </li>
        ))}</ul>
    </section>
));

const ItinerarySection = ({ label, itineraries }) => (itineraries.length === 0 ? null : (
    <section className="city-guide__section">
        <h2>여행자들의 {label} 일정</h2>
        <ul className="city-guide__plans">{itineraries.slice(0, ITINERARY_COUNT).map((plan) => (
            <li key={plan.id}><Link to={`/itinerary/${plan.id}`}><strong>{plan.title}</strong><span>{plan.dayCount}일 · {plan.spotCount}곳 · ♥ {plan.likeCount}</span></Link></li>
        ))}</ul>
    </section>
));

const GuideBody = ({ cityName, month, guide, info }) => {
    const label = CITY_NAMES[cityName] || cityName;
    const festivalVideos = useFestivalVideos(cityName, month, true);
    return (
        <>
            <p className="city-guide__eyebrow">{label} 여행 가이드</p>
            <h1>{label} {month}월 여행</h1>
            <MonthNav cityName={cityName} month={month} available={guideMonths(guide.months)} />
            <section className="city-guide__info"><h2>{month}월 날씨·옷차림·축제</h2><p>{info.description}</p></section>
            <Link className="city-guide__cta" to={`/map/${encodeURIComponent(cityName)}`} onClick={() => trackEvent('guide_cta', { city: cityName, month })}>{label} {month}월 일정 만들기 →</Link>
            <FestivalSection label={label} month={month} videos={festivalVideos} />
            <SpotSection label={label} cityName={cityName} spots={guide.spots} />
            <ItinerarySection label={label} itineraries={guide.itineraries} />
        </>
    );
};

// 서버가 "없음"이라고 했거나 그달 정보가 없으면 찾을 수 없음(noindex), 불러오는 중·실패는 미리 만든 페이지 설정 유지
const guideMeta = (guide, cityName, month, info) => {
    if (guide.loading || guide.failed) return null;
    return info ? guidePageMeta(cityName, month, info.description) : PAGE_META.notFound;
};

// 월별 여행 가이드 (/guide/여행지/월): 그달 여행 정보 + 축제 영상 + 추천 장소 + 여행자 일정 → 지도에서 일정 만들기
const CityGuidePage = () => {
    const { city: cityName, month: monthText } = useParams();
    const month = parseMonth(monthText);
    const guide = useCityGuide(cityName);
    const info = month && guide.months.find((item) => item.month === month && String(item.description || '').trim());
    usePageMeta(guideMeta(guide, cityName, month, info));
    return (
        <PageLayout>
            <div className="city-guide">
                {guide.loading && <p className="city-guide__message">불러오는 중…</p>}
                {guide.failed && <p className="city-guide__message">여행 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</p>}
                {!guide.loading && !guide.failed && !info && <div className="city-guide__message"><p>준비된 여행 가이드가 없어요.</p><Link to="/">여행지 고르러 가기</Link></div>}
                {info && <GuideBody cityName={cityName} month={month} guide={guide} info={info} />}
            </div>
        </PageLayout>
    );
};

export default CityGuidePage;
