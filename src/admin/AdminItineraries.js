import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/adminApi';
import { getApiErrorMessage } from '../util/apiError';
import AdminLayout from './AdminLayout';

const STATUS_FILTERS = [
    { value: 'ALL', label: '전체' },
    { value: 'ACTIVE', label: '공개 중' },
    { value: 'HIDDEN', label: '숨김' },
];

const ItineraryRow = ({ item, onAction }) => (
    <tr className={item.status === 'HIDDEN' ? 'is-muted' : ''}>
        <td>{item.isFeatured && <span className="admin-badge">추천</span>} <Link to={`/map/${item.cityName}?itinerary=${item.id}`}>{item.title}</Link></td>
        <td>{item.cityName}</td>
        <td>{item.authorNickName}</td>
        <td>{item.dayCount}일 · {item.spotCount}곳</td>
        <td>{item.status === 'HIDDEN' ? '숨김' : '공개 중'}</td>
        <td className="admin-table__actions">
            <button type="button" className="admin-button" onClick={() => onAction(() => adminApi.changeItineraryFeatured(item.id, !item.isFeatured))}>
                {item.isFeatured ? '추천 해제' : '추천 지정'}
            </button>
            <button type="button" className={`admin-button ${item.status === 'HIDDEN' ? '' : 'is-danger'}`}
                onClick={() => onAction(() => adminApi.changeItineraryStatus(item.id, item.status === 'HIDDEN' ? 'ACTIVE' : 'HIDDEN'))}>
                {item.status === 'HIDDEN' ? '다시 공개' : '숨기기'}
            </button>
        </td>
    </tr>
);

const ItineraryPanel = () => {
    const [status, setStatus] = useState('ALL');
    const [items, setItems] = useState(null);
    const load = useCallback(() => {
        adminApi.listItineraries(status).then(setItems).catch((error) => alert(getApiErrorMessage(error)));
    }, [status]);
    useEffect(load, [load]);

    const onAction = async (action) => {
        try { await action(); load(); } catch (error) { alert(getApiErrorMessage(error)); }
    };

    return (
        <>
            <div className="admin__toolbar">
                <p>운영진 추천 일정은 직접 지도에서 일정을 만들어 공개로 저장한 뒤 "추천 지정"을 누르세요.</p>
                <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="상태">
                    {STATUS_FILTERS.map((filter) => <option key={filter.value} value={filter.value}>{filter.label}</option>)}
                </select>
            </div>
            {items === null && <p>불러오는 중…</p>}
            {items?.length === 0 && <p>공개된 일정이 없어요.</p>}
            {items?.length > 0 && (
                <table className="admin-table">
                    <thead><tr><th>제목</th><th>여행지</th><th>작성자</th><th>구성</th><th>상태</th><th></th></tr></thead>
                    <tbody>{items.map((item) => <ItineraryRow key={item.id} item={item} onAction={onAction} />)}</tbody>
                </table>
            )}
        </>
    );
};

// 관리자: 회원이 공개한 일정 관리 (숨김·복구, 운영진 추천 지정). 비공개 일정은 목록에 나오지 않음
const AdminItineraries = () => <AdminLayout title="공개 일정 관리"><ItineraryPanel /></AdminLayout>;

export default AdminItineraries;
