import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import usePageMeta from '../seo/usePageMeta';
import { PAGE_META } from '../seo/pageMeta';
import { confirmDialog, toast, toastError } from '../ui/feedback';
import { BASE_CURRENCY, money, won } from '../group/expenseFormat';
import { isKakaoShareAvailable, shareSettleResult } from '../share/kakaoShare';
import { balances, kakaoText, originalAmount, SPLIT, summaryText, transfers } from './settleCalc';
import useSettleDraft from './useSettleDraft';
import { ExpenseForm, PeopleForm } from './SettleForms';
import './SettleCalculator.scss';

const nameOf = (people, id) => people.find((person) => person.id === id)?.name || '';

// 외화 지출은 원래 금액과 원화로 바꾼 금액을 함께
const ExpenseAmount = ({ expense }) => (expense.currency && expense.currency !== BASE_CURRENCY
    ? <>{money(originalAmount(expense), expense.currency)} <small>(≈ {won(expense.amount)}, 1 {expense.currency} = {won(expense.rate)})</small></>
    : won(expense.amount));

const ExpenseList = ({ people, expenses, onRemove }) => (
    <ul className="settle-expenses">{expenses.map((expense) => (
        <li key={expense.id}>
            <div><strong>{expense.title}</strong> <ExpenseAmount expense={expense} />
                <span>{nameOf(people, expense.payerId)} 냄 · {expense.participantIds.length}명이 {expense.split === SPLIT.CUSTOM ? '정한 금액으로' : '똑같이'} 나눔</span>
            </div>
            <button type="button" className="settle-button is-small" onClick={() => onRemove(expense.id)}>삭제</button>
        </li>
    ))}</ul>
);

const BalanceTable = ({ rows }) => (
    <table className="settle-table">
        <thead><tr><th>이름</th><th>낸 돈</th><th>부담</th><th>정산</th></tr></thead>
        <tbody>{rows.map((row) => (
            <tr key={row.id}>
                <td>{row.name}</td><td>{won(row.paid)}</td><td>{won(row.owed)}</td>
                <td className={row.balance > 0 ? 'is-plus' : row.balance < 0 ? 'is-minus' : ''}>
                    {row.balance > 0 ? `${won(row.balance)} 받기` : row.balance < 0 ? `${won(-row.balance)} 보내기` : '끝'}
                </td>
            </tr>
        ))}</tbody>
    </table>
);

const shareResult = async (text) => {
    if (!navigator.share) return navigator.clipboard?.writeText(text).then(() => toast('정산 결과를 복사했어요.'));
    try {
        await navigator.share({ title: '정산 결과', text });
    } catch (error) {
        // 공유 창을 닫은 경우는 그대로 둠
    }
};

const copyResult = (text) => (navigator.clipboard
    ? navigator.clipboard.writeText(text).then(() => toast('정산 결과를 복사했어요.'), () => toastError('복사하지 못했어요.'))
    : toastError('이 브라우저에서는 복사할 수 없어요.'));

const sendKakao = (list, total) => shareSettleResult({ text: kakaoText(list, total), path: PAGE_META.settle.path })
    .catch((error) => toastError(error.message || '카카오톡으로 보내지 못했어요.'));

const ResultSection = ({ rows, list, total, expenses }) => (
    <section className="settle-card">
        <h2>3. 정산 결과 <small>총 {won(total)}</small></h2>
        <div className="settle-table-wrap"><BalanceTable rows={rows} /></div>
        <h3>{list.length ? '이렇게 보내면 끝나요' : '보낼 돈이 없어요 🎉'}</h3>
        <ul className="settle-transfers">{list.map((item) => <li key={`${item.from}-${item.to}`}><strong>{item.from} → {item.to}</strong>{won(item.amount)}</li>)}</ul>
        <div className="settle-actions">
            <button type="button" className="settle-button" onClick={() => copyResult(summaryText(rows, list, total, expenses))}>결과 복사</button>
            <button type="button" className="settle-button" onClick={() => shareResult(summaryText(rows, list, total, expenses))}>공유하기</button>
            {isKakaoShareAvailable() && <button type="button" className="settle-button is-kakao" onClick={() => sendKakao(list, total)}>카카오톡으로 보내기</button>}
        </div>
        <p className="settle-hint">공유할 때만 결과 글이 고른 앱(카카오톡 등)으로 전달되고, 서버에는 저장되지 않아요.</p>
    </section>
);

const useSettleActions = (draft) => ({
    removePerson: (person) => (draft.expenses.some((e) => e.payerId === person.id || e.participantIds.includes(person.id))
        ? toastError(`${person.name}님이 들어간 지출을 먼저 지워 주세요.`)
        : draft.removePerson(person.id)),
    reset: async () => (await confirmDialog('적은 사람과 지출을 모두 지우고 새로 시작할까요?', { confirmLabel: '새로 시작', danger: true })) && draft.reset(),
});

const IntroSection = ({ hasInput, onReset }) => (
    <div className="settle-intro">
        <h1>정산 계산기</h1>
        <p>함께 쓴 돈을 적으면 누가 누구에게 얼마를 보내면 되는지 가장 적은 횟수로 알려 드려요. 해외에서 쓴 돈은 통화와 환율을 적으면 원화로 바꿔 계산해요. 로그인 없이 쓸 수 있고, 적은 내용은 이 기기에만 저장돼요.</p>
        <p className="settle-hint">여행 일정과 함께 관리하려면 <Link to="/groups">모임</Link>의 정산 탭을 써 보세요.</p>
        {hasInput && <button type="button" className="settle-button is-small" onClick={onReset}>새로 시작</button>}
    </div>
);

// 정산 계산기 (/settle): 일정·모임 없이 쓰는 N빵 계산, 계산은 브라우저에서만
const SettleCalculatorPage = () => {
    usePageMeta(PAGE_META.settle);
    const draft = useSettleDraft();
    const actions = useSettleActions(draft);
    const rows = useMemo(() => balances(draft.people, draft.expenses), [draft.people, draft.expenses]);
    const total = draft.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    return (
        <PageLayout>
            <div className="settle-page">
                <IntroSection hasInput={draft.people.length > 0} onReset={actions.reset} />
                <PeopleForm people={draft.people} onAdd={draft.addPerson} onRemove={actions.removePerson} />
                <ExpenseForm people={draft.people} expenseCount={draft.expenses.length} rates={draft.rates} onAdd={draft.addExpense} />
                <ExpenseList people={draft.people} expenses={draft.expenses} onRemove={draft.removeExpense} />
                {draft.expenses.length > 0 && <ResultSection rows={rows} list={transfers(rows)} total={total} expenses={draft.expenses} />}
            </div>
        </PageLayout>
    );
};

export default SettleCalculatorPage;
