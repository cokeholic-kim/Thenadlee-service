import React, { useRef, useState } from 'react';
import { providerFor } from '../map/mapProvider';
import useCardExport from '../group/useCardExport';
import { downloadXlsx } from '../export/download';
import { toastError } from '../ui/feedback';
import { trackEvent } from '../analytics/analytics';
import { computeTimetables } from './scheduleTimetables';
import { buildSchedule, scheduleSheets } from './scheduleExport';
import ScheduleCard from './ScheduleCard';
import './ItineraryExport.scss';

// 인쇄할 때만 일정표 카드만 보이게 (body 에 표시를 붙였다가 인쇄가 끝나면 뗌)
const PRINT_CLASS = 'is-printing-schedule';

const printSchedule = () => {
    document.body.classList.add(PRINT_CLASS);
    const done = () => { document.body.classList.remove(PRINT_CLASS); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    window.print();
};

// 모든 일차 시간표를 계산해 일정표 데이터로 (길찾기 경로는 지도에서 계산한 캐시 재사용)
const useSchedule = (itinerary) => {
    const [state, setState] = useState({ schedule: null, loading: false });
    const open = async () => {
        setState({ schedule: null, loading: true });
        try {
            const timetables = await computeTimetables(itinerary, providerFor(itinerary.region));
            setState({ schedule: buildSchedule(itinerary, timetables), loading: false });
            trackEvent('export_schedule', { day_count: itinerary.dayCount });
        } catch (error) {
            setState({ schedule: null, loading: false });
            toastError('일정표를 만들지 못했어요. 잠시 후 다시 시도해 주세요.');
        }
    };
    return { ...state, open, close: () => setState({ schedule: null, loading: false }) };
};

// 공유는 일정 페이지 위쪽 "공유하기"(공개 일정 링크)를 쓰고, 여기서는 파일로 저장
const ExportToolbar = ({ schedule, cardRef, onClose }) => {
    const fileName = `${schedule.title}_일정표`;
    const { busy, saveImage } = useCardExport(cardRef, fileName);
    return (
        <div className="schedule-export__toolbar">
            <button type="button" onClick={saveImage} disabled={busy}>{busy ? '만드는 중…' : '🖼 이미지 저장'}</button>
            <button type="button" onClick={printSchedule}>🖨 인쇄·PDF 저장</button>
            <button type="button" onClick={() => downloadXlsx(scheduleSheets(schedule), fileName)}>📊 엑셀 내려받기</button>
            <button type="button" className="is-plain" onClick={onClose}>닫기</button>
        </div>
    );
};

/** 일정 페이지 "일정표 내보내기": 시간표 카드 미리보기 → 이미지·인쇄(PDF)·엑셀 (모두 브라우저에서 만들고 서버에 저장하지 않음) */
const ItineraryExport = ({ itinerary }) => {
    const cardRef = useRef(null);
    const { schedule, loading, open, close } = useSchedule(itinerary);
    if (!itinerary.days.some((day) => day.items.length > 0)) return null;
    if (!schedule) {
        return <button type="button" className="schedule-export__open" onClick={open} disabled={loading} aria-busy={loading}>{loading ? '시간표 계산 중…' : '🗂 일정표 내보내기 (이미지·인쇄·엑셀)'}</button>;
    }
    return (
        <section className="schedule-export" aria-label="일정표 내보내기">
            <ExportToolbar schedule={schedule} cardRef={cardRef} onClose={close} />
            <ScheduleCard ref={cardRef} schedule={schedule} />
        </section>
    );
};

export default ItineraryExport;
