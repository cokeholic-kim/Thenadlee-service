import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/adminApi';
import { getApiErrorMessage } from '../util/apiError';
import AdminLayout from './AdminLayout';
import { isAdmin } from './roles';
import { toastError } from '../ui/feedback';

const CityTable = ({ cities }) => (
    <table className="admin-table">
        <thead>
            <tr><th>순서</th><th>구분</th><th>영문 이름</th><th>표시 이름</th><th>추천 장소</th><th>공개</th><th></th></tr>
        </thead>
        <tbody>
            {cities.map((city) => (
                <tr key={city.id}>
                    <td>{city.sortOrder}</td>
                    <td>{city.region === 'DOMESTIC' ? '국내' : '해외'}</td>
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

// 에디터는 담당 여행지만 보임 (여행지 추가는 관리자만)
const EmptyMessage = ({ admin }) => <p className="admin__hint">{admin ? '아직 여행지가 없어요.' : '맡은 여행지가 아직 없어요. 관리자에게 담당 여행지를 요청해 주세요.'}</p>;

const CityListPanel = () => {
    const admin = isAdmin(useSelector((state) => state.logincheck.user?.role));
    const [cities, setCities] = useState(null);
    useEffect(() => {
        adminApi.listCities().then(setCities).catch((error) => toastError(getApiErrorMessage(error)));
    }, []);

    return (
        <>
            <div className="admin__toolbar">
                <p>{admin ? '메인 화면에는 공개된 여행지만 노출 순서대로 보여요.' : '내가 맡은 여행지만 보여요.'}</p>
                {admin && <Link className="admin-button is-primary" to="/admin/cities/new">여행지 추가</Link>}
            </div>
            {cities === null && <p>불러오는 중…</p>}
            {cities?.length === 0 && <EmptyMessage admin={admin} />}
            {cities?.length > 0 && <CityTable cities={cities} />}
        </>
    );
};

// 관리자: 여행지 목록 (비공개 포함). 권한 확인이 끝난 뒤에만 목록 API 호출
const AdminCityList = () => <AdminLayout title="여행지 관리"><CityListPanel /></AdminLayout>;

export default AdminCityList;
