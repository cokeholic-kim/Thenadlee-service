import React from 'react';
import { Link } from 'react-router-dom';
import { groupApi } from '../api/groupApi';
import { confirmDialog } from '../ui/feedback';

const Wish = ({ group, wish, run }) => (
    <li className="group-item">
        {wish.imageUrl ? <img src={wish.imageUrl} alt="" loading="lazy" referrerPolicy="no-referrer" /> : <div className="group-item__noimg" />}
        <div className="group-item__text">
            <strong>{wish.spotName}</strong>
            <span>{wish.proposerNickName || '나간 멤버'} 님 제안{wish.memo ? ` · "${wish.memo}"` : ''}</span>
        </div>
        <button type="button" className={`group-button is-small${wish.votedByMe ? ' is-active' : ''}`}
            onClick={() => run(() => groupApi.voteWish(group.id, wish.id, !wish.votedByMe))}>👍 {wish.voteCount}</button>
        {wish.canDelete && <button type="button" className="group-button is-small is-danger"
            onClick={async () => await confirmDialog('이 제안을 지울까요?') && run(() => groupApi.removeWish(group.id, wish.id))}>삭제</button>}
    </li>
);

// 가고 싶은 장소 제안·찬성 (제안은 지도 화면의 모임 모드에서)
const WishPanel = ({ group, run }) => (
    <section className="group-section">
        <h2>가고 싶은 장소</h2>
        {!group.city && <p className="group-hint">여행지가 확정되면 지도에서 가고 싶은 장소를 제안할 수 있어요.</p>}
        {group.city && (
            <p className="group-hint">
                <Link to={`/map/${group.city.name}?group=${group.id}`}>지도에서 장소 고르기</Link> → 장소의 ⓘ 를 눌러 "모임에 제안"을 누르세요. 찬성이 많은 순으로 보여요.
            </p>
        )}
        {group.wishes.length === 0 && group.city && <p className="group-empty">아직 제안된 장소가 없어요.</p>}
        <ul className="group-items">{group.wishes.map((wish) => <Wish key={wish.id} group={group} wish={wish} run={run} />)}</ul>
    </section>
);

export default WishPanel;
