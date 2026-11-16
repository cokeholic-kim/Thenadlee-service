import React, { useState } from 'react';
import ImageUploadField from './ImageUploadField';

const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

export const emptyCityForm = () => ({
    name: '', displayName: '', lat: '', lng: '', description: '', titleImageUrl: '',
    sortOrder: 0, isPublished: false, monthly: MONTHS.map((month) => ({ month, description: '' })),
});

export const toCityForm = (city) => ({
    name: city.name,
    displayName: city.displayName || '',
    lat: city.lat,
    lng: city.lon,
    description: city.description || '',
    titleImageUrl: city.titleImageUrl || '',
    sortOrder: city.sortOrder,
    isPublished: city.isPublished,
    monthly: city.monthly.map((info) => ({ month: info.month, description: info.description || '' })),
});

const MonthlyFields = ({ monthly, onChange }) => (
    <details className="admin-form__monthly">
        <summary>월별 여행 정보 (캘린더에서 고른 달의 정보로 표시)</summary>
        {monthly.map((info, index) => (
            <label key={info.month}>
                {info.month}월
                <textarea rows="2" value={info.description} maxLength="1000"
                    onChange={(e) => onChange(monthly.map((item, i) => (i === index ? { ...item, description: e.target.value } : item)))} />
            </label>
        ))}
    </details>
);

const BasicFields = ({ form, set, isNew }) => (
    <>
        <label>영문 이름 (지도 주소 /map/이름)
            <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="예: Busan" required />
            {!isNew && <small>바꾸면 기존 공유 링크(/map/이전이름)가 동작하지 않아요.</small>}
        </label>
        <label>표시 이름<input value={form.displayName} onChange={(e) => set('displayName', e.target.value)} placeholder="예: 대한민국 부산" required /></label>
        <div className="admin-form__row">
            <label>위도<input type="number" step="any" value={form.lat} onChange={(e) => set('lat', e.target.value)} required /></label>
            <label>경도<input type="number" step="any" value={form.lng} onChange={(e) => set('lng', e.target.value)} required /></label>
            {form.lat !== '' && form.lng !== '' && (
                <a className="admin-button" href={`https://www.google.com/maps?q=${form.lat},${form.lng}`} target="_blank" rel="noreferrer">지도에서 확인</a>
            )}
        </div>
        <label>소개<textarea rows="4" value={form.description} maxLength="1000" onChange={(e) => set('description', e.target.value)} /></label>
    </>
);

// 여행지 기본 정보 + 월별 정보 입력 폼
const CityForm = ({ initial, isNew, onSave, onDelete }) => {
    const [form, setForm] = useState(initial);
    const set = (key, value) => setForm({ ...form, [key]: value });
    return (
        <form className="admin-form" onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
            <BasicFields form={form} set={set} isNew={isNew} />
            <ImageUploadField id="cityImage" label="대표 이미지" value={form.titleImageUrl} onChange={(url) => set('titleImageUrl', url)} />
            <div className="admin-form__row">
                <label>노출 순서<input type="number" min="0" value={form.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} /></label>
                <label className="admin-form__check">
                    <input type="checkbox" checked={form.isPublished} onChange={(e) => set('isPublished', e.target.checked)} />메인 화면에 공개
                </label>
            </div>
            <MonthlyFields monthly={form.monthly} onChange={(monthly) => set('monthly', monthly)} />
            <div className="admin-form__actions">
                <button type="submit" className="admin-button is-primary">{isNew ? '여행지 추가' : '저장'}</button>
                {onDelete && <button type="button" className="admin-button is-danger" onClick={onDelete}>여행지 삭제</button>}
            </div>
        </form>
    );
};

export default CityForm;
