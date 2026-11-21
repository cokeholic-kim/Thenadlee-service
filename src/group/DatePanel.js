import React, { useEffect, useMemo, useState } from 'react';
import { groupApi } from '../api/groupApi';
import { confirmPlan } from './CityPanel';
import { WEEKDAYS, formatPeriod, upcomingDates } from './groupFormat';

// 달력에 보여 줄 기간 (6주)
const VISIBLE_DAYS = 42;

const DayCell = ({ date, count, memberCount, selected, inRange, onToggle }) => {
    const ratio = memberCount ? count / memberCount : 0;
    return (
        <button type="button" className={`date-cell${selected ? ' is-mine' : ''}${inRange ? ' is-range' : ''}`} style={{ '--ratio': ratio }} onClick={() => onToggle(date)}
            aria-pressed={selected} title={`${date} · ${count}명 가능`}>
            <span className="date-cell__day">{Number(date.slice(8))}</span>
            <span className="date-cell__count">{count > 0 ? `${count}명` : ''}</span>
        </button>
    );
};

const DAY_MS = 24 * 60 * 60 * 1000;
const dayCount = (start, end) => Math.round((new Date(end) - new Date(start)) / DAY_MS) + 1;
const shortDate = (date) => `${Number(date.slice(5, 7))}월 ${Number(date.slice(8))}일`;

// 기간 고르기: 첫 번째로 누른 날 = 시작일, 두 번째 = 종료일 (앞 날짜를 누르면 시작일을 다시 정함)
const nextRange = (range, date) => {
    if (!range.start || range.end || date < range.start) return { start: date, end: '' };
    return { start: range.start, end: date };
};

const PeriodPicker = ({ group, run, picking, range, onStart, onCancel }) => {
    if (!picking) {
        return (
            <button type="button" className="group-button is-primary" onClick={onStart}>
                {group.startDate ? `기간 바꾸기 (지금: ${formatPeriod(group.startDate, group.endDate)})` : '달력에서 여행 기간 정하기'}
            </button>
        );
    }
    const ready = range.start && range.end;
    return (
        <div className="period-picker" role="status">
            <p>{!range.start ? '달력에서 출발일을 누르세요.' : !range.end ? `${shortDate(range.start)} 출발 · 도착일을 누르세요.`
                : `${shortDate(range.start)} ~ ${shortDate(range.end)} (${dayCount(range.start, range.end)}일)`}</p>
            <button type="button" className="group-button is-primary" disabled={!ready}
                onClick={() => run(() => confirmPlan(group, { startDate: range.start, endDate: range.end })).then((ok) => ok && onCancel())}>기간 확정</button>
            <button type="button" className="group-button" onClick={onCancel}>취소</button>
        </div>
    );
};

const usePeriodPicking = () => {
    const [picking, setPicking] = useState(false);
    const [range, setRange] = useState({ start: '', end: '' });
    const start = () => { setRange({ start: '', end: '' }); setPicking(true); };
    const cancel = () => setPicking(false);
    const pick = (date) => setRange((current) => nextRange(current, date));
    return { picking, range, start, cancel, pick };
};

const useMyDates = (availability) => {
    const savedMine = useMemo(() => availability.filter((day) => day.mine).map((day) => day.date), [availability]);
    const [mine, setMine] = useState(new Set(savedMine));
    useEffect(() => setMine(new Set(savedMine)), [savedMine]);
    const toggle = (date) => setMine((current) => { const next = new Set(current); next.has(date) ? next.delete(date) : next.add(date); return next; });
    return [mine, toggle];
};

const DateGrid = ({ dates, counts, memberCount, mine, period, onCell }) => (
    <div className="date-grid">
        {WEEKDAYS.map((weekday) => <span key={weekday} className="date-grid__weekday">{weekday}</span>)}
        {Array.from({ length: new Date(dates[0]).getDay() }, (_, index) => <span key={`blank-${index}`} />)}
        {dates.map((date) => <DayCell key={date} date={date} count={counts[date] || 0} memberCount={memberCount} selected={mine.has(date)}
            inRange={Boolean(period.start) && date >= period.start && date <= (period.end || period.start)} onToggle={onCell} />)}
    </div>
);

// 멤버마다 가능한 날을 체크 → 날짜별 가능 인원 표시, 방장은 같은 달력에서 기간을 골라 확정
const DatePanel = ({ group, run }) => {
    const dates = useMemo(() => upcomingDates(VISIBLE_DAYS), []);
    const counts = useMemo(() => Object.fromEntries(group.availability.map((day) => [day.date, day.count])), [group.availability]);
    const [mine, toggle] = useMyDates(group.availability);
    const period = usePeriodPicking();
    const memberCount = group.members.filter((member) => !member.isGuest).length;
    return (
        <section className="group-section">
            <h2>언제 갈까요?</h2>
            <p className="group-hint">{period.picking ? '여행 기간을 고르는 중이에요. 출발일과 도착일을 차례로 누르세요.' : '가능한 날을 누르고 저장하세요. 색이 진할수록 많은 멤버가 가능한 날이에요.'}</p>
            <DateGrid dates={dates} counts={counts} memberCount={memberCount} mine={mine} period={period.picking ? period.range : { start: group.startDate, end: group.endDate }}
                onCell={period.picking ? period.pick : toggle} />
            {!period.picking && <button type="button" className="group-button" onClick={() => run(() => groupApi.setAvailability(group.id, [...mine]))}>내 가능한 날 저장</button>}
            {group.myRole === 'OWNER' && <PeriodPicker group={group} run={run} picking={period.picking} range={period.range} onStart={period.start} onCancel={period.cancel} />}
        </section>
    );
};

export default DatePanel;
