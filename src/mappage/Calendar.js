import React, { useState } from "react";
import DatePicker from "react-datepicker";
import {ko} from "date-fns/esm/locale";
import './Calendar.scss'
import  hideDateDiv  from "./LeftControlbar";
import "react-datepicker/dist/react-datepicker.css";

// CSS Modules, react-datepicker-cssmodules.css
// import 'react-datepicker/dist/react-datepicker-cssmodules.css';

const Calendar = ({hideDateDiv}) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate,setEndDate] =useState(null);
  const onChange = (dates) => {
    const [start,end] = dates;
    setStartDate(start);
    setEndDate(end);
    console.log(start)
    console.log(end)
    setDate(dates);
    
  }
  const setDate = (dates) => {
    hideDateDiv(dateFormat(dates[0]),dateFormat(dates[1]))
  }
  const dateFormat = (selectdate) => {
    if(selectdate){
      const year = selectdate.getFullYear();
      const month = selectdate.getMonth()+1;
      const monthformat = String(month).length ===1 ? '0'+month: month;
      const date = selectdate.getDate();
      const dayformat = String(date).length ===1 ? '0'+date :date ;
      return `${year}-${monthformat}-${dayformat}`
    }
  }
  return (
    <>
        <p className="calP" >여행기간</p>
        <DatePicker
        selected={startDate}
        onChange={onChange}
        startDate={startDate}
        endDate={endDate}
        minDate={new Date()}
        locale={ko}
        selectsRange
        inline
        />
    </>
  );
};

export default Calendar;