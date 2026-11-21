import React from 'react';
import { useDispatch } from 'react-redux';
import { reorderDay } from '../modules/add';
import { MIN_SPOTS_TO_OPTIMIZE, optimizeSpotOrder } from '../itinerary/routeOrder';
import { formatDistance } from '../route/formatRoute';
import { toast } from '../ui/feedback';
import { trackEvent } from '../analytics/analytics';

const idsOf = (spots) => spots.map((spot) => spot.id);

// 동선 정리: 현재 일차를 가까운 순서로 다시 배열하고, 몇 초 동안 "되돌리기"를 보여 줌 (첫 장소는 출발지로 고정)
const OptimizeRouteButton = ({ activeDay, spots }) => {
    const dispatch = useDispatch();
    if (spots.length < MIN_SPOTS_TO_OPTIMIZE) return null;
    const onOptimize = () => {
        const result = optimizeSpotOrder(spots);
        trackEvent('optimize_route', { spot_count: spots.length });
        if (!result.changed) {
            toast('이미 가까운 순서로 담겨 있어요.');
            return;
        }
        dispatch(reorderDay(activeDay, idsOf(result.spots)));
        toast(`동선을 정리했어요. 직선거리 ${formatDistance(result.beforeMeters)} → ${formatDistance(result.afterMeters)}`,
            { actionLabel: '되돌리기', onAction: () => dispatch(reorderDay(activeDay, idsOf(spots))) });
    };
    return (
        <button type="button" className="OptimizeBtn" onClick={onOptimize} title="첫 장소에서 출발해 가까운 곳부터 들르도록 순서를 바꿔요">
            동선 정리
        </button>
    );
};

export default OptimizeRouteButton;
