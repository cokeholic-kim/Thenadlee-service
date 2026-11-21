import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { answerInquiry, deleteAdminInquiry, fetchAdminInquiries } from '../api/inquiryApi';
import { getApiErrorMessage } from '../util/apiError';
import { confirmDialog, toast, toastError } from '../ui/feedback';
import { INQUIRY_LIMITS, INQUIRY_STATUS, categoryLabelOf, formatInquiryDate } from '../inquiry/inquiryLabels';
import '../inquiry/Inquiry.scss';

const FILTERS = [
    { value: 'WAITING', label: '답변 대기' },
    { value: 'ANSWERED', label: '답변 완료' },
    { value: '', label: '전체' },
];

// 답변 쓰기·고치기 (고치면 회원에게 다시 "새 답변"으로 보임)
const AnswerForm = ({ item, onAnswer }) => {
    const [answer, setAnswer] = useState(item.answer || '');
    return (
        <form className="inquiry-form" onSubmit={(e) => { e.preventDefault(); onAnswer(item, answer); }}>
            <label htmlFor={`answer-${item.id}`}>답변 <span>{answer.length} / {INQUIRY_LIMITS.answer}</span></label>
            <textarea id={`answer-${item.id}`} rows="5" value={answer} maxLength={INQUIRY_LIMITS.answer} onChange={(e) => setAnswer(e.target.value)} required />
            <button type="submit" className="inquiry-button is-primary">{item.answer ? '답변 고치기' : '답변 달기'}</button>
        </form>
    );
};

const AdminInquiryItem = ({ item, onAnswer, onDelete }) => (
    <li className="inquiry-item">
        <details open={item.status === 'WAITING'}>
            <summary>
                <span className={`inquiry-status is-${item.status.toLowerCase()}`}>{INQUIRY_STATUS[item.status]}</span>
                <strong>{item.title}</strong>
                <em>{categoryLabelOf(item.category)} · {item.authorNickName} ({item.authorLoginId}) · {formatInquiryDate(item.createdAt)}</em>
            </summary>
            <p className="inquiry-item__content">{item.content}</p>
            {item.answer && <p className="inquiry-item__meta">마지막 답변: {item.answeredByNickName || '탈퇴한 관리자'} · {formatInquiryDate(item.answeredAt)}</p>}
            <AnswerForm key={`${item.id}-${item.answeredAt}`} item={item} onAnswer={onAnswer} />
            <button type="button" className="inquiry-button is-danger" onClick={() => onDelete(item)}>문의 삭제</button>
        </details>
    </li>
);

const useAdminInquiries = (status) => {
    const [data, setData] = useState(null);
    const load = useCallback(() => fetchAdminInquiries(status).then(setData).catch((error) => toastError(getApiErrorMessage(error))), [status]);
    useEffect(() => { load(); }, [load]);
    const onAnswer = async (item, answer) => {
        try { await answerInquiry(item.id, answer); toast('답변을 저장했어요. 회원 화면에 "새 답변"으로 보여요.'); load(); } catch (error) { toastError(getApiErrorMessage(error)); }
    };
    const onDelete = async (item) => {
        if (!await confirmDialog(`"${item.title}" 문의를 삭제할까요? 회원 화면에서도 사라지고 되돌릴 수 없어요.`, { title: '문의 삭제', confirmLabel: '삭제' })) return;
        try { toast((await deleteAdminInquiry(item.id)).message); load(); } catch (error) { toastError(getApiErrorMessage(error)); }
    };
    return { data, onAnswer, onDelete };
};

// 관리자 고객 문의 (ADMIN 만): 답변 대기 먼저, 답변 달기·고치기·삭제
const AdminInquiries = () => {
    const [status, setStatus] = useState('WAITING');
    const { data, onAnswer, onDelete } = useAdminInquiries(status);
    return (
        <AdminLayout title={`고객 문의${data ? ` (대기 ${data.waitingCount})` : ''}`} adminOnly>
            <div className="inquiry-filters" role="group" aria-label="상태">
                {FILTERS.map((filter) => (
                    <button key={filter.label} type="button" className={status === filter.value ? 'is-active' : ''} onClick={() => setStatus(filter.value)}>{filter.label}</button>
                ))}
            </div>
            {data === null && <p>불러오는 중…</p>}
            {data?.items.length === 0 && <p className="inquiry-empty">해당하는 문의가 없어요.</p>}
            {data?.items.length > 0 && <ul className="inquiry-list">{data.items.map((item) => <AdminInquiryItem key={item.id} item={item} onAnswer={onAnswer} onDelete={onDelete} />)}</ul>}
        </AdminLayout>
    );
};

export default AdminInquiries;
