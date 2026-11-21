import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { sendReport } from '../api/communityApi';
import { getApiErrorMessage } from '../util/apiError';
import LoginRequired from './LoginRequired';
import MapModal from './MapModal';
import { toast, toastError } from '../ui/feedback';

// 서버 신고 사유와 같은 값
const REPORT_REASONS = [
    { value: 'WRONG_INFO', label: '잘못된 정보' },
    { value: 'AD', label: '광고·홍보' },
    { value: 'COPYRIGHT', label: '저작권 침해' },
    { value: 'INAPPROPRIATE', label: '부적절한 내용' },
];

const ReasonFields = ({ reason, onChange }) => (
    <fieldset>
        <legend>신고 사유</legend>
        {REPORT_REASONS.map((option) => (
            <label key={option.value} className="map-modal__radio">
                <input type="radio" name="reason" value={option.value} checked={reason === option.value}
                    onChange={(e) => onChange(e.target.value)} />{option.label}
            </label>
        ))}
    </fieldset>
);

const useReportSubmit = (target, onDone) => {
    const [sending, setSending] = useState(false);
    const submit = async (reason, detail) => {
        setSending(true);
        try {
            toast((await sendReport({ targetType: target.type, targetId: target.id, reason, detail })).message);
            onDone();
        } catch (error) {
            toastError(getApiErrorMessage(error));
            setSending(false);
        }
    };
    return { sending, submit };
};

const ReportForm = ({ target, onDone }) => {
    const [reason, setReason] = useState(REPORT_REASONS[0].value);
    const [detail, setDetail] = useState('');
    const { sending, submit } = useReportSubmit(target, onDone);
    return (
        <form onSubmit={(e) => { e.preventDefault(); submit(reason, detail); }}>
            <p className="map-modal__message">"{target.title}"을(를) 신고합니다. 신고가 여러 건 쌓이면 검토 전까지 자동으로 숨겨져요.</p>
            <ReasonFields reason={reason} onChange={setReason} />
            <label htmlFor="reportDetail">자세한 내용 (선택)</label>
            <textarea id="reportDetail" rows="3" maxLength="300" value={detail} onChange={(e) => setDetail(e.target.value)} />
            <div className="map-modal__actions">
                <button type="submit" className="map-modal__button is-primary" disabled={sending}>신고하기</button>
            </div>
        </form>
    );
};

// 장소·공개 일정 신고 창. target: { type: 'SPOT'|'ITINERARY', id, title }
const ReportModal = ({ target, onClose }) => {
    const isLogin = useSelector((state) => state.logincheck.isLogin);
    return (
        <MapModal title="신고하기" onClose={onClose}>
            {isLogin ? <ReportForm target={target} onDone={onClose} /> : <LoginRequired action="신고" />}
        </MapModal>
    );
};

export default ReportModal;
