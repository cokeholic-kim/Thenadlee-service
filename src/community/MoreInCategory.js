import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { categoryPageLinks, categoryPageTitle } from '../spots/categoryLinks';

// 장소 상세 아래 "제주 자연·풍경 명소 17곳 더 보기" (그 종류 페이지가 있을 때만, 지도 화면에서만)
const MoreInCategory = ({ spot }) => {
    const { places: cityName } = useParams();
    const spots = useSelector((state) => state.add.data);
    const link = cityName && spot.category ? categoryPageLinks(cityName, spots).find((item) => item.value === spot.category) : null;
    if (!link) return null;
    return <p className="spot-detail__more"><Link to={link.path}>{link.icon} {categoryPageTitle(cityName, link)} {link.count}곳 더 보기 →</Link></p>;
};

export default MoreInCategory;
