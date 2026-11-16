import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveDay } from '../modules/add';
import { shortDateLabel } from './tripDates';
import './DayTabs.scss';

// 일차 선택 탭. 여행 기간을 고르면 일수만큼 탭이 생김
const DayTabs = () => {
    const dispatch = useDispatch();
    const { days, activeDay } = useSelector((state) => state.add);
    const startDate = useSelector((state) => state.itinerary.startDate);

    return (
        <div className="day-tabs">
            <div className="day-tabs__list" role="tablist" aria-label="여행 일차">
                {days.map((spots, index) => (
                    <button key={index} type="button" role="tab" aria-selected={index === activeDay}
                        className={index === activeDay ? 'active' : ''} onClick={() => dispatch(setActiveDay(index))}>
                        <span className="day-tabs__day">{index + 1}일차</span>
                        <span className="day-tabs__meta">{shortDateLabel(startDate, index) || `${spots.length}곳`}</span>
                    </button>
                ))}
            </div>
            {days.length === 1 && !startDate && (
                <p className="day-tabs__hint">여행 기간을 고르면 날짜별로 일정을 나눌 수 있어요.</p>
            )}
        </div>
    );
};

export default DayTabs;
