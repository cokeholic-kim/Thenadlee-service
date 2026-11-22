import React from 'react';
import { SPOT_CATEGORIES, UNCATEGORIZED_COLOR } from '../community/spotCategories';
import './CategoryLegend.scss';

// 지도 핀 색 범례: 지금 지도에 있는 장소의 종류만 (미분류가 있으면 "기타")
const CategoryLegend = ({ spots }) => {
    const present = SPOT_CATEGORIES.filter((category) => spots.some((spot) => spot.category === category.value));
    const hasOther = spots.some((spot) => !spot.category);
    if (present.length === 0) return null;
    return (
        <ul className="category-legend" aria-label="핀 색 설명">
            {present.map((category) => <li key={category.value}><span style={{ backgroundColor: category.color }} />{category.label}</li>)}
            {hasOther && <li><span style={{ backgroundColor: UNCATEGORIZED_COLOR }} />기타</li>}
        </ul>
    );
};

export default CategoryLegend;
