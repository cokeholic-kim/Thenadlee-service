import React, { useState } from 'react';
import { adminApi } from '../api/adminApi';
import { getApiErrorMessage } from '../util/apiError';
import ImageUploadField from './ImageUploadField';
import SpotMediaManager from './SpotMediaManager';

const EMPTY_SPOT = { name: '', lat: '', lng: '', description: '', imageUrl: '' };
const toSpotForm = (spot) => ({ name: spot.name, lat: spot.lat, lng: spot.lon, description: spot.description || '', imageUrl: spot.imageUrl || '' });

const SpotForm = ({ initial, submitLabel, onSubmit, onCancel }) => {
    const [form, setForm] = useState(initial);
    const set = (key, value) => setForm({ ...form, [key]: value });
    return (
        <form className="admin-form admin-form--inline" onSubmit={(e) => { e.preventDefault(); onSubmit(form, () => setForm(EMPTY_SPOT)); }}>
            <label>장소 이름<input value={form.name} onChange={(e) => set('name', e.target.value)} required /></label>
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
        <span>{spot.lat}, {spot.lon}{spot.source === 'USER' && ` · ${spot.authorNickName || '탈퇴한 회원'} 님 등록`}</span>
    </div>
);

const SpotRow = ({ spot, onSave, onDelete, onToggleStatus }) => {
    const [editing, setEditing] = useState(false);
    const [mediaOpen, setMediaOpen] = useState(false);
    if (editing) {
        return <li><SpotForm initial={toSpotForm(spot)} submitLabel="수정 저장" onCancel={() => setEditing(false)}
            onSubmit={async (form) => { if (await onSave(spot.id, form)) setEditing(false); }} /></li>;
    }
    return (
        <>
            <li className={`admin-list__item${spot.status === 'HIDDEN' ? ' is-muted' : ''}`}>
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

// 여행지의 추천 장소 목록·추가·수정·삭제
const SpotManager = ({ cityId, spots, onChanged }) => {
    const run = async (action) => {
        try { const result = await action(); onChanged(); return result ?? true; } catch (error) { alert(getApiErrorMessage(error)); return false; }
    };
    const onDelete = (spot) => {
        if (window.confirm(`"${spot.name}" 장소를 삭제할까요? 이 장소를 담은 회원 일정에서도 빠집니다.`)) {
            run(() => adminApi.deleteSpot(spot.id));
        }
    };
    return (
        <section className="admin-section">
            <h2>추천 장소 ({spots.length})</h2>
            <ul className="admin-list">
                {spots.map((spot) => <SpotRow key={spot.id} spot={spot} onDelete={onDelete}
                    onSave={(id, form) => run(() => adminApi.updateSpot(id, form))}
                    onToggleStatus={(target) => run(() => adminApi.changeSpotStatus(target.id, target.status === 'HIDDEN' ? 'ACTIVE' : 'HIDDEN'))} />)}
            </ul>
            <h3>장소 추가</h3>
            <SpotForm initial={EMPTY_SPOT} submitLabel="장소 추가"
                onSubmit={async (form, reset) => { if (await run(() => adminApi.addSpot(cityId, form))) reset(); }} />
        </section>
    );
};

export default SpotManager;
