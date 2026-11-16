import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import {ko} from "date-fns/esm/locale";
import './Calendar.scss'
import "react-datepicker/dist/react-datepicker.css";
import { formatDate, parseDate } from "../itinerary/tripDates";

// 여행 기간 선택. 저장된 일정을 불러오면 그 기간이 달력에 표시됨
const Calendar = ({ startDate, endDate, onChangeDates }) => {
  const [range, setRange] = useState([parseDate(startDate), parseDate(endDate)]);

  useEffect(() => {
    setRange([parseDate(startDate), parseDate(endDate)]);
  }, [startDate, endDate]);

  // 시작일만 고른 중간 상태는 달력에만 반영하고, 종료일까지 고르면 일정에 반영
  const onChange = (dates) => {
    const [start, end] = dates;
    setRange([start, end]);
    if (start && end) onChangeDates(formatDate(start), formatDate(end));
  };

  return (
    <>
        <p className="calP" >여행기간</p>
        <DatePicker
        selected={range[0]}
        onChange={onChange}
        startDate={range[0]}
        endDate={range[1]}
        minDate={new Date()}
        locale={ko}
        selectsRange
        inline
        />
    </>
  );
};

export default Calendar;
