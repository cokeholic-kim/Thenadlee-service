import React, { useEffect, useMemo, useState } from 'react';
import { groupApi } from '../api/groupApi';
import { confirmPlan } from './CityPanel';
import { WEEKDAYS, upcomingDates } from './groupFormat';

// 달력에 보여 줄 기간 (6주)
const VISIBLE_DAYS = 42;

const DayCell = ({ date, count, memberCount, selected, onToggle }) => {
    const ratio = memberCount ? count / memberCount : 0;
    return (
        <button type="button" className={`date-cell${selected ? ' is-mine' : ''}`} style={{ '--ratio': ratio }} onClick={() => onToggle(date)}
            aria-pressed={selected} title={`${date} · ${count}명 가능`}>
            <span className="date-cell__day">{Number(date.slice(8))}</span>
            <span className="date-cell__count">{count > 0 ? `${count}명` : ''}</span>
        </button>
    );
};

const PeriodForm = ({ group, run }) => {
    const [period, setPeriod] = useState({ startDate: group.startDate || '', endDate: group.endDate || '' });
    const onSubmit = (e) => { e.preventDefault(); run(() => confirmPlan(group, period)); };
    return (
        <form className="group-form group-form--row" onSubmit={onSubmit}>
            <input type="date" value={period.startDate} onChange={(e) => setPeriod({ ...period, startDate: e.target.value })} required aria-label="시작일" />
            <span>~</span>
            <input type="date" value={period.endDate} onChange={(e) => setPeriod({ ...period, endDate: e.target.value })} required aria-label="종료일" />
            <button type="submit" className="group-button is-primary">기간 확정</button>
        </form>
    );
};

// 멤버마다 가능한 날을 체크 → 날짜별 가능 인원 표시, 방장은 기간 확정
const DatePanel = ({ group, run }) => {
    const dates = useMemo(() => upcomingDates(VISIBLE_DAYS), []);
    const counts = useMemo(() => Object.fromEntries(group.availability.map((day) => [day.date, day.count])), [group.availability]);
    const savedMine = useMemo(() => group.availability.filter((day) => day.mine).map((day) => day.date), [group.availability]);
    const [mine, setMine] = useState(new Set(savedMine));
    useEffect(() => setMine(new Set(savedMine)), [savedMine]);
    const toggle = (date) => setMine((current) => { const next = new Set(current); next.has(date) ? next.delete(date) : next.add(date); return next; });
    const leading = new Date(dates[0]).getDay();
    return (
        <section className="group-section">
            <h2>언제 갈까요?</h2>
            <p className="group-hint">가능한 날을 누르고 저장하세요. 색이 진할수록 많은 멤버가 가능한 날이에요.</p>
            <div className="date-grid">
                {WEEKDAYS.map((weekday) => <span key={weekday} className="date-grid__weekday">{weekday}</span>)}
                {Array.from({ length: leading }, (_, index) => <span key={`blank-${index}`} />)}
                {dates.map((date) => <DayCell key={date} date={date} count={counts[date] || 0} memberCount={group.members.filter((member) => !member.isGuest).length} selected={mine.has(date)} onToggle={toggle} />)}
            </div>
            <button type="button" className="group-button" onClick={() => run(() => groupApi.setAvailability(group.id, [...mine]))}>내 가능한 날 저장</button>
            {group.myRole === 'OWNER' && <PeriodForm key={`${group.startDate}-${group.endDate}`} group={group} run={run} />}
        </section>
    );
};

export default DatePanel;
