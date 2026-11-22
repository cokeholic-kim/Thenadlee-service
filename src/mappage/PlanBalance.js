import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { availableCategories, countPlanCategories, planHint } from '../itinerary/planBalance';
import { MAP_PANELS, requestMapPanel, requestSpotCategory } from './mapPanelEvents';
import { trackEvent } from '../analytics/analytics';
import './PlanBalance.scss';

// 안내 버튼: 추천 장소 목록을 그 종류로 거르고 보여 줌 (휴대폰은 "추천 장소" 탭으로)
const showCategory = (category) => {
    requestSpotCategory(category);
    requestMapPanel(MAP_PANELS.SPOTS);
    trackEvent('plan_hint', { category });
};

// 선택목록 아래 "구성 안내": 그날 담은 장소의 종류별 수 + 빠진 종류 안내 한 가지
const PlanBalance = ({ activeDay, spots }) => {
    const remaining = useSelector((state) => state.add.right);
    const counts = useMemo(() => countPlanCategories(spots), [spots]);
    const hint = useMemo(() => planHint(spots, availableCategories(remaining)), [spots, remaining]);
    if (counts.length === 0) return null;
    return (
        <section className="plan-balance" aria-label={`${activeDay + 1}일차 장소 구성`}>
            <p className="plan-balance__counts">
                {counts.map((category) => <span key={category.value}><i className="plan-balance__dot" style={{ backgroundColor: category.color }} aria-hidden="true" />{category.icon} {category.label} {category.count}</span>)}
            </p>
            {hint && (
                <div className="plan-balance__hint" role="status">
                    <p>{hint.message}</p>
                    <button type="button" onClick={() => showCategory(hint.category)}>{hint.actionLabel}</button>
                </div>
            )}
        </section>
    );
};

export default PlanBalance;
