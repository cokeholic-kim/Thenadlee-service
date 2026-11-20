import React, { useCallback, useEffect, useState } from 'react';
import { groupApi } from '../api/groupApi';
import { getApiErrorMessage } from '../util/apiError';
import { formatDateTime } from './groupFormat';
import useForecast, { FORECAST_DAYS } from './useForecast';
import './SpotComments.scss';

const POLL_INTERVAL_MS = 15000;
// trip_spot_comment.content 길이와 같음
const COMMENT_MAX_LENGTH = 300;

/** 확정 동선 장소별 댓글 { data, run } (보고 있는 동안 자동 갱신) */
export const useSpotComments = (groupId, { poll = true } = {}) => {
    const [data, setData] = useState(null);
    const reload = useCallback(() => groupApi.planComments(groupId).then(setData).catch(() => setData(null)), [groupId]);
    useEffect(() => {
        reload();
        if (!poll) return undefined;
        const timer = setInterval(() => { if (document.visibilityState === 'visible') reload(); }, POLL_INTERVAL_MS);
        return () => clearInterval(timer);
    }, [reload, poll]);
    const run = async (action) => {
        try {
            setData(await action());
            return true;
        } catch (error) {
            alert(getApiErrorMessage(error));
            return false;
        }
    };
    return { data, run };
};

const CommentForm = ({ groupId, spotId, run }) => {
    const [content, setContent] = useState('');
    const submit = async (e) => {
        e.preventDefault();
        if (content.trim() && await run(() => groupApi.addPlanComment(groupId, spotId, content.trim()))) setContent('');
    };
    return (
        <form className="spot-comment-form" onSubmit={submit}>
            <input value={content} onChange={(e) => setContent(e.target.value)} maxLength={COMMENT_MAX_LENGTH} placeholder="이 장소에 댓글 남기기" aria-label="댓글" />
            <button type="submit" disabled={!content.trim()}>등록</button>
        </form>
    );
};

const CommentItem = ({ groupId, comment, canDelete, run }) => (
    <li className={comment.mine ? 'is-mine' : ''}>
        <p>
            <strong className={comment.deletedUser ? 'is-deleted' : ''}>{comment.authorName}</strong>
            <time>{formatDateTime(comment.createdAt)}</time>
            {canDelete && <button type="button" onClick={() => window.confirm('이 댓글을 지울까요?') && run(() => groupApi.deletePlanComment(groupId, comment.id))}>삭제</button>}
        </p>
        <span>{comment.content}</span>
    </li>
);

/** 한 장소의 댓글 목록 + 입력 */
export const SpotCommentThread = ({ groupId, spot, canDelete, run }) => (
    <div className="spot-comments">
        {spot.comments.length === 0 && <p className="spot-comments__empty">아직 댓글이 없어요.</p>}
        <ul>{spot.comments.map((comment) => <CommentItem key={comment.id} groupId={groupId} comment={comment} canDelete={canDelete} run={run} />)}</ul>
        <CommentForm groupId={groupId} spotId={spot.spotId} run={run} />
    </div>
);

const SpotRow = ({ groupId, spot, canDelete, run }) => {
    const [open, setOpen] = useState(false);
    return (
        <li className="plan-spot">
            <button type="button" className="plan-spot__head" onClick={() => setOpen(!open)} aria-expanded={open}>
                <span>{spot.name}{spot.memo ? <em> · {spot.memo}</em> : null}</span>
                <span className="plan-spot__count">💬 {spot.comments.length}</span>
            </button>
            {open && <SpotCommentThread groupId={groupId} spot={spot} canDelete={canDelete} run={run} />}
        </li>
    );
};

/** 모임 계획 탭: 확정 동선을 일차별로 보여 주고 장소마다 댓글 */
export const PlanComments = ({ group }) => {
    const { data, run } = useSpotComments(group.id);
    const dayCount = data ? Math.max(0, ...data.days.map((day) => day.dayNo)) : 0;
    const { byDay, tooFar } = useForecast(group.city?.name, group.startDate, dayCount);
    if (!data || data.days.length === 0) return null;
    return (
        <div className="plan-comments">
            <p className="group-hint">장소를 누르면 댓글을 볼 수 있어요. 댓글은 방장과 관리자만 지울 수 있어요.{tooFar ? ` 여행 ${FORECAST_DAYS}일 전부터 일차별 날씨 예보가 보여요.` : ''}</p>
            {data.days.map((day) => (
                <div key={day.dayNo} className="plan-comments__day">
                    <h3>{day.dayNo}일차{byDay[day.dayNo] && <span className="day-weather">{byDay[day.dayNo].date.slice(5).replace('-', '/')} {byDay[day.dayNo].emoji} {byDay[day.dayNo].min}~{byDay[day.dayNo].max}°C</span>}</h3>
                    <ol>{day.spots.map((spot) => <SpotRow key={spot.spotId} groupId={group.id} spot={spot} canDelete={data.canDelete} run={run} />)}</ol>
                </div>
            ))}
        </div>
    );
};
