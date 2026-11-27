import { SITE_NAME, SITE_URL } from '../config/site';
import { downloadBlob } from '../export/download';
import { dateOfDay } from './tripDates';
import { computeTimetables } from './scheduleTimetables';

// 일정 → 캘린더 파일(.ics, iCalendar). 브라우저에서 만들어 바로 내려받음 (서버에 보내지 않음)
const CRLF = '\r\n';
const MAX_LINE_BYTES = 75;
const MILLIS_PER_MINUTE = 60 * 1000;
const ICS_MIME = 'text/calendar;charset=utf-8';

const escapeText = (value) => String(value || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

// 한 줄 75바이트 넘으면 접기 (한글이 깨지지 않게 글자 단위로)
const foldLine = (line) => {
    const encoder = new TextEncoder();
    const parts = [];
    let current = '';
    for (const char of line) {
        if (encoder.encode(current + char).length > MAX_LINE_BYTES) { parts.push(current); current = ` ${char}`; } else current += char;
    }
    return [...parts, current].join(CRLF);
};

const pad = (value) => String(value).padStart(2, '0');

// 여행지 현지 시각 그대로 (시간대 없이 "떠 있는 시각": 기기를 그 나라에서 열면 그 나라 시각)
const localStamp = (date) => `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;

const utcStamp = (date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

const atMinutes = (dayDate, minutes) => new Date(dayDate.getTime() + minutes * MILLIS_PER_MINUTE);

const siteHost = () => (SITE_URL ? new URL(SITE_URL).host : window.location.host);

const eventLines = (itinerary, day, item, row, dayDate) => [
    'BEGIN:VEVENT',
    `UID:itinerary-${itinerary.id}-${day.dayNo}-${item.spotId}@${siteHost()}`,
    `DTSTAMP:${utcStamp(new Date())}`,
    `DTSTART:${localStamp(atMinutes(dayDate, row.arriveMinutes))}`,
    `DTEND:${localStamp(atMinutes(dayDate, row.leaveMinutes))}`,
    `SUMMARY:${escapeText(item.spotName)}`,
    `LOCATION:${escapeText(item.spotName)}`,
    `GEO:${Number(item.lat)};${Number(item.lon)}`,
    `DESCRIPTION:${escapeText([`${itinerary.title} ${day.dayNo}일차`, item.memo].filter(Boolean).join('\n'))}`,
    `URL:${SITE_URL || window.location.origin}/itinerary/${itinerary.id}`,
    'END:VEVENT',
];

export const buildIcs = (itinerary, timetables) => {
    const events = itinerary.days.flatMap((day, dayIndex) => day.items.map((item, index) =>
        eventLines(itinerary, day, item, timetables[dayIndex].rows[index], dateOfDay(itinerary.startDate, dayIndex))));
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:-//${SITE_NAME}//itinerary//KO`, 'CALSCALE:GREGORIAN',
        `X-WR-CALNAME:${escapeText(itinerary.title)}`, ...events.flat(), 'END:VCALENDAR'];
    return lines.map(foldLine).join(CRLF) + CRLF;
};

/** 모든 일차 시간표를 계산해 .ics 파일로 내려받기 (여행 기간이 있는 일정만) */
export const exportItineraryCalendar = async (itinerary, provider) => {
    const timetables = await computeTimetables(itinerary, provider);
    downloadBlob(new Blob([buildIcs(itinerary, timetables)], { type: ICS_MIME }), `thenadlee-itinerary-${itinerary.id}.ics`);
};
