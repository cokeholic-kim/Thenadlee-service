import React, { useState } from 'react';
import { groupApi } from '../api/groupApi';
import { number } from './expenseFormat';

// 진행 막대가 넘쳐도 100% 까지만 그림
const FULL_PERCENT = 100;

const BudgetForm = ({ group, run, onDone }) => {
    const [value, setValue] = useState(group.board.budgetKrw ?? '');
    const submit = async (e) => {
        e.preventDefault();
        if (await run(() => groupApi.setBudget(group.id, value === '' ? null : Number(value)))) onDone();
    };
    return (
        <form className="budget-form" onSubmit={submit}>
            <input type="number" min="0" step="1000" value={value} onChange={(e) => setValue(e.target.value)} placeholder="예: 500000" aria-label="예산(원)" />
            <button type="submit" className="group-button is-small is-primary">저장</button>
            <button type="button" className="group-button is-small" onClick={onDone}>취소</button>
        </form>
    );
};

const BudgetSummary = ({ budget, spent, people }) => {
    const percent = budget > 0 ? Math.round((spent / budget) * FULL_PERCENT) : 0;
    const remaining = budget - spent;
    return (
        <>
            <div className={`budget-bar${percent > FULL_PERCENT ? ' is-over' : ''}`}><span style={{ width: `${Math.min(percent, FULL_PERCENT)}%` }} /></div>
            <p className="budget-text">
                <strong>{number(spent)}원</strong> / {number(budget)}원 ({percent}%) · {remaining >= 0 ? `${number(remaining)}원 남음` : `${number(-remaining)}원 초과`}
                {people > 0 && <span> · 1인당 예산 {number(Math.round(budget / people))}원</span>}
            </p>
        </>
    );
};

// 정산 탭: 방장이 정한 예산과 지금까지 쓴 돈 (보기는 멤버, 수정은 방장)
const BudgetPanel = ({ group, run, spentKrw }) => {
    const [editing, setEditing] = useState(false);
    const isOwner = group.myRole === 'OWNER';
    const budget = group.board.budgetKrw;
    if (budget === null && !isOwner) return null;
    return (
        <section className="group-section">
            <div className="report-toolbar">
                <h2>여행 예산</h2>
                {isOwner && !editing && <button type="button" className="group-button is-small" onClick={() => setEditing(true)}>{budget === null ? '예산 정하기' : '수정'}</button>}
            </div>
            {editing && <BudgetForm group={group} run={run} onDone={() => setEditing(false)} />}
            {!editing && budget === null && <p className="group-hint">예산을 정하면 지금까지 쓴 돈이 예산의 몇 %인지 보여 줘요. 비워서 저장하면 예산이 지워져요.</p>}
            {!editing && budget !== null && <BudgetSummary budget={budget} spent={spentKrw} people={group.members.length} />}
        </section>
    );
};

export default BudgetPanel;
