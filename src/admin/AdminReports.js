import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/adminApi';
import { getApiErrorMessage } from '../util/apiError';
import AdminLayout from './AdminLayout';
import { toast, toastError, confirmDialog } from '../ui/feedback';

const TARGET_LABELS = { SPOT: '추천 장소', ITINERARY: '공개 일정' };
const STATUS_LABELS = { ACTIVE: '공개 중', HIDDEN: '숨김' };
const ACTIONS = [
    { value: 'HIDE', label: '숨김 유지', confirm: '이 게시물을 숨김 상태로 둘까요?' },
    { value: 'RESTORE', label: '다시 공개', confirm: '문제가 없다고 보고 다시 공개할까요?' },
    { value: 'DELETE', label: '삭제', confirm: '이 게시물을 삭제할까요? 되돌릴 수 없어요.' },
];

const targetLink = (row) => (row.targetType === 'ITINERARY'
    ? `/map/${row.cityName}?itinerary=${row.targetId}` : `/map/${row.cityName}`);

const ReportRow = ({ row, onResolve }) => (
    <tr>
        <td>{TARGET_LABELS[row.targetType]}</td>
        <td>{row.title ? <Link to={targetLink(row)}>{row.title}</Link> : '(삭제된 게시물)'}<br /><small>{row.cityName}</small></td>
        <td>{STATUS_LABELS[row.targetStatus] || '-'}</td>
        <td>
            {row.reportCount}건 · {row.reasons.map((reason) => `${reason.label} ${reason.count}`).join(', ')}
            {row.details.map((detail, index) => <div key={index}><small>“{detail}”</small></div>)}
        </td>
        <td>{row.lastReportedAt.slice(0, 16)}</td>
        <td className="admin-table__actions">
            {ACTIONS.map((action) => (
                <button key={action.value} type="button" className={`admin-button${action.value === 'DELETE' ? ' is-danger' : ''}`}
                    onClick={() => onResolve(row, action)}>{action.label}</button>
            ))}
        </td>
    </tr>
);

const ReportPanel = () => {
    const [rows, setRows] = useState(null);
    const load = useCallback(() => {
        adminApi.listReports().then(setRows).catch((error) => toastError(getApiErrorMessage(error)));
    }, []);
    useEffect(load, [load]);
    const onResolve = async (row, action) => {
        if (!await confirmDialog(action.confirm)) return;
        try {
            toast((await adminApi.resolveReport(row.targetType, row.targetId, action.value)).message);
            load();
        } catch (error) {
            toastError(getApiErrorMessage(error));
        }
    };
    return (
        <>
            <p className="admin__hint">여행자 게시물은 검토 대기 신고가 정해진 수(서버 설정, 기본 3건)만큼 쌓이면 자동으로 숨겨져요. 처리하면 그 게시물의 대기 신고가 모두 정리돼요.</p>
            <ReportTable rows={rows} onResolve={onResolve} />
        </>
    );
};

const ReportTable = ({ rows, onResolve }) => {
    if (rows === null) return <p>불러오는 중…</p>;
    if (rows.length === 0) return <p>검토할 신고가 없어요.</p>;
    return (
        <table className="admin-table">
            <thead><tr><th>종류</th><th>게시물</th><th>상태</th><th>신고 내용</th><th>최근 신고</th><th></th></tr></thead>
            <tbody>{rows.map((row) => <ReportRow key={`${row.targetType}-${row.targetId}`} row={row} onResolve={onResolve} />)}</tbody>
        </table>
    );
};

// 관리자: 신고 검토 (에디터 이상)
const AdminReports = () => <AdminLayout title="신고 관리"><ReportPanel /></AdminLayout>;

export default AdminReports;
