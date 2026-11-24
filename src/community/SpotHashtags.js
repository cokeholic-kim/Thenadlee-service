import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { addSpotTag, removeSpotTag } from '../api/communityApi';
import { updateSpotTags } from '../modules/add';
import { canEdit } from '../admin/roles';
import { getApiErrorMessage } from '../util/apiError';
import { toastError } from '../ui/feedback';
import { loginPathHere } from '../session/loginPath';
import HashtagInput from './HashtagInput';
import { tagText } from './spotTags';
import './Hashtag.scss';

// 달기·빼기 후 서버가 돌려준 태그로 화면(이 칸 + 지도 목록)을 바꿈
const useSpotHashtags = (spot, onChange) => {
    const dispatch = useDispatch();
    const [tags, setTags] = useState(spot.tags || []);
    const [busy, setBusy] = useState(false);
    const run = async (action) => {
        setBusy(true);
        try {
            const next = await action();
            setTags(next);
            dispatch(updateSpotTags(spot.id, next));
            onChange?.(next);
            return true;
        } catch (error) {
            toastError(getApiErrorMessage(error));
            return false;
        } finally {
            setBusy(false);
        }
    };
    return { tags, busy, add: (name) => run(() => addSpotTag(spot.id, name)), remove: (key) => run(() => removeSpotTag(spot.id, key)) };
};

const TagChip = ({ tag, removable, busy, onRemove }) => (
    <li className={`hashtag-chip${tag.official ? ' is-official' : ''}${tag.mine ? ' is-mine' : ''}`}>
        {tag.icon && <span aria-hidden="true">{tag.icon}</span>}{tagText(tag)}
        {removable && <button type="button" aria-label={`${tagText(tag)} 빼기`} disabled={busy} onClick={() => onRemove(tag.key)}>×</button>}
    </li>
);

const AddArea = ({ isLogin, open, setOpen, state }) => {
    if (!isLogin) return <Link className="hashtag-add" to={loginPathHere()}>로그인하고 태그 달기</Link>;
    if (!open) return <button type="button" className="hashtag-add" onClick={() => setOpen(true)}>+ 태그</button>;
    return <HashtagInput onAdd={state.add} exclude={state.tags.map((tag) => tag.name)} disabled={state.busy} autoFocus />;
};

/**
 * 장소 해시태그: 누구나 보고, 로그인한 회원은 달 수 있음 (인스타그램처럼 기존 태그를 고르거나 새로 만듦)
 *   빼기: 내가 단 태그, 장소 등록자·그 여행지 담당 에디터·관리자는 모든 태그 (서버가 다시 확인)
 */
const SpotHashtags = ({ spot, onChange }) => {
    const { isLogin, user } = useSelector((state) => state.logincheck);
    const [open, setOpen] = useState(false);
    const state = useSpotHashtags(spot, onChange);
    // 지도 장소는 서버가 계산한 값(담당 여행지 기준), 관리자 화면 장소는 그 여행지를 다룰 수 있는 에디터 이상
    const manageAll = spot.canManageTags ?? (Boolean(spot.isMine) || canEdit(user?.role));
    return (
        <div className="spot-hashtags">
            {state.tags.length > 0 && (
                <ul className="spot-hashtags__list">
                    {state.tags.map((tag) => <TagChip key={tag.key} tag={tag} removable={manageAll || tag.mine} busy={state.busy} onRemove={state.remove} />)}
                </ul>
            )}
            <AddArea isLogin={isLogin} open={open} setOpen={setOpen} state={state} />
        </div>
    );
};

export default SpotHashtags;
