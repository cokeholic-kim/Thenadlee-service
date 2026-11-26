import { useEffect, useState } from 'react';
import { BASE_CURRENCY } from '../group/expenseFormat';

// 정산 계산기 입력은 이 기기의 브라우저에만 보관 (새로고침해도 이어서, 서버로 보내지 않음)
//   rates: 통화별로 마지막에 쓴 환율 (다음 지출에 미리 채움, 예전 저장값에는 없음)
const STORAGE_KEY = 'thenadlee.settle.v1';
const EMPTY = { people: [], expenses: [], nextId: 1, rates: {} };

const load = () => {
    try {
        const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
        return saved && Array.isArray(saved.people) && Array.isArray(saved.expenses) ? { ...EMPTY, ...saved, rates: saved.rates || {} } : EMPTY;
    } catch (error) {
        return EMPTY;
    }
};

const save = (value) => {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch (error) {
        // 저장소를 쓸 수 없으면(사생활 보호 모드 등) 이번 화면에서만 계산
    }
};

/** 사람·지출 목록과 바꾸는 함수 */
const useSettleDraft = () => {
    const [draft, setDraft] = useState(load);
    useEffect(() => save(draft), [draft]);
    const addPerson = (name) => setDraft((d) => ({ ...d, people: [...d.people, { id: d.nextId, name }], nextId: d.nextId + 1 }));
    const removePerson = (id) => setDraft((d) => ({ ...d, people: d.people.filter((person) => person.id !== id) }));
    const addExpense = (expense) => setDraft((d) => ({
        ...d, expenses: [...d.expenses, { ...expense, id: d.nextId }], nextId: d.nextId + 1,
        rates: expense.currency === BASE_CURRENCY ? d.rates : { ...d.rates, [expense.currency]: expense.rate },
    }));
    const removeExpense = (id) => setDraft((d) => ({ ...d, expenses: d.expenses.filter((expense) => expense.id !== id) }));
    const reset = () => setDraft(EMPTY);
    return { ...draft, addPerson, removePerson, addExpense, removeExpense, reset };
};

export default useSettleDraft;
