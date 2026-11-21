import React, { useState } from 'react';
import { adminApi } from '../api/adminApi';
import { getApiErrorMessage } from '../util/apiError';
import { categoryLabel } from '../community/spotCategories';
import { toastError } from '../ui/feedback';

// TourAPI 관광정보 종류 (contentTypeId)
const CONTENT_TYPES = [
    { value: '12', label: '관광지' },
    { value: '14', label: '문화시설' },
    { value: '28', label: '레포츠' },
    { value: '38', label: '쇼핑' },
    { value: '39', label: '음식점' },
    { value: '15', label: '축제·행사' },
    { value: '', label: '전체' },
];

const useTourSearch = (cityId) => {
    const [state, setState] = useState({ items: null, page: 1, hasMore: false, totalCount: 0 });
    const [loading, setLoading] = useState(false);
    const search = async (params, page = 1) => {
        setLoading(true);
        try {
            const result = await adminApi.searchTour(cityId, { ...params, page });
            setState((current) => ({ ...result, items: page === 1 ? result.items : [...current.items, ...result.items] }));
        } catch (error) {
            toastError(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };
    const markAdded = (contentId) => setState((current) => ({
        ...current, items: current.items.map((item) => (item.contentId === contentId ? { ...item, alreadyAdded: true } : item)),
    }));
    return { ...state, loading, search, markAdded };
};

const TourRow = ({ item, onImport }) => (
    <li className="admin-list__item">
        {item.imageUrl ? <img src={item.imageUrl} alt="" loading="lazy" /> : <div className="admin-list__noimg" />}
        <div className="admin-list__text"><strong>{item.title}</strong><span>{item.address || `${item.lat}, ${item.lng}`}</span>
            <span className={`admin-category${item.category ? '' : ' is-empty'}`}>{categoryLabel(item.category) || '종류 미분류'}</span></div>
        <button type="button" className="admin-button is-primary" disabled={item.alreadyAdded} onClick={() => onImport(item)}>
            {item.alreadyAdded ? '추가됨' : '추천 장소로 추가'}
        </button>
    </li>
);

// 관리자: 한국관광공사 자료를 검색해 국내 여행지의 운영진 추천 장소로 불러오기
const TourImportPanel = ({ cityId, onImported }) => {
    const [form, setForm] = useState({ keyword: '', contentTypeId: '12' });
    const tour = useTourSearch(cityId);
    const onImport = async (item) => {
        try {
            await adminApi.importTour(cityId, item.contentId);
            tour.markAdded(item.contentId);
            onImported();
        } catch (error) {
            toastError(getApiErrorMessage(error));
        }
    };
    return (
        <section className="admin-section">
            <h2>관광공사 자료에서 불러오기</h2>
            <p className="admin__hint">검색어를 비우면 여행지 중심 반경 안의 장소를 가까운 순으로 보여줘요. 추가하면 소개·대표 사진(공공누리 1·3유형만)과 함께 운영진 추천 장소로 저장되고, 지도 화면에 "자료 제공: 한국관광공사"가 표시돼요. 장소 종류는 관광공사 분류로 미리 골라 두니, 다르면 추천 장소 목록에서 바꿔 주세요.</p>
            <form className="admin-form admin-form--row" onSubmit={(e) => { e.preventDefault(); tour.search(form); }}>
                <select value={form.contentTypeId} onChange={(e) => setForm({ ...form, contentTypeId: e.target.value })} aria-label="종류">
                    {CONTENT_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
                <input value={form.keyword} onChange={(e) => setForm({ ...form, keyword: e.target.value })} placeholder="장소 이름 (비우면 주변 검색)" />
                <button type="submit" className="admin-button is-primary" disabled={tour.loading}>{tour.loading ? '찾는 중…' : '검색'}</button>
            </form>
            {tour.items?.length === 0 && <p>검색 결과가 없어요.</p>}
            {tour.items?.length > 0 && <p className="admin__hint">{tour.totalCount}건 중 {tour.items.length}건</p>}
            <ul className="admin-list">{tour.items?.map((item) => <TourRow key={item.contentId} item={item} onImport={onImport} />)}</ul>
            {tour.hasMore && <button type="button" className="admin-button" disabled={tour.loading} onClick={() => tour.search(form, tour.page + 1)}>더 보기</button>}
        </section>
    );
};

export default TourImportPanel;
