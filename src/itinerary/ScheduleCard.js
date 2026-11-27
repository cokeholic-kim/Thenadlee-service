import React from 'react';
import { SITE_NAME } from '../config/site';

const ScheduleDay = ({ day }) => (
    <section className="schedule-card__day">
        <h3>{day.dayNo}일차{day.dateLabel && <small> {day.dateLabel}</small>}</h3>
        <ol>{day.rows.map((row) => (
            <li key={row.order}>
                {row.travelText && <p className="schedule-card__travel">↓ {row.travelText}</p>}
                <div className="schedule-card__row">
                    <span className="schedule-card__time">{row.arrive}–{row.leave}</span>
                    <strong>{row.order}. {row.spotName}</strong>
                    <span className="schedule-card__stay">{row.stayText}</span>
                </div>
                {row.memo && <p className="schedule-card__memo">{row.memo}</p>}
            </li>
        ))}</ol>
        {day.rows.length === 0 && <p className="schedule-card__empty">담은 장소가 없어요.</p>}
    </section>
);

/** 일정표 카드 (이미지로 저장·인쇄되는 영역): 일차별 도착–출발 시각, 장소, 머무는 시간, 이동 */
const ScheduleCard = React.forwardRef(({ schedule }, ref) => (
    <div className="schedule-card" ref={ref}>
        <p className="schedule-card__meta">{schedule.cityName} · {schedule.dayCount}일 · {schedule.travelMode}{schedule.period && ` · ${schedule.period}`}</p>
        <h2 className="schedule-card__title">{schedule.title}</h2>
        {schedule.days.map((day) => <ScheduleDay key={day.dayNo} day={day} />)}
        <p className="schedule-card__footer">{SITE_NAME} · 이동 시간은 길찾기 결과 기준이고 "약"은 어림값이에요</p>
    </div>
));

export default ScheduleCard;
