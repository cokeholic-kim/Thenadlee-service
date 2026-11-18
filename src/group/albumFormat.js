import React from 'react';

// trip_photo.caption 길이와 같음
const CAPTION_MAX_LENGTH = 100;

export const VIEW_MODES = [
    { value: 'day', label: '일차별' },
    { value: 'spot', label: '장소별' },
    { value: 'all', label: '전체' },
];

const sectionOf = (photo, mode) => {
    if (mode === 'day') return photo.dayNo ? { key: `d${photo.dayNo}`, title: `${photo.dayNo}일차` } : { key: 'd-', title: '날짜 미정' };
    if (mode === 'spot') return photo.spotId ? { key: `s${photo.spotId}`, title: photo.spotName } : { key: 's-', title: '장소 미정' };
    return { key: 'all', title: '모든 사진' };
};

/** 보기 방식에 따라 사진을 묶음 (서버가 일차 순으로 정렬해 줌, 미정은 맨 뒤) */
export const groupPhotos = (photos, mode) => {
    const sections = new Map();
    photos.forEach((photo) => {
        const section = sectionOf(photo, mode);
        if (!sections.has(section.key)) sections.set(section.key, { ...section, photos: [] });
        sections.get(section.key).photos.push(photo);
    });
    return [...sections.values()].sort((a, b) => a.key.endsWith('-') - b.key.endsWith('-'));
};

const dayOptions = (dayCount) => Array.from({ length: dayCount }, (_, index) => index + 1);

/** 일차·장소(확정 동선 기준)·한 줄 기록 입력 */
export const PhotoTagFields = ({ album, tags, onChange }) => {
    const set = (key, value) => onChange({ ...tags, [key]: value });
    const spots = album.spots.filter((spot) => !tags.dayNo || spot.dayNo === Number(tags.dayNo));
    return (
        <div className="album-tags">
            {album.dayCount > 0 && (
                <label>일차<select value={tags.dayNo} onChange={(e) => onChange({ ...tags, dayNo: e.target.value ? Number(e.target.value) : '', spotId: '' })}>
                    <option value="">선택 안 함</option>
                    {dayOptions(album.dayCount).map((day) => <option key={day} value={day}>{day}일차</option>)}
                </select></label>
            )}
            {album.spots.length > 0 && (
                <label>장소<select value={tags.spotId} onChange={(e) => set('spotId', e.target.value ? Number(e.target.value) : '')}>
                    <option value="">선택 안 함</option>
                    {spots.map((spot) => <option key={spot.spotId} value={spot.spotId}>{spot.dayNo}일차 · {spot.name}</option>)}
                </select></label>
            )}
            <label className="album-tags__caption">한 줄 기록<input value={tags.caption} maxLength={CAPTION_MAX_LENGTH} onChange={(e) => set('caption', e.target.value)} placeholder="예: 성산일출봉에서 본 첫 해" /></label>
        </div>
    );
};
