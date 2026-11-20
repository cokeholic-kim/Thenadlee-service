import React, { useEffect, useState } from 'react';
import { adminApi } from '../api/adminApi';
import { getApiErrorMessage } from '../util/apiError';

const KIND_LABELS = { VIDEO: '영상', BLOG: '블로그 후기' };
const EMPTY_FORM = { kind: 'VIDEO', url: '', title: '' };

const toPick = (item) => ({ kind: item.kind, url: item.url, title: item.title, thumbnailUrl: item.thumbnailUrl || '', author: item.author || '' });

const ItemState = ({ item }) => (
    <>
        {item.pinned && <span className="admin-badge">고정</span>}
        {item.hidden && <span className="admin-badge is-muted">숨김</span>}
    </>
);

// 고정·숨긴 항목은 "해제", 나머지는 "고정"·"숨기기"
const ItemButtons = ({ item, onPick, onUnpick }) => (item.pinned || item.hidden
    ? <button type="button" className="admin-button" onClick={() => onUnpick(item.url)}>{item.pinned ? '고정 해제' : '숨김 해제'}</button>
    : (
        <>
            <button type="button" className="admin-button" onClick={() => onPick('pin', toPick(item))}>고정</button>
            <button type="button" className="admin-button" onClick={() => onPick('hide', toPick(item))}>숨기기</button>
        </>
    ));

const MediaItemList = ({ title, items, ...handlers }) => (
    <>
        <h4>{title} <span>{items.length}건</span></h4>
        <ul className="admin-media__list">
            {items.map((item) => (
                <li key={item.url} className={item.hidden ? 'is-muted' : ''}>
                    <a href={item.url} target="_blank" rel="noopener noreferrer"><ItemState item={item} /> {item.title}</a>
                    <span>{[item.author, item.publishedAt].filter(Boolean).join(' · ')}</span>
                    <ItemButtons item={item} {...handlers} />
                </li>
            ))}
        </ul>
    </>
);

const AddForm = ({ onPick }) => {
    const [form, setForm] = useState(EMPTY_FORM);
    const set = (key, value) => setForm({ ...form, [key]: value });
    const submit = async (e) => { e.preventDefault(); if (await onPick('pin', form)) setForm(EMPTY_FORM); };
    return (
        <form className="admin-form admin-form--inline" onSubmit={submit}>
            <div className="admin-form__row">
                <label>종류<select value={form.kind} onChange={(e) => set('kind', e.target.value)}>
                    {Object.entries(KIND_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select></label>
                <label>주소<input type="url" value={form.url} onChange={(e) => set('url', e.target.value)} placeholder="https://www.youtube.com/watch?v=..." required /></label>
            </div>
            <label>제목<input value={form.title} maxLength="200" onChange={(e) => set('title', e.target.value)} required /></label>
            <button type="submit" className="admin-button is-primary">직접 추가해서 고정</button>
        </form>
    );
};

// 장소별 영상·후기 큐레이션: 엉뚱하거나 광고성인 결과는 숨기고, 좋은 자료는 고정 (에디터 이상)
const SpotMediaManager = ({ spotId }) => {
    const [media, setMedia] = useState(null);
    const run = async (action) => {
        try { setMedia(await action()); return true; } catch (error) { alert(getApiErrorMessage(error)); return false; }
    };
    useEffect(() => { run(() => adminApi.listSpotMedia(spotId)); }, [spotId]);
    if (!media) return <p className="admin-media__empty">영상·후기를 불러오는 중…</p>;
    const handlers = {
        onPick: (action, item) => run(() => adminApi.pickSpotMedia(spotId, action, item)),
        onUnpick: (url) => run(() => adminApi.unpickSpotMedia(spotId, url)),
    };
    return (
        <div className="admin-media">
            <div className="admin-media__head">
                <span>{media.available ? `검색: ${media.source}` : '지금은 검색할 수 없어요 (키·하루 상한 확인)'}</span>
                <button type="button" className="admin-button" onClick={() => run(() => adminApi.refreshSpotMedia(spotId))}>다시 검색</button>
            </div>
            <MediaItemList title={KIND_LABELS.VIDEO} items={media.videos} {...handlers} />
            <MediaItemList title={KIND_LABELS.BLOG} items={media.blogs} {...handlers} />
            <AddForm onPick={handlers.onPick} />
        </div>
    );
};

export default SpotMediaManager;
