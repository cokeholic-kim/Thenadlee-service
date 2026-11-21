import React, { useState } from 'react';
import { groupApi } from '../api/groupApi';
import { confirmDialog } from '../ui/feedback';

// trip_checklist.title 길이와 같음
const TITLE_MAX_LENGTH = 100;

const AssigneeSelect = ({ group, value, onChange, label }) => (
    <select className="group-select" value={value ?? ''} aria-label={label} onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}>
        <option value="">담당자 없음</option>
        {group.members.map((member) => <option key={member.id} value={member.id}>{member.nickName}</option>)}
    </select>
);

const ChecklistItem = ({ group, item, run }) => {
    const save = (changes) => run(() => groupApi.updateChecklist(group.id, item.id, { title: item.title, assigneeId: item.assigneeId, done: item.done, ...changes }));
    return (
        <li className={`checklist-item${item.done ? ' is-done' : ''}`}>
            <label>
                <input type="checkbox" checked={item.done} onChange={() => save({ done: !item.done })} />
                <span>{item.title}</span>
            </label>
            <AssigneeSelect group={group} value={item.assigneeId} label={`${item.title} 담당자`} onChange={(assigneeId) => save({ assigneeId })} />
            {item.canDelete && <button type="button" className="group-button is-small is-danger" aria-label={`${item.title} 삭제`}
                onClick={async () => await confirmDialog(`"${item.title}"을(를) 지울까요?`) && run(() => groupApi.deleteChecklist(group.id, item.id))}>삭제</button>}
        </li>
    );
};

const ChecklistForm = ({ group, run }) => {
    const [title, setTitle] = useState('');
    const [assigneeId, setAssigneeId] = useState(null);
    const submit = async (e) => {
        e.preventDefault();
        if (title.trim() && await run(() => groupApi.addChecklist(group.id, { title: title.trim(), assigneeId, done: false }))) {
            setTitle('');
            setAssigneeId(null);
        }
    };
    return (
        <form className="checklist-form" onSubmit={submit}>
            <input value={title} maxLength={TITLE_MAX_LENGTH} onChange={(e) => setTitle(e.target.value)} placeholder="예: 숙소 예약, 우산 챙기기" aria-label="할 일" />
            <AssigneeSelect group={group} value={assigneeId} label="새 할 일 담당자" onChange={setAssigneeId} />
            <button type="submit" className="group-button is-primary" disabled={!title.trim()}>추가</button>
        </form>
    );
};

// 준비물·할 일: 멤버 누구나 쓰고 완료·담당 지정, 삭제는 쓴 사람·방장
const ChecklistPanel = ({ group, run }) => {
    const items = group.board.checklist;
    const doneCount = items.filter((item) => item.done).length;
    return (
        <section className="group-section">
            <h2>준비물·할 일 {items.length > 0 && <span className="group-hint">{doneCount} / {items.length} 완료</span>}</h2>
            <ChecklistForm group={group} run={run} />
            {items.length === 0 && <p className="group-empty">숙소 예약, 렌터카, 챙길 물건처럼 함께 할 일을 적어 보세요.</p>}
            <ul className="checklist">{items.map((item) => <ChecklistItem key={item.id} group={group} item={item} run={run} />)}</ul>
        </section>
    );
};

export default ChecklistPanel;
