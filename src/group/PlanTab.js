import React from 'react';
import CityPanel from './CityPanel';
import DatePanel from './DatePanel';
import WishPanel from './WishPanel';
import PlanPanel from './PlanPanel';
import ChecklistPanel from './ChecklistPanel';
import { formatPeriod } from './groupFormat';

// 계획 단계별 진행 상태 (맨 위 요약과 끝난 칸 접기에 함께 사용)
const planSteps = (group) => {
    const checklist = group.board.checklist;
    const checkDone = checklist.filter((item) => item.done).length;
    return [
        { id: 'plan-city', label: '여행지', done: Boolean(group.city), value: group.city?.displayName || '미정', Panel: CityPanel },
        { id: 'plan-date', label: '날짜', done: Boolean(group.startDate), value: group.startDate ? formatPeriod(group.startDate, group.endDate) : '미정', Panel: DatePanel },
        { id: 'plan-wish', label: '가고 싶은 곳', done: group.wishes.length > 0, value: `${group.wishes.length}곳`, Panel: WishPanel, keepOpen: true },
        { id: 'plan-route', label: '동선', done: Boolean(group.plan), value: group.plan ? '확정' : '미정', Panel: PlanPanel, keepOpen: true },
        { id: 'plan-check', label: '준비물', done: checklist.length > 0 && checkDone === checklist.length, value: `${checkDone}/${checklist.length}`, Panel: ChecklistPanel, keepOpen: true },
    ];
};

// 요약의 단계를 누르면 그 칸으로 이동 (접혀 있으면 펼침)
const goToStep = (id) => {
    const element = document.getElementById(id);
    if (!element) return;
    if (element.tagName === 'DETAILS') element.open = true;
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const PlanProgress = ({ steps }) => (
    <nav className="plan-progress" aria-label="계획 진행 상황">
        {steps.map((step) => (
            <button key={step.id} type="button" className={`plan-progress__step${step.done ? ' is-done' : ''}`} onClick={() => goToStep(step.id)}>
                <span className="plan-progress__mark" aria-hidden="true">{step.done ? '✓' : '•'}</span>
                <span className="plan-progress__label">{step.label}</span>
                <span className="plan-progress__value">{step.value}</span>
            </button>
        ))}
    </nav>
);

// 끝난 단계(여행지·날짜)는 결과만 보이게 접어 두고, 눌러서 펼치면 바꿀 수 있음
const StepSection = ({ step, group, run }) => {
    const { Panel } = step;
    if (!step.done || step.keepOpen) return <div id={step.id} className="plan-step"><Panel group={group} run={run} /></div>;
    return (
        <details id={step.id} className="plan-step plan-step--done">
            <summary><span aria-hidden="true">✓</span> {step.label} · <strong>{step.value}</strong><em>바꾸기</em></summary>
            <Panel group={group} run={run} />
        </details>
    );
};

// 모임 "계획" 탭: 진행 요약 + 단계별 칸
const PlanTab = ({ group, run }) => {
    const steps = planSteps(group);
    return (
        <>
            <PlanProgress steps={steps} />
            {steps.map((step) => <StepSection key={step.id} step={step} group={group} run={run} />)}
        </>
    );
};

export default PlanTab;
