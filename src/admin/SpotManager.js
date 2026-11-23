import React, { useState } from 'react';
import { adminApi } from '../api/adminApi';
import { getApiErrorMessage } from '../util/apiError';
import ImageUploadField from './ImageUploadField';
import SpotMediaManager from './SpotMediaManager';
import { SPOT_CATEGORIES, categoryLabel } from '../community/spotCategories';
import { spotTagList } from '../community/spotTags';
import SpotTagPicker from '../community/SpotTagPicker';
import SpotTagBulkBar, { useSpotSelection } from './SpotTagBulkBar';
import AdminPlaceSearch, { SpotCityContext } from './AdminPlaceSearch';
import { toastError, confirmDialog } from '../ui/feedback';

const EMPTY_SPOT = { name: '', lat: '', lng: '', description: '', imageUrl: '', category: '', tags: [] };
const toSpotForm = (spot) => ({
    name: spot.name, lat: spot.lat, lng: spot.lon, description: spot.description || '', imageUrl: spot.imageUrl || '', category: spot.category || '',
    tags: spot.tags || [],
});

// 종류(하나) + 상황 태그(여러 개)
const KindFields = ({ form, set }) => (
    <>
        <label>종류
            <select value={form.category} onChange={(e) => set('category', e.target.value)}>
                <option value="">미분류</option>
                {SPOT_CATEGORIES.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
            </select>
        </label>
        <div className="admin-form__field">상황 태그 (선택)<SpotTagPicker value={form.tags} onChange={(tags) => set('tags', tags)} /></div>
    </>
);

const useSpotFormState = (initial) => {
    const [form, setForm] = useState(initial);
    const set = (key, value) => setForm({ ...form, [key]: value });
    // 검색으로 고르면 좌표를 채우고, 이름이 비어 있으면 이름도 채움
    const onPick = ({ name, lat, lng }) => setForm((current) => ({ ...current, lat, lng, name: current.name || name }));
    return { form, setForm, set, onPick };
};

const SpotForm = ({ initial, submitLabel, onSubmit, onCancel }) => {
    const { form, setForm, set, onPick } = useSpotFormState(initial);
    return (
        <form className="admin-form admin-form--inline" onSubmit={(e) => { e.preventDefault(); onSubmit(form, () => setForm(EMPTY_SPOT)); }}>
            <label>장소 이름<input value={form.name} onChange={(e) => set('name', e.target.value)} required /></label>
            <KindFields form={form} set={set} />
            <AdminPlaceSearch onPick={onPick} />
            <div className="admin-form__row">
                <label>위도<input type="number" step="any" value={form.lat} onChange={(e) => set('lat', e.target.value)} required /></label>
                <label>경도<input type="number" step="any" value={form.lng} onChange={(e) => set('lng', e.target.value)} required /></label>
            </div>
            <label>설명<textarea rows="2" value={form.description} maxLength="1000" onChange={(e) => set('description', e.target.value)} /></label>
            <ImageUploadField id={`spotImage-${initial.name || 'new'}`} label="사진" value={form.imageUrl} onChange={(url) => set('imageUrl', url)} />
            <div className="admin-form__actions">
                <button type="submit" className="admin-button is-primary">{submitLabel}</button>
                {onCancel && <button type="button" className="admin-button" onClick={onCancel}>취소</button>}
            </div>
        </form>
    );
};

const SpotLabel = ({ spot }) => (
    <div className="admin-list__text">
        <strong>
            {spot.source === 'USER' && <span className="admin-badge">여행자</span>}
            {spot.tourContentId && <span className="admin-badge is-muted">관광공사</span>} {spot.name}
            {spot.status === 'HIDDEN' && <span className="admin-badge is-muted">숨김</span>}
        </strong>
        <span className={`admin-category${spot.category ? '' : ' is-empty'}`}>{categoryLabel(spot.category) || '미분류'}{spotTagList(spot.tags).map((tag) => ` ${tag.icon}`).join('')}</span>
        <span>{spot.lat}, {spot.lon}{spot.source === 'USER' && ` · ${spot.authorNickName || '탈퇴한 회원'} 님 등록`}</span>
    </div>
);

const SpotRow = ({ spot, selection, onSave, onDelete, onToggleStatus }) => {
    const [editing, setEditing] = useState(false);
    const [mediaOpen, setMediaOpen] = useState(false);
    if (editing) {
        return <li><SpotForm initial={toSpotForm(spot)} submitLabel="수정 저장" onCancel={() => setEditing(false)}
            onSubmit={async (form) => { if (await onSave(spot.id, form)) setEditing(false); }} /></li>;
    }
    return (
        <>
            <li className={`admin-list__item${spot.status === 'HIDDEN' ? ' is-muted' : ''}`}>
                <input type="checkbox" className="admin-list__pick" aria-label={`${spot.name} 고르기`} checked={selection.isSelected(spot.id)} onChange={() => selection.toggle(spot.id)} />
                {spot.imageUrl ? <img src={spot.imageUrl} alt="" /> : <div className="admin-list__noimg" />}
                <SpotLabel spot={spot} />
                <button type="button" className="admin-button" aria-expanded={mediaOpen} onClick={() => setMediaOpen(!mediaOpen)}>영상·후기</button>
                <button type="button" className="admin-button" onClick={() => setEditing(true)}>수정</button>
                <button type="button" className="admin-button" onClick={() => onToggleStatus(spot)}>{spot.status === 'HIDDEN' ? '다시 공개' : '숨기기'}</button>
                <button type="button" className="admin-button is-danger" onClick={() => onDelete(spot)}>삭제</button>
            </li>
            {mediaOpen && <li className="admin-list__panel"><SpotMediaManager spotId={spot.id} /></li>}
        </>
    );
};

// 목록 거르기: 종류를 안 고른 장소, 상황 태그가 없는 장소 (둘 다 켜면 둘 다 해당하는 장소)
const LIST_FILTERS = [
    { key: 'unclassified', label: '미분류만 보기', test: (spot) => !spot.category },
    { key: 'untagged', label: '태그 없는 장소만 보기', test: (spot) => !spot.tags?.length },
];

const useSpotListFilter = (spots) => {
    const [on, setOn] = useState({});
    const options = LIST_FILTERS.map((filter) => ({ ...filter, count: spots.filter(filter.test).length, checked: Boolean(on[filter.key]) }));
    const visible = spots.filter((spot) => options.every((filter) => !filter.checked || filter.test(spot)));
    return { options, visible, toggle: (key, checked) => setOn((current) => ({ ...current, [key]: checked })) };
};

const SpotListFilters = ({ filter }) => (
    <div className="admin-filters">
        {filter.options.map((option) => (option.count === 0 && !option.checked ? null : (
            <label key={option.key} className="admin-check">
                <input type="checkbox" checked={option.checked} onChange={(e) => filter.toggle(option.key, e.target.checked)} /> {option.label} ({option.count})
            </label>
        )))}
    </div>
);

// 실행 후 목록을 다시 불러오고, 실패하면 알림 (성공하면 응답값 또는 true)
const useAdminRun = (onChanged) => async (action) => {
    try { const result = await action(); onChanged(); return result ?? true; } catch (error) { toastError(getApiErrorMessage(error)); return false; }
};

const SpotList = ({ spots, selection, run }) => {
    const onDelete = async (spot) => {
        if (await confirmDialog(`"${spot.name}" 장소를 삭제할까요? 이 장소를 담은 회원 일정에서도 빠집니다.`)) run(() => adminApi.deleteSpot(spot.id));
    };
    return (
        <ul className="admin-list">
            {spots.map((spot) => <SpotRow key={spot.id} spot={spot} selection={selection} onDelete={onDelete}
                onSave={(id, form) => run(() => adminApi.updateSpot(id, form))}
                onToggleStatus={(target) => run(() => adminApi.changeSpotStatus(target.id, target.status === 'HIDDEN' ? 'ACTIVE' : 'HIDDEN'))} />)}
        </ul>
    );
};

// 여행지의 추천 장소 목록·거르기·태그 한 번에 바꾸기·추가·수정·삭제
const SpotManager = ({ cityId, city, spots, onChanged }) => {
    const run = useAdminRun(onChanged);
    const filter = useSpotListFilter(spots);
    const selection = useSpotSelection(filter.visible);
    return (
        <SpotCityContext.Provider value={city}><section className="admin-section">
            <h2>추천 장소 ({spots.length})</h2>
            <SpotListFilters filter={filter} />
            <SpotTagBulkBar cityId={cityId} selection={selection} run={run} visibleCount={filter.visible.length} />
            <SpotList spots={filter.visible} selection={selection} run={run} />
            <h3>장소 추가</h3>
            <SpotForm initial={EMPTY_SPOT} submitLabel="장소 추가"
                onSubmit={async (form, reset) => { if (await run(() => adminApi.addSpot(cityId, form))) reset(); }} />
        </section></SpotCityContext.Provider>
    );
};

export default SpotManager;
