import React, { createContext, useContext } from 'react';
import { Link } from 'react-router-dom';
import { groupApi } from '../api/groupApi';
import useGroupDetail from './useGroupDetail';
import { SpotCommentThread, useSpotComments } from './SpotComments';

// 지도 화면 모임 모드 (/map/도시?group=ID): 모임 정보와 변경 함수를 하위 화면에 공유
const GroupMapContext = createContext(null);

export const useGroupMap = () => useContext(GroupMapContext);

/** 주소의 모임이 이 지도 도시로 확정된 경우에만 모임 모드 */
export const GroupMapProvider = ({ groupId, cityName, children }) => {
    const { group, run } = useGroupDetail(groupId, { poll: false });
    const value = group && group.city?.name === cityName ? { group, run } : null;
    return <GroupMapContext.Provider value={value}>{children}</GroupMapContext.Provider>;
};

export const GroupMapBanner = () => {
    const context = useGroupMap();
    if (!context) return null;
    const { group } = context;
    return (
        <div className="group-map-banner">
            <strong>모임: {group.name}</strong>
            <span>제안 {group.wishes.length}곳 · 장소 ⓘ 에서 "모임에 제안"</span>
            <Link to={`/groups/${group.id}`}>모임으로 돌아가기</Link>
        </div>
    );
};

// 장소 상세 팝업의 제안·찬성 버튼
export const GroupWishButton = ({ spot }) => {
    const context = useGroupMap();
    if (!context) return null;
    const { group, run } = context;
    const wish = group.wishes.find((item) => item.spotId === spot.id);
    if (wish) {
        return (
            <button type="button" className={`map-modal__button${wish.votedByMe ? ' is-mint' : ''}`}
                onClick={() => run(() => groupApi.voteWish(group.id, wish.id, !wish.votedByMe))}>👍 모임 찬성 {wish.voteCount}</button>
        );
    }
    const propose = () => {
        const memo = window.prompt('모임에 남길 메모 (선택)', '');
        if (memo !== null) run(() => groupApi.addWish(group.id, spot.id, memo));
    };
    return <button type="button" className="map-modal__button" onClick={propose}>모임에 제안</button>;
};

const SpotCommentsLoader = ({ group, spotId }) => {
    const { data, run } = useSpotComments(group.id, { poll: false });
    const spot = data?.days.flatMap((day) => day.spots).find((item) => item.spotId === spotId);
    if (!spot) return null;
    return (
        <div className="group-spot-comments">
            <h4>모임 댓글</h4>
            <SpotCommentThread groupId={group.id} spot={spot} canDelete={data.canDelete} run={run} />
        </div>
    );
};

// 장소 상세 팝업: 확정 동선에 있는 장소면 모임 댓글
export const GroupSpotComments = ({ spot }) => {
    const context = useGroupMap();
    if (!context?.group.plan) return null;
    return <SpotCommentsLoader group={context.group} spotId={spot.id} />;
};
