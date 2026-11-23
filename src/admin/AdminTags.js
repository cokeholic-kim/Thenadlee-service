import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { adminApi } from '../api/adminApi';
import { getApiErrorMessage } from '../util/apiError';
import { confirmDialog, toast, toastError } from '../ui/feedback';

const HIDDEN = 'HIDDEN';

// 태그 목록 불러오기·바꾸기 (바꾸는 API 는 바뀐 뒤 전체 목록을 돌려줌)
const useTags = () => {
    const [tags, setTags] = useState(null);
    const load = useCallback(() => adminApi.listTags().then(setTags).catch((error) => { toastError(getApiErrorMessage(error)); setTags([]); }), []);
    useEffect(() => { load(); }, [load]);
    const run = async (action, message) => {
        try { setTags(await action()); if (message) toast(message); return true; } catch (error) { toastError(getApiErrorMessage(error)); return false; }
    };
    return { tags, run };
};

const toForm = (tag) => ({ name: tag.name, icon: tag.icon || '', pageTitle: tag.pageTitle || '', official: tag.official });

const TagForm = ({ tag, onSave, onCancel }) => {
    const [form, setForm] = useState(toForm(tag));
    const set = (key, value) => setForm({ ...form, [key]: value });
    return (
        <form className="admin-form admin-form--inline admin-tag-form" onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
            <label>이름<input value={form.name} maxLength={30} onChange={(e) => set('name', e.target.value)} required /></label>
            <label>아이콘 (이모지, 선택)<input value={form.icon} maxLength={16} onChange={(e) => set('icon', e.target.value)} /></label>
            <label>추천 페이지 제목 (선택, 예: 비 오는 날 가볼 만한 곳)<input value={form.pageTitle} maxLength={60} onChange={(e) => set('pageTitle', e.target.value)} /></label>
            <label className="admin-check"><input type="checkbox" checked={form.official} onChange={(e) => set('official', e.target.checked)} /> 공식 태그 (입력 추천·지도 필터에 먼저 보임)</label>
            <div className="admin-form__actions">
                <button type="submit" className="admin-button is-primary">저장</button>
                <button type="button" className="admin-button" onClick={onCancel}>취소</button>
            </div>
        </form>
    );
};

const TagRow = ({ tag, run }) => {
    const [editing, setEditing] = useState(false);
    const hidden = tag.status === HIDDEN;
    const toggle = async () => (!hidden && !(await confirmDialog(`#${tag.name} 태그를 숨길까요? 모든 장소에서 안 보이고 새로 달 수도 없어요.`, { confirmLabel: '숨기기' })))
        || run(() => adminApi.changeTagStatus(tag.id, hidden ? 'ACTIVE' : HIDDEN), hidden ? '다시 보이게 했어요.' : '태그를 숨겼어요.');
    if (editing) return <li><TagForm tag={tag} onCancel={() => setEditing(false)} onSave={async (form) => { if (await run(() => adminApi.updateTag(tag.id, form), '태그를 고쳤어요.')) setEditing(false); }} /></li>;
    return (
        <li className={`admin-list__item${hidden ? ' is-muted' : ''}`}>
            <div className="admin-list__text">
                <strong>{tag.icon} #{tag.name} {tag.official && <span className="admin-badge">공식</span>}{hidden && <span className="admin-badge is-muted">숨김</span>}</strong>
                <span>장소 {tag.usageCount}곳 · 주소 /spots/도시/{tag.key}{tag.pageTitle ? ` · 페이지 제목 "${tag.pageTitle}"` : ''}</span>
            </div>
            <button type="button" className="admin-button" onClick={() => setEditing(true)}>수정</button>
            <button type="button" className="admin-button" onClick={toggle}>{hidden ? '다시 사용' : '숨기기'}</button>
        </li>
    );
};

const matches = (tag, query, onlyOfficial) => (!onlyOfficial || tag.official) && (!query || tag.name.toLowerCase().includes(query.toLowerCase()));

// 해시태그 관리 (관리자만, 모든 여행지에 영향): 회원이 만든 태그 확인·이름 다듬기·공식 지정·숨기기
const AdminTags = () => {
    const { tags, run } = useTags();
    const [query, setQuery] = useState('');
    const [onlyOfficial, setOnlyOfficial] = useState(false);
    const visible = (tags || []).filter((tag) => matches(tag, query, onlyOfficial));
    return (
        <AdminLayout title="해시태그" adminOnly>
            <p className="admin-hint">회원 누구나 장소에 태그를 달 수 있어요. 이상한 태그는 숨기면 모든 장소에서 사라지고 다시 달 수 없어요. 같은 태그가 장소 3곳 이상에 달리면 여행지별 추천 페이지가 생겨요.</p>
            <div className="admin-filters">
                <input className="admin-search" value={query} placeholder="태그 이름 찾기" aria-label="태그 이름 찾기" onChange={(e) => setQuery(e.target.value)} />
                <label className="admin-check"><input type="checkbox" checked={onlyOfficial} onChange={(e) => setOnlyOfficial(e.target.checked)} /> 공식만 보기</label>
            </div>
            {tags === null && <p className="admin__message">불러오는 중…</p>}
            <ul className="admin-list">{visible.map((tag) => <TagRow key={tag.id} tag={tag} run={run} />)}</ul>
        </AdminLayout>
    );
};

export default AdminTags;
