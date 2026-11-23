import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import AdminLayout from './AdminLayout';
import { adminApi } from '../api/adminApi';
import { getApiErrorMessage } from '../util/apiError';
import { toastError } from '../ui/feedback';
import { isAdmin } from './roles';
import { actionLabel, beforeRows, isDangerAction } from './editorActivityText';

const EMPTY_FILTER = { userId: '', cityId: '' };

const toParams = (filter, beforeId) => Object.fromEntries(
    Object.entries({ ...filter, beforeId }).filter(([, value]) => value !== '' && value !== undefined && value !== null),
);

// 편집 기록 한 쪽씩 불러오기 (거르기를 바꾸면 처음부터)
const useActivity = (filter) => {
    const [page, setPage] = useState({ items: null, nextBeforeId: null });
    const load = useCallback(async (beforeId) => {
        try {
            const result = await adminApi.listActivity(toParams(filter, beforeId));
            setPage((current) => ({ items: beforeId ? [...current.items, ...result.items] : result.items, nextBeforeId: result.nextBeforeId }));
        } catch (error) {
            toastError(getApiErrorMessage(error));
            setPage({ items: [], nextBeforeId: null });
        }
    }, [filter]);
    useEffect(() => { load(null); }, [load]);
    return { ...page, more: () => load(page.nextBeforeId) };
};

// 거르기에 쓸 여행지(에디터는 담당 여행지만 내려옴)·에디터 목록(관리자만)
const useFilterOptions = (admin) => {
    const [options, setOptions] = useState({ cities: [], editors: [] });
    useEffect(() => {
        Promise.all([adminApi.listCities(), admin ? adminApi.listEditors() : Promise.resolve([])])
            .then(([cities, editors]) => setOptions({ cities, editors }))
            .catch(() => setOptions({ cities: [], editors: [] }));
    }, [admin]);
    return options;
};

const Filters = ({ admin, filter, setFilter, options }) => (
    <div className="admin-filters">
        {admin && (
            <select value={filter.userId} aria-label="사람으로 거르기" onChange={(e) => setFilter({ ...filter, userId: e.target.value })}>
                <option value="">모든 사람</option>
                {options.editors.map((editor) => <option key={editor.userId} value={editor.userId}>{editor.nickName} ({editor.loginId})</option>)}
            </select>
        )}
        <select value={filter.cityId} aria-label="여행지로 거르기" onChange={(e) => setFilter({ ...filter, cityId: e.target.value })}>
            <option value="">모든 여행지</option>
            {options.cities.map((city) => <option key={city.id} value={city.id}>{city.displayName || city.name}</option>)}
        </select>
    </div>
);

const BeforeDetail = ({ before }) => (
    <details className="admin-activity__before">
        <summary>바꾸기 전 내용</summary>
        <dl>{beforeRows(before).map(([label, value]) => <React.Fragment key={label}><dt>{label}</dt><dd>{value}</dd></React.Fragment>)}</dl>
    </details>
);

const ActivityRow = ({ item }) => (
    <li className={`admin-activity__item${isDangerAction(item.action) ? ' is-danger' : ''}`}>
        <div className="admin-activity__meta">
            <time dateTime={item.createdAt}>{item.createdAt.slice(0, 16)}</time>
            <strong>{item.nickName}</strong>
            {item.cityName && <span>{item.cityName}</span>}
        </div>
        <p><span className="admin-badge">{actionLabel(item.action)}</span> {item.summary}</p>
        {item.before && <BeforeDetail before={item.before} />}
    </li>
);

const ActivityPanel = () => {
    const admin = isAdmin(useSelector((state) => state.logincheck.user?.role));
    const [filter, setFilter] = useState(EMPTY_FILTER);
    const options = useFilterOptions(admin);
    const { items, nextBeforeId, more } = useActivity(filter);
    return (
        <>
            <p className="admin-hint">{admin
                ? '에디터와 관리자가 관리 화면에서 바꾼 내용이에요. 장소·여행지를 고치거나 지우면 바꾸기 전 내용도 남아서, 문제가 생기면 보고 되살릴 수 있어요.'
                : '내가 관리 화면에서 바꾼 내용이에요. 관리자도 같은 기록을 봐요.'}</p>
            <Filters admin={admin} filter={filter} setFilter={setFilter} options={options} />
            {items === null && <p className="admin__message">불러오는 중…</p>}
            {items?.length === 0 && <p className="admin-hint">기록이 없어요.</p>}
            <ul className="admin-activity">{(items || []).map((item) => <ActivityRow key={item.id} item={item} />)}</ul>
            {nextBeforeId && <button type="button" className="admin-button" onClick={more}>더 보기</button>}
        </>
    );
};

// 편집 기록 (관리자는 전체, 에디터는 본인 것)
const AdminActivity = () => <AdminLayout title="편집 기록"><ActivityPanel /></AdminLayout>;

export default AdminActivity;
