import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { categoryPageLinks } from '../spots/categoryLinks';
import { trackEvent } from '../analytics/analytics';

// "여행 tip" 안 종류별 추천 페이지 링크 (장소가 기준 수 이상인 종류만, 담던 일정은 이 탭에 임시 보관돼 돌아오면 이어짐)
const CategoryPageLinks = ({ cityName }) => {
    const spots = useSelector((state) => state.add.data);
    const links = categoryPageLinks(cityName, spots);
    if (links.length === 0) return null;
    return (
        <nav className="descdiv__categories" aria-label="종류별 추천">
            <span>종류별 추천</span>
            {links.map((link) => (
                <Link key={link.value} to={link.path} onClick={() => trackEvent('category_page_link', { category: link.value })}>{link.icon} {link.name}</Link>
            ))}
        </nav>
    );
};

export default CategoryPageLinks;
