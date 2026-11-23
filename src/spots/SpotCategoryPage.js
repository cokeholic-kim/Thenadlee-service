import React from 'react';
import { Link, useParams } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import usePageMeta from '../seo/usePageMeta';
import { CITY_NAMES, spotCategoryPageMeta } from '../seo/pageMeta';
import { PAGE_KINDS, resolveSpotPage, spotPageOptions } from './spotPageKind';
import SpotThumbPlaceholder from '../community/SpotThumbPlaceholder';
import { tagText } from '../community/spotTags';
import { editorCreditText, editorPath } from '../editor/editorPaths';
import '../editor/Editor.scss';
import useCategorySpots from './useCategorySpots';
import './SpotCategory.scss';

const DESCRIPTION_LENGTH = 120;

const shorten = (text) => {
    const clean = String(text || '').replace(/\s+/g, ' ').trim();
    return clean.length > DESCRIPTION_LENGTH ? `${clean.slice(0, DESCRIPTION_LENGTH)}…` : clean;
};

// 출처: 여행자 추천(닉네임) / 에디터 ○○ 추천(공개 프로필 링크) / 운영진 추천
const SpotSource = ({ spot }) => {
    if (spot.source === 'USER') return `여행자 추천${spot.authorNickName ? ` · ${spot.authorNickName}님` : ''}`;
    if (spot.editor) return <Link className="editor-credit" to={editorPath(spot.editor.id)}>{editorCreditText(spot.editor)} 추천</Link>;
    return '운영진 추천';
};

const SpotCard = ({ spot }) => (
    <li className="spot-category-card">
        <div className="spot-category-card__thumb">
            {spot.imageUrl ? <img src={spot.imageUrl} alt={spot.spotName} loading="lazy" referrerPolicy="no-referrer" /> : <SpotThumbPlaceholder category={spot.category} />}
        </div>
        <div className="spot-category-card__body">
            <h2>{spot.spotName}</h2>
            {spot.tags?.length > 0 && <span className="spot-category-card__tags">{spot.tags.map(tagText).join(' ')}</span>}
            {spot.description && <p>{shorten(spot.description)}</p>}
            <span className="spot-category-card__meta">
                <SpotSource spot={spot} />
                {spot.credit && ` · 자료: ${spot.credit}`}
                {spot.imageCredit && ` · 사진: ${spot.imageCredit}`}
            </span>
        </div>
    </li>
);

// 같은 여행지의 다른 종류·해시태그 (장소가 있는 것만, 종류 줄과 태그 줄을 나눔)
const PageLinks = ({ cityName, spots, current }) => {
    const options = spotPageOptions(spots);
    return [PAGE_KINDS.CATEGORY, PAGE_KINDS.TAG].map((kind) => {
        const row = options.filter((option) => option.kind === kind);
        return row.length === 0 ? null : (
            <nav key={kind} className="spot-category-links" aria-label={kind === PAGE_KINDS.TAG ? '해시태그별 추천' : '종류별 추천'}>
                {row.map((option) => (
                    <Link key={option.value} to={`/spots/${cityName}/${option.slug}`} className={option.value === current ? 'is-active' : ''}>
                        {option.icon} {option.label} {option.count}
                    </Link>
                ))}
            </nav>
        );
    });
};

// 같은 종류·태그의 다른 여행지
const CityLinks = ({ cities, cityName, slug, name }) => (
    <nav className="spot-category-cities" aria-label="다른 여행지">
        <h2>다른 여행지 {name}</h2>
        {cities.filter((city) => city.name !== cityName).map((city) => (
            <Link key={city.name} to={`/spots/${city.name}/${slug}`}>{CITY_NAMES[city.name] || city.displayName || city.name}</Link>
        ))}
    </nav>
);

const PageBody = ({ cityName, page, data, list }) => (
    <>
        <h1>{page.icon} {spotCategoryPageMeta(cityName, page.slug, list.length, page.name).title}</h1>
        <p className="spot-category-page__intro">{data.city.description ? shorten(data.city.description) : ''}</p>
        <Link className="spot-category-page__cta" to={`/map/${cityName}?${page.mapQuery}`}>지도에 담아 일정 만들기</Link>
        <PageLinks cityName={cityName} spots={data.spots} current={page.value} />
        {list.length === 0 && <p className="spot-category-page__message">아직 이곳에 맞는 추천 장소가 없어요.</p>}
        <ul className="spot-category-grid">{list.map((spot) => <SpotCard key={spot.id} spot={spot} />)}</ul>
        <CityLinks cities={data.cities} cityName={cityName} slug={page.slug} name={page.name} />
    </>
);

// 여행지별 장소 종류·해시태그 페이지 (/spots/도시/종류 또는 태그 주소 이름): 검색으로 들어온 사람이 바로 지도에서 일정을 만들도록
const SpotCategoryPage = () => {
    const { city: cityName, category } = useParams();
    const data = useCategorySpots(cityName);
    const page = resolveSpotPage(category, data.spots);
    const list = page ? data.spots.filter(page.matches) : [];
    const found = Boolean(page && data.city);
    usePageMeta(found ? spotCategoryPageMeta(cityName, page.slug, list.length, page.name) : { title: '페이지를 찾을 수 없습니다', noindex: true });
    return (
        <PageLayout>
            <div className="spot-category-page">
                {data.loading && <p className="spot-category-page__message">불러오는 중…</p>}
                {!data.loading && !found && <div className="spot-category-page__message"><p>찾을 수 없는 페이지예요.</p><Link to="/">여행지 고르러 가기</Link></div>}
                {!data.loading && found && <PageBody cityName={cityName} page={page} data={data} list={list} />}
            </div>
        </PageLayout>
    );
};

export default SpotCategoryPage;
