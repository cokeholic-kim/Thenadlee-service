import React from 'react';
import { Link, useParams } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import usePageMeta from '../seo/usePageMeta';
import { CATEGORY_NAMES, CITY_NAMES, spotCategoryPageMeta } from '../seo/pageMeta';
import { categoryIcon, countCategories, SPOT_CATEGORIES } from '../community/spotCategories';
import SpotThumbPlaceholder from '../community/SpotThumbPlaceholder';
import { spotTagList } from '../community/spotTags';
import useCategorySpots from './useCategorySpots';
import './SpotCategory.scss';

const DESCRIPTION_LENGTH = 120;

const shorten = (text) => {
    const clean = String(text || '').replace(/\s+/g, ' ').trim();
    return clean.length > DESCRIPTION_LENGTH ? `${clean.slice(0, DESCRIPTION_LENGTH)}…` : clean;
};

const SpotCard = ({ spot }) => (
    <li className="spot-category-card">
        <div className="spot-category-card__thumb">
            {spot.imageUrl ? <img src={spot.imageUrl} alt={spot.spotName} loading="lazy" referrerPolicy="no-referrer" /> : <SpotThumbPlaceholder category={spot.category} />}
        </div>
        <div className="spot-category-card__body">
            <h2>{spot.spotName}</h2>
            {spot.tags?.length > 0 && <span className="spot-category-card__tags">{spotTagList(spot.tags).map((tag) => `${tag.icon} ${tag.label}`).join(' · ')}</span>}
            {spot.description && <p>{shorten(spot.description)}</p>}
            <span className="spot-category-card__meta">
                {spot.source === 'USER' ? `여행자 추천${spot.authorNickName ? ` · ${spot.authorNickName}님` : ''}` : '운영진 추천'}
                {spot.credit && ` · 자료: ${spot.credit}`}
                {spot.imageCredit && ` · 사진: ${spot.imageCredit}`}
            </span>
        </div>
    </li>
);

// 같은 여행지의 다른 종류 (장소가 있는 종류만)
const CategoryLinks = ({ cityName, spots, current }) => (
    <nav className="spot-category-links" aria-label="다른 종류">
        {countCategories(spots).map((option) => (
            <Link key={option.value} to={`/spots/${cityName}/${option.value.toLowerCase()}`} className={option.value === current ? 'is-active' : ''}>
                {option.icon} {option.label} {option.count}
            </Link>
        ))}
    </nav>
);

// 같은 종류의 다른 여행지
const CityLinks = ({ cities, cityName, slug }) => (
    <nav className="spot-category-cities" aria-label="다른 여행지">
        <h2>다른 여행지 {CATEGORY_NAMES[slug]}</h2>
        {cities.filter((city) => city.name !== cityName).map((city) => (
            <Link key={city.name} to={`/spots/${city.name}/${slug}`}>{CITY_NAMES[city.name] || city.displayName || city.name}</Link>
        ))}
    </nav>
);

const PageBody = ({ cityName, slug, value, data, list }) => (
    <>
        <h1>{categoryIcon(value)} {spotCategoryPageMeta(cityName, slug, list.length).title}</h1>
        <p className="spot-category-page__intro">{data.city.description ? shorten(data.city.description) : ''}</p>
        <Link className="spot-category-page__cta" to={`/map/${cityName}?category=${value}`}>지도에 담아 일정 만들기</Link>
        <CategoryLinks cityName={cityName} spots={data.spots} current={value} />
        {list.length === 0 && <p className="spot-category-page__message">아직 이 종류의 추천 장소가 없어요.</p>}
        <ul className="spot-category-grid">{list.map((spot) => <SpotCard key={spot.id} spot={spot} />)}</ul>
        <CityLinks cities={data.cities} cityName={cityName} slug={slug} />
    </>
);

const isCategory = (value) => SPOT_CATEGORIES.some((option) => option.value === value);

// 여행지별 장소 종류 페이지 (/spots/도시/종류): 검색으로 들어온 사람이 바로 지도에서 일정을 만들도록
const SpotCategoryPage = () => {
    const { city: cityName, category } = useParams();
    const value = String(category || '').toUpperCase();
    const slug = value.toLowerCase();
    const data = useCategorySpots(cityName);
    const list = data.spots.filter((spot) => spot.category === value);
    const found = isCategory(value) && data.city;
    usePageMeta(found ? spotCategoryPageMeta(cityName, slug, list.length) : { title: '페이지를 찾을 수 없습니다', noindex: true });
    return (
        <PageLayout>
            <div className="spot-category-page">
                {data.loading && <p className="spot-category-page__message">불러오는 중…</p>}
                {!data.loading && !found && <div className="spot-category-page__message"><p>찾을 수 없는 페이지예요.</p><Link to="/">여행지 고르러 가기</Link></div>}
                {!data.loading && found && <PageBody cityName={cityName} slug={slug} value={value} data={data} list={list} />}
            </div>
        </PageLayout>
    );
};

export default SpotCategoryPage;
