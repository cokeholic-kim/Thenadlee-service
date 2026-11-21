import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import { createInquiry, deleteInquiry, fetchMyInquiries } from '../api/inquiryApi';
import { getApiErrorMessage } from '../util/apiError';
import { confirmDialog, toast, toastError } from '../ui/feedback';
import usePageMeta from '../seo/usePageMeta';
import { PAGE_META } from '../seo/pageMeta';
import { INQUIRY_CATEGORIES, INQUIRY_LIMITS, INQUIRY_STATUS, categoryLabelOf, formatInquiryDate } from './inquiryLabels';
import './Inquiry.scss';

const PAGE_PATH = '/inquiries';
const EMPTY_FORM = { category: '', title: '', content: '' };

const InquiryForm = ({ onSubmit }) => {
    const [form, setForm] = useState(EMPTY_FORM);
    const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
    const submit = async (e) => { e.preventDefault(); if (await onSubmit(form)) setForm(EMPTY_FORM); };
    return (
        <form className="inquiry-form" onSubmit={submit}>
            <label htmlFor="inquiryCategory">종류</label>
            <select id="inquiryCategory" value={form.category} onChange={set('category')} required>
                <option value="">골라 주세요</option>
                {INQUIRY_CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
            <label htmlFor="inquiryTitle">제목</label>
            <input id="inquiryTitle" value={form.title} onChange={set('title')} maxLength={INQUIRY_LIMITS.title} required />
            <label htmlFor="inquiryContent">내용 <span>{form.content.length} / {INQUIRY_LIMITS.content}</span></label>
            <textarea id="inquiryContent" rows="6" value={form.content} onChange={set('content')} maxLength={INQUIRY_LIMITS.content} required
                placeholder="어떤 화면에서 무엇을 하다가 생긴 일인지 적어 주시면 빨리 도와드릴 수 있어요." />
            <p className="inquiry-form__hint">비밀번호·복구 코드 같은 정보는 적지 마세요. 답변은 이 화면에서 확인할 수 있어요.</p>
            <button type="submit" className="inquiry-button is-primary">문의 남기기</button>
        </form>
    );
};

const InquiryItem = ({ item, onDelete }) => (
    <li className={`inquiry-item${item.isNewAnswer ? ' is-new' : ''}`}>
        <details open={item.isNewAnswer}>
            <summary>
                <span className={`inquiry-status is-${item.status.toLowerCase()}`}>{INQUIRY_STATUS[item.status]}</span>
                {item.isNewAnswer && <span className="inquiry-new">새 답변</span>}
                <strong>{item.title}</strong>
                <em>{categoryLabelOf(item.category)} · {formatInquiryDate(item.createdAt)}</em>
            </summary>
            <p className="inquiry-item__content">{item.content}</p>
            {item.answer
                ? <div className="inquiry-answer"><strong>더 나들이 답변</strong><span>{formatInquiryDate(item.answeredAt)}</span><p>{item.answer}</p></div>
                : <p className="inquiry-item__waiting">아직 답변 전이에요. 확인하는 대로 답변을 남길게요.</p>}
            <button type="button" className="inquiry-button is-danger" onClick={() => onDelete(item)}>문의 지우기</button>
        </details>
    </li>
);

const useMyInquiries = (enabled) => {
    const [items, setItems] = useState(null);
    const run = useCallback(async (action, message) => {
        try { setItems(await action()); if (message) toast(message); return true; } catch (error) { toastError(getApiErrorMessage(error)); return false; }
    }, []);
    useEffect(() => { if (enabled) run(fetchMyInquiries); }, [enabled, run]);
    const submit = (form) => run(() => createInquiry(form), '문의를 남겼어요. 답변이 달리면 이 화면과 마이페이지에 표시돼요.');
    const remove = async (item) => {
        if (await confirmDialog(`"${item.title}" 문의를 지울까요? 답변도 함께 지워져요.`, { title: '문의 지우기', confirmLabel: '지우기' })) run(() => deleteInquiry(item.id), '문의를 지웠어요.');
    };
    return { items, submit, remove };
};

const useLoginRequired = () => {
    const navigate = useNavigate();
    const { checked, isLogin } = useSelector((state) => state.logincheck);
    useEffect(() => {
        if (checked && !isLogin) navigate(`/login?next=${encodeURIComponent(PAGE_PATH)}`, { replace: true });
    }, [checked, isLogin, navigate]);
    return isLogin;
};

// 고객 문의 (/inquiries): 로그인한 회원이 남기고, 관리자 답변을 이 화면에서 확인 (본인 문의만 보임)
const InquiryPage = () => {
    usePageMeta(PAGE_META.inquiries);
    const isLogin = useLoginRequired();
    const { items, submit, remove } = useMyInquiries(isLogin);
    return (
        <PageLayout>
            <div className="inquiry-page">
                <h1>고객 문의</h1>
                <p className="inquiry-page__intro">이용하다 막힌 점, 오류, 바라는 기능을 알려 주세요. 남긴 문의와 답변은 본인과 운영자만 볼 수 있어요.</p>
                <section className="inquiry-card"><h2>새 문의</h2><InquiryForm onSubmit={submit} /></section>
                <section className="inquiry-card">
                    <h2>내 문의</h2>
                    {items === null && <p>불러오는 중…</p>}
                    {items?.length === 0 && <p className="inquiry-empty">아직 남긴 문의가 없어요.</p>}
                    {items?.length > 0 && <ul className="inquiry-list">{items.map((item) => <InquiryItem key={item.id} item={item} onDelete={remove} />)}</ul>}
                </section>
            </div>
        </PageLayout>
    );
};

export default InquiryPage;
