import { useState } from 'react';
import { SPLIT, validateExpense } from './settleCalc';

// 나눌 사람은 "빠진 사람" 으로 기억 → 나중에 추가한 사람도 기본으로 함께 나눔
const EMPTY_FORM = { title: '', amountText: '', payerId: '', excludedIds: [], split: SPLIT.EQUAL, custom: {} };

export const toAmount = (text) => Number(String(text).replace(/[^0-9]/g, '')) || 0;

const toExpense = (form, people) => {
    const participantIds = people.map((person) => person.id).filter((id) => !form.excludedIds.includes(id));
    const custom = Object.fromEntries(participantIds.map((id) => [id, toAmount(form.custom[id] || '')]));
    return { title: form.title.trim(), amount: toAmount(form.amountText), payerId: Number(form.payerId) || null, participantIds, split: form.split, custom };
};

/** 지출 입력 상태와 확인·제출 */
const useExpenseForm = (people, onSubmit) => {
    const [form, setForm] = useState(EMPTY_FORM);
    const change = (field, value) => setForm((f) => ({ ...f, [field]: value }));
    const toggle = (id) => setForm((f) => ({ ...f, excludedIds: f.excludedIds.includes(id) ? f.excludedIds.filter((x) => x !== id) : [...f.excludedIds, id] }));
    const changeCustom = (id, value) => setForm((f) => ({ ...f, custom: { ...f.custom, [id]: value } }));
    const expense = toExpense(form, people);
    const submit = () => {
        const error = validateExpense(expense);
        if (error) return error;
        onSubmit(expense);
        setForm({ ...EMPTY_FORM, payerId: form.payerId });
        return null;
    };
    return { form, expense, change, toggle, changeCustom, submit };
};

export default useExpenseForm;
