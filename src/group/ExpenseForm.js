import React, { useState } from 'react';
import { BASE_CURRENCY, CATEGORIES, CURRENCIES } from './expenseFormat';
import { toDateString } from './groupFormat';

const AMOUNT_DIGITS = 2;

// 새 지출 기본값: 낸 사람은 나, 부담은 모두 균등
const emptyForm = (group) => ({
    title: '', amount: '', currency: BASE_CURRENCY, exchangeRate: '', category: 'FOOD', memo: '',
    payerId: group.myMemberId, spentOn: group.startDate && group.startDate > toDateString(new Date()) ? group.startDate : toDateString(new Date()),
    splitType: 'EQUAL', memberIds: group.members.map((member) => member.id), shares: {},
});

// 고칠 때는 저장된 원화 부담액을 원래 통화로 되돌려 채움
const toForm = (expense) => ({
    title: expense.title, amount: expense.amount, currency: expense.currency, exchangeRate: expense.currency === BASE_CURRENCY ? '' : expense.exchangeRate,
    category: expense.category, memo: expense.memo || '', payerId: expense.payerId, spentOn: expense.spentOn, splitType: expense.splitType,
    memberIds: expense.shares.map((share) => share.memberId),
    shares: Object.fromEntries(expense.shares.map((share) => [share.memberId, Number((share.shareKrw / expense.exchangeRate).toFixed(AMOUNT_DIGITS))])),
});

const toPayload = (form) => ({
    ...form,
    amount: Number(form.amount),
    exchangeRate: form.currency === BASE_CURRENCY ? 1 : Number(form.exchangeRate),
    shares: Object.entries(form.shares).filter(([, amount]) => Number(amount) > 0).map(([memberId, amount]) => ({ memberId: Number(memberId), amount: Number(amount) })),
});

const SplitFields = ({ group, form, set }) => {
    const toggle = (id) => set('memberIds', form.memberIds.includes(id) ? form.memberIds.filter((value) => value !== id) : [...form.memberIds, id]);
    const customSum = Object.values(form.shares).reduce((sum, value) => sum + Number(value || 0), 0);
    return (
        <fieldset className="expense-split">
            <legend>
                <label><input type="radio" checked={form.splitType === 'EQUAL'} onChange={() => set('splitType', 'EQUAL')} /> 똑같이 나누기</label>
                <label><input type="radio" checked={form.splitType === 'CUSTOM'} onChange={() => set('splitType', 'CUSTOM')} /> 사람별 금액 입력</label>
            </legend>
            {group.members.map((member) => (
                <label key={member.id} className="expense-split__row">
                    {form.splitType === 'EQUAL'
                        ? <input type="checkbox" checked={form.memberIds.includes(member.id)} onChange={() => toggle(member.id)} />
                        : <input type="number" min="0" step="any" value={form.shares[member.id] ?? ''} placeholder="0" onChange={(e) => set('shares', { ...form.shares, [member.id]: e.target.value })} />}
                    <span>{member.nickName}{member.isGuest ? ' (이름만)' : ''}</span>
                </label>
            ))}
            {form.splitType === 'CUSTOM' && <p className="group-hint">입력 합계 {customSum.toLocaleString('ko-KR')} / 지출 {Number(form.amount || 0).toLocaleString('ko-KR')} {form.currency}</p>}
        </fieldset>
    );
};

const AmountFields = ({ form, set }) => (
    <div className="expense-form__row">
        <label>금액<input type="number" min="0" step="any" value={form.amount} onChange={(e) => set('amount', e.target.value)} required /></label>
        <label>통화
            <select value={form.currency} onChange={(e) => set('currency', e.target.value)}>{CURRENCIES.map((code) => <option key={code} value={code}>{code}</option>)}</select>
        </label>
        {form.currency !== BASE_CURRENCY && (
            <label>환율 (1 {form.currency} = ?원)<input type="number" min="0" step="any" value={form.exchangeRate} onChange={(e) => set('exchangeRate', e.target.value)} required /></label>
        )}
    </div>
);

/** 지출 입력·수정 폼. onSubmit(payload) 가 성공(true)하면 새 입력은 비움 */
const ExpenseForm = ({ group, expense, onSubmit, onCancel }) => {
    const [form, setForm] = useState(expense ? toForm(expense) : emptyForm(group));
    const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
    const submit = async (e) => {
        e.preventDefault();
        if (await onSubmit(toPayload(form)) && !expense) setForm(emptyForm(group));
    };
    return (
        <form className="expense-form" onSubmit={submit}>
            <label>내용<input value={form.title} onChange={(e) => set('title', e.target.value)} maxLength="100" placeholder="예: 첫날 저녁 흑돼지" required /></label>
            <AmountFields form={form} set={set} />
            <div className="expense-form__row">
                <label>낸 사람<select value={form.payerId} onChange={(e) => set('payerId', Number(e.target.value))}>{group.members.map((member) => <option key={member.id} value={member.id}>{member.nickName}</option>)}</select></label>
                <label>날짜<input type="date" value={form.spentOn} onChange={(e) => set('spentOn', e.target.value)} required /></label>
                <label>분류<select value={form.category} onChange={(e) => set('category', e.target.value)}>{CATEGORIES.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}</select></label>
            </div>
            <SplitFields group={group} form={form} set={set} />
            <label>메모 (선택)<input value={form.memo} onChange={(e) => set('memo', e.target.value)} maxLength="200" /></label>
            <div className="group-actions">
                <button type="submit" className="group-button is-primary">{expense ? '수정 저장' : '지출 기록'}</button>
                {onCancel && <button type="button" className="group-button" onClick={onCancel}>취소</button>}
            </div>
        </form>
    );
};

export default ExpenseForm;
