import React, { useEffect, useRef, useState } from 'react';
import { groupApi } from '../api/groupApi';
import { getApiErrorMessage } from '../util/apiError';
import { number } from './expenseFormat';
import { nightsLabel } from './reportBuilder';
import RouteSketch, { dayColor } from './RouteSketch';
import useCardExport from './useCardExport';
import './Summary.scss';

const SummaryStats = ({ summary }) => (
    <dl className="summary-stats">
        <div><dt>총비용</dt><dd>{number(summary.totalKrw)}원</dd></div>
        <div><dt>1인당</dt><dd>{number(summary.perPersonKrw)}원</dd></div>
        <div><dt>사진</dt><dd>{summary.photoCount}장</dd></div>
        <div><dt>댓글</dt><dd>{summary.commentCount}개</dd></div>
    </dl>
);

const SummaryRoute = ({ days }) => (
    <div className="summary-route">
        <RouteSketch days={days} />
        <ol>
            {days.map((day) => (
                <li key={day.dayNo}>
                    <strong style={{ background: dayColor(day.dayNo) }}>{day.dayNo}일차</strong>
                    <span>{day.spots.map((spot) => spot.name).join(' → ')}</span>
                </li>
            ))}
        </ol>
    </div>
);

const SummaryPhotos = ({ photos }) => (
    <ul className={`summary-photos is-${Math.min(photos.length, 4)}`}>
        {photos.map((photo) => (
            <li key={photo.imageUrl}>
                <img src={photo.imageUrl} alt={photo.caption || ''} crossOrigin="anonymous" />
                {photo.caption && <span>{photo.caption}</span>}
            </li>
        ))}
    </ul>
);

/** 여행 요약 카드 (이미지로 저장되는 영역) */
const SummaryCard = React.forwardRef(({ summary }, ref) => {
    const period = nightsLabel(summary.startDate, summary.endDate);
    return (
        <div className="summary-card" ref={ref}>
            <p className="summary-card__place">{summary.city ? `📍 ${summary.city.displayName}` : '여행지 미정'}{period ? ` · ${period}` : ''}</p>
            <h2 className="summary-card__title">{summary.name}</h2>
            {summary.startDate && <p className="summary-card__dates">{summary.startDate} ~ {summary.endDate}</p>}
            <p className="summary-card__members">{summary.members.map((name) => <span key={name}>{name}</span>)}</p>
            {summary.photos.length > 0 && <SummaryPhotos photos={summary.photos} />}
            {summary.days.length > 0 && <SummaryRoute days={summary.days} />}
            <SummaryStats summary={summary} />
            <p className="summary-card__footer">더 나들이 · 함께 떠난 여행</p>
        </div>
    );
});

// 요약 탭: 여행지·기간·멤버, 날짜별 동선, 총비용·1인당 비용, 대표 사진 → 이미지 저장
const SummaryTab = ({ group }) => {
    const [summary, setSummary] = useState(null);
    const cardRef = useRef(null);
    const { busy, saveImage } = useCardExport(cardRef, `${group.name}_여행요약`);
    useEffect(() => {
        groupApi.summary(group.id).then(setSummary).catch((error) => alert(getApiErrorMessage(error)));
    }, [group.id]);
    if (!summary) return <p>불러오는 중…</p>;
    return (
        <section className="group-section">
            <div className="report-toolbar">
                <h2>여행 요약</h2>
                <button type="button" className="group-button is-small is-primary" onClick={saveImage} disabled={busy}>{busy ? '만드는 중…' : '이미지로 저장'}</button>
            </div>
            <p className="group-hint">대표 사진은 앨범에서 방장이 고를 수 있어요(없으면 최근 사진). 1인당 비용은 지출을 함께 나눈 사람 수 기준이에요.</p>
            <SummaryCard ref={cardRef} summary={summary} />
        </section>
    );
};

export default SummaryTab;
