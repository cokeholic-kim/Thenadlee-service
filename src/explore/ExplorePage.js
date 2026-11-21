import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import { fetchExplore } from '../api/communityApi';
import { fetchCities } from '../api/cityApi';
import { getApiErrorMessage } from '../util/apiError';
import { toastError } from '../ui/feedback';
import usePageMeta from '../seo/usePageMeta';
import { PAGE_META } from '../seo/pageMeta';
import SpotThumbPlaceholder from '../community/SpotThumbPlaceholder';
import './Explore.scss';

const DAY_OPTIONS = [{ value: '', label: '전체' }, { value: '1', label: '당일' }, { value: '2-3', label: '2~3일' }, { value: '4+', label: '4일 이상' }];
const SORT_OPTIONS = [{ value: 'popular', label: '인기순' }, { value: 'recent', label: '최신순' }];

const ExploreCard = ({ item }) => (
    <li className="explore-card">
        <Link to={`/itinerary/${item.id}`}>
            <div className="explore-card__thumb">
                {item.thumbnailUrl ? <img src={item.thumbnailUrl} alt="" loading="lazy" referrerPolicy="no-referrer" /> : <SpotThumbPlaceholder />}
                <div className="explore-card__badges">
                    {item.isFeatured && <span className="is-featured">운영진 추천</span>}
                    {item.hasVideo && <span className="is-video">▶ 영상</span>}
                </div>
            </div>
            <div className="explore-card__body">
                <strong>{item.title}</strong>
                <span className="explore-card__meta">{item.cityDisplayName} · {item.dayCount}일 · {item.spotCount}곳</span>
                <span className="explore-card__author">{item.authorNickName}님</span>
                <span className="explore-card__stats" aria-label={`좋아요 ${item.likeCount}, 댓글 ${item.commentCount}, 가져간 수 ${item.copyCount}`}>
                    ♥ {item.likeCount} · 💬 {item.commentCount}{item.copyCount > 0 && ` · ${item.copyCount}명이 가져감`}
                </span>
            </div>
        </Link>
    </li>
);

const ChipGroup = ({ label, options, value, onChange }) => (
    <div className="explore-chips" role="group" aria-label={label}>
        {options.map((option) => (
            <button key={option.value || 'all'} type="button" className={value === option.value ? 'is-active' : ''} aria-pressed={value === option.value}
                onClick={() => onChange(option.value)}>{option.label}</button>
        ))}
    </div>
);

const Filters = ({ cities, filters, onChange }) => (
    <div className="explore-filters">
        <select value={filters.city} onChange={(e) => onChange({ city: e.target.value })} aria-label="여행지">
            <option value="">모든 여행지</option>
            {cities.map((city) => <option key={city.name} value={city.name}>{city.displayName}</option>)}
        </select>
        <ChipGroup label="일수" options={DAY_OPTIONS} value={filters.days} onChange={(days) => onChange({ days })} />
        <ChipGroup label="정렬" options={SORT_OPTIONS} value={filters.sort} onChange={(sort) => onChange({ sort })} />
    </div>
);

// 주소의 ?city=&days=&sort= 를 거르기 조건으로 (공유·뒤로 가기에도 같은 결과)
const useExploreFilters = () => {
    const [params, setParams] = useSearchParams();
    const filters = { city: params.get('city') || '', days: params.get('days') || '', sort: params.get('sort') || 'popular' };
    const change = (next) => {
        const merged = { ...filters, ...next };
        setParams(Object.fromEntries(Object.entries(merged).filter(([key, value]) => value && !(key === 'sort' && value === 'popular'))), { replace: true });
    };
    return [filters, change];
};

const useExploreList = (filters) => {
    const [state, setState] = useState({ items: null, page: 1, hasMore: false, loading: false });
    const load = useCallback(async (page) => {
        setState((current) => ({ ...current, loading: true }));
        try {
            const result = await fetchExplore({ ...filters, page });
            setState((current) => ({ items: page === 1 ? result.items : [...(current.items || []), ...result.items], page, hasMore: result.hasMore, loading: false }));
        } catch (error) {
            toastError(getApiErrorMessage(error));
            setState((current) => ({ ...current, items: current.items || [], loading: false }));
        }
    }, [filters.city, filters.days, filters.sort]); // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => { load(1); }, [load]);
    return { ...state, more: () => load(state.page + 1) };
};

// 공개 일정 둘러보기 (/explore): 모든 여행지의 공개 일정을 인기순·최신순으로
const ExplorePage = () => {
    usePageMeta(PAGE_META.explore);
    const [cities, setCities] = useState([]);
    const [filters, changeFilters] = useExploreFilters();
    const list = useExploreList(filters);
    useEffect(() => { fetchCities().then(setCities).catch(() => setCities([])); }, []);
    return (
        <PageLayout>
            <div className="explore-page">
                <h1>여행자 일정 둘러보기</h1>
                <p className="explore-page__intro">다른 여행자가 공개한 일정을 보고, 마음에 들면 "이 일정으로 시작하기"로 가져가 고쳐 써 보세요.</p>
                <Filters cities={cities} filters={filters} onChange={changeFilters} />
                {list.items === null && <p className="explore-page__message">불러오는 중…</p>}
                {list.items?.length === 0 && (
                    <div className="explore-page__empty"><p>조건에 맞는 공개 일정이 아직 없어요.</p><Link to="/itineraries">내 일정 공개하러 가기</Link></div>
                )}
                {list.items?.length > 0 && <ul className="explore-grid">{list.items.map((item) => <ExploreCard key={item.id} item={item} />)}</ul>}
                {list.hasMore && <button type="button" className="explore-more" disabled={list.loading} onClick={list.more}>{list.loading ? '불러오는 중…' : '더 보기'}</button>}
            </div>
        </PageLayout>
    );
};

export default ExplorePage;
