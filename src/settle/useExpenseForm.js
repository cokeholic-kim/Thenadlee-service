import { useState } from 'react';
import { BASE_CURRENCY } from '../group/expenseFormat';
import { roundAmount, SPLIT, toKrw, validateExpense } from './settleCalc';

// 나눌 사람은 "빠진 사람" 으로 기억 → 나중에 추가한 사람도 기본으로 함께 나눔
const EMPTY_FORM = { title: '', amountText: '', currency: BASE_CURRENCY, rateText: '', payerId: '', excludedIds: [], split: SPLIT.EQUAL, custom: {} };

/** 원화 입력: 숫자만 */
export const toAmount = (text) => Number(String(text).replace(/[^0-9]/g, '')) || 0;

/** 외화·환율 입력: 숫자와 소수점 (쉼표는 무시) */
export const toDecimal = (text) => Number(String(text).replace(/[^0-9.]/g, '')) || 0;

const parseMoney = (text, currency) => (currency === BASE_CURRENCY ? toAmount(text) : roundAmount(toDecimal(text)));

const toExpense = (form, people) => {
    const participantIds = people.map((person) => person.id).filter((id) => !form.excludedIds.includes(id));
    const custom = Object.fromEntries(participantIds.map((id) => [id, parseMoney(form.custom[id] || '', form.currency)]));
    const originalAmount = parseMoney(form.amountText, form.currency);
    const rate = form.currency === BASE_CURRENCY ? 1 : toDecimal(form.rateText);
    return {
        title: form.title.trim(), currency: form.currency, originalAmount, rate, amount: toKrw(originalAmount, rate),
        payerId: Number(form.payerId) || null, participantIds, split: form.split, custom,
    };
};

/** 지출 입력 상태와 확인·제출. rates: 통화별로 마지막에 쓴 환율 (통화를 고르면 미리 채움) */
const useExpenseForm = (people, onSubmit, rates = {}) => {
    const [form, setForm] = useState(EMPTY_FORM);
    const change = (field, value) => setForm((f) => ({ ...f, [field]: value }));
    const changeCurrency = (currency) => setForm((f) => ({ ...f, currency, rateText: rates[currency] ? String(rates[currency]) : '', custom: {} }));
    const toggle = (id) => setForm((f) => ({ ...f, excludedIds: f.excludedIds.includes(id) ? f.excludedIds.filter((x) => x !== id) : [...f.excludedIds, id] }));
    const changeCustom = (id, value) => setForm((f) => ({ ...f, custom: { ...f.custom, [id]: value } }));
    const expense = toExpense(form, people);
    const submit = () => {
        const error = validateExpense(expense);
        if (error) return error;
        onSubmit(expense);
        setForm({ ...EMPTY_FORM, payerId: form.payerId, currency: form.currency, rateText: form.rateText });
        return null;
    };
    return { form, expense, change, changeCurrency, toggle, changeCustom, submit };
};

export default useExpenseForm;
