import React, { useState } from 'react';
import { LIMITS, SPLIT } from './settleCalc';
import useExpenseForm, { toAmount } from './useExpenseForm';
import { number, won } from '../group/expenseFormat';
import { toastError } from '../ui/feedback';

const formatAmountInput = (text) => (toAmount(text) ? number(toAmount(text)) : '');

const usePersonName = (people, onAdd) => {
    const [name, setName] = useState('');
    const add = (event) => {
        event.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;
        if (people.some((person) => person.name === trimmed)) return toastError('같은 이름이 이미 있어요.');
        if (people.length >= LIMITS.people) return toastError(`사람은 ${LIMITS.people}명까지 추가할 수 있어요.`);
        onAdd(trimmed);
        setName('');
    };
    return [name, setName, add];
};

/** 함께 정산할 사람 추가·빼기 */
export const PeopleForm = ({ people, onAdd, onRemove }) => {
    const [name, setName, add] = usePersonName(people, onAdd);
    return (
        <section className="settle-card">
            <h2>1. 함께한 사람</h2>
            <form className="settle-row" onSubmit={add}>
                <input value={name} maxLength={LIMITS.nameLength} placeholder="이름 (예: 민수)" aria-label="이름" onChange={(e) => setName(e.target.value)} />
                <button type="submit" className="settle-button is-primary">추가</button>
            </form>
            <ul className="settle-chips">{people.map((person) => (
                <li key={person.id}>{person.name}<button type="button" aria-label={`${person.name} 빼기`} onClick={() => onRemove(person)}>×</button></li>
            ))}</ul>
        </section>
    );
};

const ParticipantRow = ({ person, form, expense, toggle, changeCustom }) => {
    const checked = expense.participantIds.includes(person.id);
    return (
        <li className="settle-participant">
            <label><input type="checkbox" checked={checked} onChange={() => toggle(person.id)} />{person.name}</label>
            {form.split === SPLIT.CUSTOM && checked && (
                <input inputMode="numeric" placeholder="0" aria-label={`${person.name} 부담액`}
                    value={formatAmountInput(form.custom[person.id] || '')} onChange={(e) => changeCustom(person.id, e.target.value)} />
            )}
        </li>
    );
};

const SplitChoice = ({ form, change }) => (
    <div className="settle-split" role="group" aria-label="나누는 방법">
        {[[SPLIT.EQUAL, '똑같이 나누기'], [SPLIT.CUSTOM, '금액 직접 정하기']].map(([value, label]) => (
            <button key={value} type="button" className={form.split === value ? 'is-active' : ''} onClick={() => change('split', value)}>{label}</button>
        ))}
    </div>
);

const customLeft = (expense) => expense.amount - expense.participantIds.reduce((sum, id) => sum + (expense.custom[id] || 0), 0);

const ExpenseFields = ({ people, state }) => (
    <>
        <input value={state.form.title} maxLength={LIMITS.titleLength} placeholder="무엇에 썼나요? (예: 저녁 식사)" aria-label="지출 내용" onChange={(e) => state.change('title', e.target.value)} />
        <div className="settle-row">
            <input inputMode="numeric" placeholder="금액 (원)" aria-label="금액" value={formatAmountInput(state.form.amountText)} onChange={(e) => state.change('amountText', e.target.value)} />
            <select value={state.form.payerId} aria-label="낸 사람" onChange={(e) => state.change('payerId', e.target.value)}>
                <option value="">낸 사람</option>
                {people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
            </select>
        </div>
    </>
);

/** 지출 추가 (낸 사람, 나눌 사람, 나누는 방법) */
export const ExpenseForm = ({ people, expenseCount, onAdd }) => {
    const state = useExpenseForm(people, onAdd);
    const submit = (event) => {
        event.preventDefault();
        if (expenseCount >= LIMITS.expenses) return toastError(`지출은 ${LIMITS.expenses}건까지 적을 수 있어요.`);
        const error = state.submit();
        if (error) toastError(error);
    };
    if (people.length < 2) return <section className="settle-card"><h2>2. 쓴 돈</h2><p className="settle-hint">함께한 사람을 두 명 이상 추가하면 쓴 돈을 적을 수 있어요.</p></section>;
    return (
        <section className="settle-card">
            <h2>2. 쓴 돈</h2>
            <form className="settle-expense-form" onSubmit={submit}>
                <ExpenseFields people={people} state={state} />
                <SplitChoice form={state.form} change={state.change} />
                <ul className="settle-participants">{people.map((person) => <ParticipantRow key={person.id} person={person} {...state} />)}</ul>
                {state.form.split === SPLIT.CUSTOM && <p className="settle-hint">남은 금액: {won(customLeft(state.expense))}</p>}
                <button type="submit" className="settle-button is-primary is-wide">지출 추가</button>
            </form>
        </section>
    );
};
