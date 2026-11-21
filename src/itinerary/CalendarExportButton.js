import React, { useState } from 'react';
import { exportItineraryCalendar } from './calendarExport';
import { providerFor } from '../map/mapProvider';
import { toast, toastError } from '../ui/feedback';
import { trackEvent } from '../analytics/analytics';

// 일정 페이지 "캘린더에 추가": 여행 기간이 있는 일정만 (날짜가 있어야 캘린더에 넣을 수 있음)
const CalendarExportButton = ({ itinerary }) => {
    const [busy, setBusy] = useState(false);
    if (!itinerary.startDate) {
        return itinerary.isOwner ? <p className="calendar-export__hint">여행 기간을 정해 저장하면 시간표를 휴대폰 캘린더에 넣을 수 있어요.</p> : null;
    }
    const onExport = async () => {
        setBusy(true);
        try {
            await exportItineraryCalendar(itinerary, providerFor(itinerary.region));
            trackEvent('export_calendar', { day_count: itinerary.dayCount });
            toast('캘린더 파일을 내려받았어요. 파일을 열면 휴대폰·구글 캘린더에 추가할 수 있어요.');
        } catch (error) {
            toastError('캘린더 파일을 만들지 못했어요. 잠시 후 다시 시도해 주세요.');
        } finally {
            setBusy(false);
        }
    };
    return (
        <button type="button" className="calendar-export" onClick={onExport} disabled={busy} aria-busy={busy}>
            {busy ? '시간표 계산 중…' : '📅 캘린더에 추가 (.ics)'}
        </button>
    );
};

export default CalendarExportButton;
