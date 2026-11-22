import React from 'react';
import { useSelector } from 'react-redux';
import useForecast from '../group/useForecast';
import { MAP_PANELS, requestMapPanel, requestSpotTag } from './mapPanelEvents';
import { trackEvent } from '../analytics/analytics';
import './RainHint.scss';

const RAINY_TAG = 'RAINY';
const WET_TEXT = { RAIN: { icon: '☔', word: '비' }, SNOW: { icon: '❄️', word: '눈' } };

// 추천 목록을 "비 오는 날" 태그로 거르고 보여 줌 (휴대폰은 "추천 장소" 탭으로)
const showRainySpots = () => {
    requestSpotTag(RAINY_TAG);
    requestMapPanel(MAP_PANELS.SPOTS);
    trackEvent('rain_hint');
};

const shortDate = (date) => date.slice(5).replace('-', '/');

// 그날 비·눈 예보가 있으면 안내 (여행 기간이 5일 예보 안일 때만), "비 오는 날" 태그 장소가 남아 있으면 보기 버튼
const RainHint = ({ cityName, activeDay }) => {
    const startDate = useSelector((state) => state.itinerary.startDate);
    const dayCount = useSelector((state) => state.add.days.length);
    const remaining = useSelector((state) => state.add.right);
    const { byDay } = useForecast(cityName, startDate, dayCount);
    const day = byDay[activeDay + 1];
    if (!day?.wet) return null;
    const rainyCount = remaining.filter((spot) => spot.tags?.includes(RAINY_TAG)).length;
    const text = WET_TEXT[day.wet];
    return (
        <div className="rain-hint" role="status">
            <p>{text.icon} {shortDate(day.date)} {text.word} 예보가 있어요{day.pop > 0 ? ` (강수확률 ${day.pop}%)` : ''}. {rainyCount > 0 ? '실내에서도 즐길 곳을 넣어 보세요.' : '실내 장소를 함께 넣어 두면 좋아요.'}</p>
            {rainyCount > 0 && <button type="button" onClick={showRainySpots}>비 와도 좋은 곳 {rainyCount}곳 보기</button>}
        </div>
    );
};

export default RainHint;
