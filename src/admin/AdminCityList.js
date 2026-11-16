import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/adminApi';
import { getApiErrorMessage } from '../util/apiError';
import AdminLayout from './AdminLayout';

const CityTable = ({ cities }) => (
    <table className="admin-table">
        <thead>
            <tr><th>순서</th><th>영문 이름</th><th>표시 이름</th><th>추천 장소</th><th>공개</th><th></th></tr>
        </thead>
        <tbody>
            {cities.map((city) => (
                <tr key={city.id}>
                    <td>{city.sortOrder}</td>
                    <td>{city.name}</td>
                    <td>{city.displayName}</td>
                    <td>{city.spotCount}곳</td>
                    <td>{city.isPublished ? '공개' : <span className="admin-badge is-muted">비공개</span>}</td>
                    <td><Link className="admin-button" to={`/admin/cities/${city.id}`}>편집</Link></td>
                </tr>
            ))}
        </tbody>
    </table>
);

const CityListPanel = () => {
    const [cities, setCities] = useState(null);
    useEffect(() => {
        adminApi.listCities().then(setCities).catch((error) => alert(getApiErrorMessage(error)));
    }, []);

    return (
        <>
            <div className="admin__toolbar">
                <p>메인 화면에는 공개된 여행지만 노출 순서대로 보여요.</p>
                <Link className="admin-button is-primary" to="/admin/cities/new">여행지 추가</Link>
            </div>
            {cities === null ? <p>불러오는 중…</p> : <CityTable cities={cities} />}
        </>
    );
};

// 관리자: 여행지 목록 (비공개 포함). 권한 확인이 끝난 뒤에만 목록 API 호출
const AdminCityList = () => <AdminLayout title="여행지 관리"><CityListPanel /></AdminLayout>;

export default AdminCityList;
