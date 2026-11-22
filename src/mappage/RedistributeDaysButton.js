import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { replaceDays } from '../modules/add';
import { canRedistribute, redistributeDays } from '../itinerary/redistribute';
import { formatDistance } from '../route/formatRoute';
import { toast } from '../ui/feedback';
import { trackEvent } from '../analytics/analytics';

// 일차 고르게 나누기: 담은 장소 전체를 가까운 것끼리 일차마다 고르게 다시 나누고, 몇 초 동안 "되돌리기"
const RedistributeDaysButton = () => {
    const dispatch = useDispatch();
    const days = useSelector((state) => state.add.days);
    if (!canRedistribute(days)) return null;
    const onClick = () => {
        const result = redistributeDays(days);
        trackEvent('redistribute_days', { day_count: days.length, spot_count: days.flat().length });
        if (!result.changed) return toast('이미 가까운 장소끼리 나뉘어 있어요.');
        dispatch(replaceDays(result.days));
        return toast(`가까운 장소끼리 일차를 다시 나눴어요. 일차 안 이동 직선거리 ${formatDistance(result.beforeMeters)} → ${formatDistance(result.afterMeters)}`,
            { actionLabel: '되돌리기', onAction: () => dispatch(replaceDays(days)) });
    };
    return (
        <button type="button" className="RedistributeBtn" onClick={onClick} title="담은 장소를 가까운 곳끼리 묶어 일차마다 비슷한 수로 나눠요">
            일차 고르게 나누기
        </button>
    );
};

export default RedistributeDaysButton;
