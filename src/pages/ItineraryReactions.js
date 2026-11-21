import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { addItineraryComment, changeItineraryLike, deleteItineraryComment, fetchItineraryReactions } from '../api/communityApi';
import { getApiErrorMessage } from '../util/apiError';
import { confirmDialog, toastError } from '../ui/feedback';
import { loginPathHere } from '../session/loginPath';
import { trackEvent } from '../analytics/analytics';
import './ItineraryReactions.scss';

// 서버 community.commentMaxLength 와 같은 값
const COMMENT_MAX_LENGTH = 300;

const useReactions = (itineraryId) => {
    const [data, setData] = useState(null);
    const run = useCallback(async (action) => {
        try { setData(await action()); return true; } catch (error) { toastError(getApiErrorMessage(error)); return false; }
    }, []);
    useEffect(() => { run(() => fetchItineraryReactions(itineraryId)); }, [itineraryId, run]);
    const like = async () => {
        try {
            const result = await changeItineraryLike(itineraryId, !data.liked);
            setData((current) => ({ ...current, liked: result.liked, likeCount: result.likeCount }));
            if (result.liked) trackEvent('like_itinerary');
        } catch (error) { toastError(getApiErrorMessage(error)); }
    };
    const add = (content) => run(() => addItineraryComment(itineraryId, content)).then((ok) => { if (ok) trackEvent('comment_itinerary'); return ok; });
    const remove = async (comment) => {
        if (await confirmDialog('이 댓글을 지울까요?', { title: '댓글 지우기', confirmLabel: '지우기' })) run(() => deleteItineraryComment(itineraryId, comment.id));
    };
    return { data, like, add, remove };
};

// 좋아요: 남의 공개 일정만 누를 수 있고, 비로그인은 로그인으로 안내
const LikeButton = ({ data, onLike }) => {
    const label = `좋아요 ${data.likeCount}`;
    if (data.canLike) {
        return <button type="button" className={`reaction-like${data.liked ? ' is-liked' : ''}`} aria-pressed={data.liked} onClick={onLike}>{data.liked ? '♥' : '♡'} {label}</button>;
    }
    return <span className="reaction-like is-static" title={data.canComment ? '내 일정에는 좋아요를 누를 수 없어요' : ''}>♥ {label}</span>;
};

const CommentForm = ({ onSubmit }) => {
    const [content, setContent] = useState('');
    const submit = async (e) => { e.preventDefault(); if (await onSubmit(content)) setContent(''); };
    return (
        <form className="comment-form" onSubmit={submit}>
            <label htmlFor="itineraryComment" className="sr-only">댓글</label>
            <textarea id="itineraryComment" rows="2" value={content} maxLength={COMMENT_MAX_LENGTH} onChange={(e) => setContent(e.target.value)}
                placeholder="이 일정에 대한 생각이나 궁금한 점을 남겨 보세요" required />
            <div className="comment-form__row"><span>{content.length} / {COMMENT_MAX_LENGTH}</span><button type="submit">댓글 달기</button></div>
        </form>
    );
};

const CommentList = ({ comments, onDelete }) => (
    <ul className="comment-list">
        {comments.map((comment) => (
            <li key={comment.id} className={comment.isMine ? 'is-mine' : ''}>
                <div className="comment-list__head"><strong>{comment.nickName}</strong><span>{comment.createdAt.slice(0, 16)}</span>
                    {comment.canDelete && <button type="button" onClick={() => onDelete(comment)} aria-label={`${comment.nickName}님 댓글 지우기`}>지우기</button>}</div>
                <p>{comment.content}</p>
            </li>
        ))}
    </ul>
);

// 공개 일정 페이지 아래: 좋아요와 댓글 (비공개 일정은 작성자에게 안내만)
const ItineraryReactions = ({ itineraryId }) => {
    const { data, like, add, remove } = useReactions(itineraryId);
    if (!data) return null;
    return (
        <section className="itinerary-reactions" aria-label="좋아요와 댓글">
            <div className="itinerary-reactions__bar"><LikeButton data={data} onLike={like} /><span>댓글 {data.comments.length}</span></div>
            {!data.isPublic && <p className="itinerary-reactions__note">비공개 일정이에요. 공개하면 다른 여행자가 좋아요와 댓글을 남길 수 있어요.</p>}
            {data.comments.length > 0 && <CommentList comments={data.comments} onDelete={remove} />}
            {data.canComment && <CommentForm onSubmit={add} />}
            {data.isPublic && !data.canComment && <p className="itinerary-reactions__note"><Link to={loginPathHere()}>로그인</Link>하면 좋아요와 댓글을 남길 수 있어요.</p>}
        </section>
    );
};

export default ItineraryReactions;
