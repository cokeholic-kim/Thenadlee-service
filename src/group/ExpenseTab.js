import React, { useCallback, useEffect, useState } from 'react';
import { groupApi } from '../api/groupApi';
import { getApiErrorMessage } from '../util/apiError';
import ExpenseForm from './ExpenseForm';
import SettlementPanel from './SettlementPanel';
import SettlementReport from './SettlementReport';
import BudgetPanel from './BudgetPanel';
import QuickExpenseForm from './QuickExpenseForm';
import { categoryLabel, money, won } from './expenseFormat';
import { toastError, confirmDialog } from '../ui/feedback';

const POLL_INTERVAL_MS = 15000;

// 정산 탭 데이터: 지출·잔액·정산안 (보고 있는 동안 자동 갱신), run 은 변경 후 돌려받은 전체로 갱신
const useExpenseOverview = (groupId) => {
    const [overview, setOverview] = useState(null);
    const reload = useCallback(() => groupApi.expenses(groupId).then(setOverview).catch((error) => toastError(getApiErrorMessage(error))), [groupId]);
    useEffect(() => {
        reload();
        const timer = setInterval(() => { if (document.visibilityState === 'visible') reload(); }, POLL_INTERVAL_MS);
        return () => clearInterval(timer);
    }, [reload]);
    const run = async (action) => {
        try {
            setOverview(await action());
            return true;
        } catch (error) {
            toastError(getApiErrorMessage(error));
            return false;
        }
    };
    return { overview, run };
};

const ExpenseRow = ({ group, expense, run }) => {
    const [editing, setEditing] = useState(false);
    if (editing) {
        return <li className="expense-item is-editing"><ExpenseForm group={group} expense={expense} onCancel={() => setEditing(false)}
            onSubmit={async (payload) => { const ok = await run(() => groupApi.updateExpense(group.id, expense.id, payload)); if (ok) setEditing(false); return ok; }} /></li>;
    }
    return (
        <li className="expense-item">
            <div className="group-item__text">
                <strong>{expense.title} <span className="expense-amount">{won(expense.amountKrw)}</span></strong>
                <span>{expense.spentOn} · {categoryLabel(expense.category)} · {expense.payerName} 결제{expense.currency !== 'KRW' ? ` · ${money(expense.amount, expense.currency)} (환율 ${expense.exchangeRate})` : ''}</span>
                <span>{expense.shares.map((share) => `${share.name} ${won(share.shareKrw)}`).join(', ')}{expense.memo ? ` · ${expense.memo}` : ''}</span>
            </div>
            {expense.canEdit && <button type="button" className="group-button is-small" onClick={() => setEditing(true)}>수정</button>}
            {expense.canEdit && <button type="button" className="group-button is-small is-danger"
                onClick={async () => await confirmDialog('이 지출을 지울까요?') && run(() => groupApi.deleteExpense(group.id, expense.id))}>삭제</button>}
        </li>
    );
};

const INPUT_MODES = [
    { value: 'single', label: '하나씩 자세히' },
    { value: 'quick', label: '여러 개 한 번에' },
];

const ExpenseInput = ({ group, run }) => {
    const [mode, setMode] = useState('single');
    return (
        <section className="group-section">
            <div className="report-toolbar">
                <h2>지출 기록</h2>
                {INPUT_MODES.map((item) => <button key={item.value} type="button" className={`group-button is-small${mode === item.value ? ' is-active' : ''}`} onClick={() => setMode(item.value)}>{item.label}</button>)}
            </div>
            <p className="group-hint">누가 얼마를 냈는지 남기면 정산서가 자동으로 만들어져요. 1원 단위 나머지는 낸 사람이 부담하고, 외화는 입력한 환율로 원화로 바꿔 계산해요.</p>
            {mode === 'single'
                ? <ExpenseForm group={group} onSubmit={(payload) => run(() => groupApi.createExpense(group.id, payload))} />
                : <QuickExpenseForm group={group} run={run} />}
        </section>
    );
};

// 정산 탭: 정산서(이미지·텍스트), 송금 체크, 지출 기록·목록
const ExpenseTab = ({ group, run: runGroup }) => {
    const { overview, run } = useExpenseOverview(group.id);
    if (!overview) return <p>불러오는 중…</p>;
    return (
        <>
            <BudgetPanel group={group} run={runGroup} spentKrw={overview.totalKrw} />
            <SettlementReport group={group} overview={overview} />
            <SettlementPanel group={group} overview={overview} run={run} />
            <ExpenseInput group={group} run={run} />
            <section className="group-section">
                <h2>지출 목록 · 총 {won(overview.totalKrw)}</h2>
                {overview.categories.length > 0 && <p className="group-hint">{overview.categories.map((item) => `${categoryLabel(item.category)} ${won(item.totalKrw)}`).join(' · ')}</p>}
                {overview.expenses.length === 0 && <p className="group-empty">아직 기록한 지출이 없어요.</p>}
                <ul className="group-items">{overview.expenses.map((expense) => <ExpenseRow key={expense.id} group={group} expense={expense} run={run} />)}</ul>
            </section>
        </>
    );
};

export default ExpenseTab;
