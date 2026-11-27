import { CITY_NAMES } from '../seo/pageMeta';
import { categoryLabel } from '../community/spotCategories';
import { findTravelMode } from '../route/travelModes';
import { formatStay, travelModeLabel } from './timetable';
import { dateOfDay } from './tripDates';

// 일정표(이미지·인쇄·엑셀) 데이터: 시간표 계산 결과를 일차·장소 줄로 정리 (브라우저에서만)
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const clockText = (clock) => `${clock.text}${clock.nextDay ? '(+1)' : ''}`;

/** 그 일차 날짜 (예: 12.24 수), 여행 기간이 없으면 '' */
export const dayDateLabel = (startDate, dayIndex) => {
    const date = dateOfDay(startDate, dayIndex);
    return date ? `${date.getMonth() + 1}.${date.getDate()} ${WEEKDAYS[date.getDay()]}` : '';
};

const travelText = (travel) => (travel ? `${travelModeLabel(travel.mode)} ${travel.estimated ? '약 ' : ''}${formatStay(travel.minutes)}` : '');

const scheduleRow = (item, row, index) => ({
    order: index + 1, spotName: item.spotName, category: item.category ? categoryLabel(item.category) : '',
    arrive: clockText(row.arrive), leave: clockText(row.leave), stay: row.stay, stayText: formatStay(row.stay),
    travelText: travelText(row.travel), travelMinutes: row.travel ? row.travel.minutes : null, memo: item.memo || '',
});

/** 일정 + 일차별 시간표 → { title, cityName, ..., days: [{ dayNo, dateLabel, rows }] } */
export const buildSchedule = (itinerary, timetables) => ({
    title: itinerary.title,
    cityName: CITY_NAMES[itinerary.cityName] || itinerary.cityName,
    dayCount: itinerary.dayCount,
    travelMode: findTravelMode(itinerary.travelMode).label,
    period: itinerary.startDate ? `${itinerary.startDate}${itinerary.endDate && itinerary.endDate !== itinerary.startDate ? ` ~ ${itinerary.endDate}` : ''}` : '',
    days: itinerary.days.map((day, dayIndex) => ({
        dayNo: day.dayNo,
        dateLabel: dayDateLabel(itinerary.startDate, dayIndex),
        rows: day.items.map((item, index) => scheduleRow(item, timetables[dayIndex].rows[index], index)),
    })),
});

const HEADER = ['일차', '날짜', '순서', '도착', '출발', '장소', '종류', '머무는 시간(분)', '이 장소까지 이동', '이동 시간(분)', '메모'];
const WIDTHS = [6, 10, 6, 9, 9, 28, 12, 14, 18, 12, 30];

/** 엑셀 시트: 위에 일정 정보, 그 아래 장소 한 줄씩 (시간은 글자, 분은 숫자 칸) */
export const scheduleSheets = (schedule) => {
    const info = [[schedule.title], [`${schedule.cityName} · ${schedule.dayCount}일 · ${schedule.travelMode}${schedule.period ? ` · ${schedule.period}` : ''}`], []];
    const rows = schedule.days.flatMap((day) => day.rows.map((row) => [
        `${day.dayNo}일차`, day.dateLabel, row.order, row.arrive, row.leave, row.spotName, row.category, row.stay, row.travelText, row.travelMinutes, row.memo,
    ]));
    return [{ name: '일정표', rows: [...info, HEADER, ...rows], widths: WIDTHS, boldRows: [0, info.length] }];
};
