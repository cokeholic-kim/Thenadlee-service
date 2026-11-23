import React, { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../api/adminApi';
import { getApiErrorMessage } from '../util/apiError';
import { toast, toastError } from '../ui/feedback';

// 에디터 목록 + 전체 여행지 (관리자만 부름)
const useEditorCities = (reloadKey) => {
    const [state, setState] = useState({ editors: null, cities: [] });
    const load = useCallback(() => Promise.all([adminApi.listEditors(), adminApi.listCities()])
        .then(([editors, cities]) => setState({ editors, cities }))
        .catch((error) => { toastError(getApiErrorMessage(error)); setState({ editors: [], cities: [] }); }), []);
    useEffect(() => { load(); }, [load, reloadKey]);
    const save = async (editor, cityIds) => {
        try {
            const editors = await adminApi.setEditorCities(editor.userId, cityIds);
            setState((current) => ({ ...current, editors }));
            toast(`${editor.nickName} 님의 담당 여행지를 바꿨어요.`);
            return true;
        } catch (error) {
            toastError(getApiErrorMessage(error));
            return false;
        }
    };
    return { ...state, save };
};

const CityPicker = ({ cities, initial, onSave, onCancel }) => {
    const [picked, setPicked] = useState(() => new Set(initial));
    const toggle = (id) => setPicked((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
    return (
        <div className="admin-city-picker">
            {cities.map((city) => (
                <label key={city.id} className="admin-check">
                    <input type="checkbox" checked={picked.has(city.id)} onChange={() => toggle(city.id)} /> {city.displayName || city.name}
                </label>
            ))}
            <div className="admin-form__actions">
                <button type="button" className="admin-button is-primary" onClick={() => onSave([...picked])}>저장</button>
                <button type="button" className="admin-button" onClick={onCancel}>취소</button>
            </div>
        </div>
    );
};

const EditorRow = ({ editor, cities, onSave }) => {
    const [editing, setEditing] = useState(false);
    return (
        <li className="admin-list__item admin-editor-row">
            <div className="admin-list__text">
                <strong>{editor.nickName} <small>({editor.loginId})</small></strong>
                <p className="admin-chips">{editor.cities.length === 0 ? <span className="is-empty">담당 없음</span> : editor.cities.map((city) => <span key={city.id}>{city.displayName}</span>)}</p>
                {editing && <CityPicker cities={cities} initial={editor.cities.map((city) => city.id)} onCancel={() => setEditing(false)}
                    onSave={async (ids) => { if (await onSave(editor, ids)) setEditing(false); }} />}
            </div>
            {!editing && <button type="button" className="admin-button" onClick={() => setEditing(true)}>담당 바꾸기</button>}
        </li>
    );
};

// 에디터 담당 여행지 (관리자만): 에디터는 여기서 정한 여행지만 관리 화면에서 보고 고칠 수 있음
const EditorCityPanel = ({ reloadKey }) => {
    const { editors, cities, save } = useEditorCities(reloadKey);
    return (
        <section className="admin-section admin-section--first">
            <h2>에디터 담당 여행지</h2>
            <p className="admin-hint">에디터는 맡은 여행지의 장소·여행기·영상·공개 일정·신고만 다룰 수 있어요. 새로 맡긴 여행지는 에디터에게 알림이 가요. 권한을 일반으로 바꾸면 담당도 풀려요.</p>
            {editors === null && <p>불러오는 중…</p>}
            {editors?.length === 0 && <p className="admin-hint">에디터 권한인 회원이 없어요. 아래에서 권한을 에디터로 바꾸면 여기 나타나요.</p>}
            <ul className="admin-list">{(editors || []).map((editor) => <EditorRow key={editor.userId} editor={editor} cities={cities} onSave={save} />)}</ul>
        </section>
    );
};

export default EditorCityPanel;
