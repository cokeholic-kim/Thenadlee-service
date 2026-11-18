import React, { useState } from 'react';
import { groupApi } from '../api/groupApi';
import { BASE_CURRENCY, CATEGORIES, number } from './expenseFormat';
import { toDateString } from './groupFormat';

// 한 줄에 "항목 금액" (금액은 맨 뒤, 쉼표·원 허용). 예: 신라제면 80,000
const LINE_PATTERN = /^(.+?)\s+([\d,]+)\s*원?$/;

export const parseLines = (text) => text.split('\n').map((line) => line.trim().replace(/^[-•·]\s*/, '')).filter(Boolean).map((line) => {
    const match = line.match(LINE_PATTERN);
    return match ? { title: match[1].trim(), amount: Number(match[2].replace(/,/g, '')), line } : { error: true, line };
});

const PeopleChecks = ({ group, memberIds, onChange }) => (
    <div className="quick-people">
        {group.members.map((member) => (
            <label key={member.id}>
                <input type="checkbox" checked={memberIds.includes(member.id)}
                    onChange={() => onChange(memberIds.includes(member.id) ? memberIds.filter((id) => id !== member.id) : [...memberIds, member.id])} />
                {member.nickName}
            </label>
        ))}
    </div>
);

const useQuickSave = (group, run) => {
    const [saving, setSaving] = useState(false);
    const save = async (rows, common) => {
        setSaving(true);
        let ok = true;
        for (const row of rows) {
            const payload = { ...common, title: row.title, amount: row.amount, currency: BASE_CURRENCY, exchangeRate: 1, splitType: 'EQUAL', memo: '' };
            ok = await run(() => groupApi.createExpense(group.id, payload));
            if (!ok) break;
        }
        setSaving(false);
        return ok;
    };
    return { saving, save };
};

/** 같은 분류·낸 사람·부담 인원의 지출 여러 개를 한 번에 기록 (똑같이 나누기) */
const QuickExpenseForm = ({ group, run }) => {
    const [text, setText] = useState('');
    const [common, setCommon] = useState({ category: 'FOOD', payerId: group.myMemberId, spentOn: group.startDate && group.startDate > toDateString(new Date()) ? group.startDate : toDateString(new Date()), memberIds: group.members.map((m) => m.id) });
    const { saving, save } = useQuickSave(group, run);
    const rows = parseLines(text);
    const valid = rows.filter((row) => !row.error);
    const set = (key, value) => setCommon((current) => ({ ...current, [key]: value }));
    const submit = async (e) => {
        e.preventDefault();
        if (rows.some((row) => row.error)) return alert('"항목 금액" 형식이 아닌 줄이 있어요.');
        if (await save(valid, common)) setText('');
        return undefined;
    };
    return (
        <form className="expense-form" onSubmit={submit}>
            <label>한 줄에 하나씩 "항목 금액"<textarea rows="6" value={text} onChange={(e) => setText(e.target.value)} placeholder={'신라제면 80,000\n두꺼비식당 92,000\n노키 115,500'} /></label>
            <p className="group-hint">{valid.length}개 · 합계 {number(valid.reduce((sum, row) => sum + row.amount, 0))}원{rows.some((row) => row.error) ? ` · 형식 오류: ${rows.filter((row) => row.error).map((row) => row.line).join(', ')}` : ''}</p>
            <div className="expense-form__row">
                <label>분류<select value={common.category} onChange={(e) => set('category', e.target.value)}>{CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}</select></label>
                <label>낸 사람<select value={common.payerId} onChange={(e) => set('payerId', Number(e.target.value))}>{group.members.map((m) => <option key={m.id} value={m.id}>{m.nickName}</option>)}</select></label>
                <label>날짜<input type="date" value={common.spentOn} onChange={(e) => set('spentOn', e.target.value)} required /></label>
            </div>
            <PeopleChecks group={group} memberIds={common.memberIds} onChange={(ids) => set('memberIds', ids)} />
            <div className="group-actions">
                <button type="submit" className="group-button is-primary" disabled={saving || valid.length === 0}>{saving ? '기록하는 중…' : `${valid.length}개 한 번에 기록`}</button>
            </div>
        </form>
    );
};

export default QuickExpenseForm;
