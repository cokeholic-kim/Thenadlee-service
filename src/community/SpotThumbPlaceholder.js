import React from 'react';
import { categoryIcon } from './spotCategories';
import './SpotThumbPlaceholder.scss';

// 사진이 없는 장소: 장소 종류 아이콘이 들어간 연한 자리표시
const SpotThumbPlaceholder = ({ category, className = '' }) => (
    <div className={`spot-thumb-placeholder ${className}`} aria-hidden="true">{categoryIcon(category)}</div>
);

export default SpotThumbPlaceholder;
