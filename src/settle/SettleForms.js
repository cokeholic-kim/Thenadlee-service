import React, { useState } from 'react';
import { LIMITS, roundAmount, SPLIT } from './settleCalc';
import useExpenseForm, { toAmount } from './useExpenseForm';
import { BASE_CURRENCY, CURRENCIES, money, number, won } from '../group/expenseFormat';
import { toastError } from '../ui/feedback';

// 원화는 쉼표를 넣어 보여 주고, 외화·환율은 소수점을 쓸 수 있게 숫자·점만 남김
const formatAmountInput = (text) => (toAmount(text) ? number(toAmount(text)) : '');
const formatDecimalInput = (text) => String(text).replace(/[^0-9.]/g, '');
const formatMoneyInput = (text, currency) => (currency === BASE_CURRENCY ? formatAmountInput(text) : formatDecimalInput(text));
const moneyInputMode = (currency) => (currency === BASE_CURRENCY ? 'numeric' : 'decimal');

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
                <input inputMode={moneyInputMode(form.currency)} placeholder="0" aria-label={`${person.name} 부담액 (${form.currency})`}
                    value={formatMoneyInput(form.custom[person.id] || '', form.currency)} onChange={(e) => changeCustom(person.id, e.target.value)} />
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

const customLeft = (expense) => roundAmount(expense.originalAmount - expense.participantIds.reduce((sum, id) => sum + (expense.custom[id] || 0), 0));

// 외화: "1 USD = ?원" 환율과 원화로 바꾼 금액 미리 보기 (환율은 카드 명세서·환전 영수증 값을 적으면 정확)
const RateFields = ({ state }) => (
    <div className="settle-rate">
        <label>1 {state.form.currency} =
            <input inputMode="decimal" placeholder="환율" aria-label={`환율 (1 ${state.form.currency} = ?원)`} value={formatDecimalInput(state.form.rateText)}
                onChange={(e) => state.change('rateText', e.target.value)} />원
        </label>
        {state.expense.amount > 0 && <span>≈ {won(state.expense.amount)}</span>}
    </div>
);

const AmountRow = ({ state }) => (
    <div className="settle-row">
        <input inputMode={moneyInputMode(state.form.currency)} placeholder={`금액 (${state.form.currency === BASE_CURRENCY ? '원' : state.form.currency})`} aria-label="금액"
            value={formatMoneyInput(state.form.amountText, state.form.currency)} onChange={(e) => state.change('amountText', e.target.value)} />
        <select className="settle-currency" value={state.form.currency} aria-label="통화" onChange={(e) => state.changeCurrency(e.target.value)}>
            {CURRENCIES.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
        </select>
    </div>
);

const ExpenseFields = ({ people, state }) => (
    <>
        <input value={state.form.title} maxLength={LIMITS.titleLength} placeholder="무엇에 썼나요? (예: 저녁 식사)" aria-label="지출 내용" onChange={(e) => state.change('title', e.target.value)} />
        <AmountRow state={state} />
        {state.form.currency !== BASE_CURRENCY && <RateFields state={state} />}
        <select value={state.form.payerId} aria-label="낸 사람" onChange={(e) => state.change('payerId', e.target.value)}>
            <option value="">낸 사람</option>
            {people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
        </select>
    </>
);

/** 지출 추가 (낸 사람, 나눌 사람, 나누는 방법) */
export const ExpenseForm = ({ people, expenseCount, rates, onAdd }) => {
    const state = useExpenseForm(people, onAdd, rates);
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
                {state.form.split === SPLIT.CUSTOM && <p className="settle-hint">남은 금액: {money(customLeft(state.expense), state.form.currency)}</p>}
                <button type="submit" className="settle-button is-primary is-wide">지출 추가</button>
            </form>
        </section>
    );
};
