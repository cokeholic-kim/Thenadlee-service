import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../api/adminApi';
import { getApiErrorMessage } from '../util/apiError';
import AdminLayout from './AdminLayout';
import CityForm, { emptyCityForm, toCityForm } from './CityForm';
import PostManager from './PostManager';
import SpotManager from './SpotManager';
import TourImportPanel from './TourImportPanel';
import { isAdmin } from './roles';

const NEW_ID = 'new';

const CityEditPanel = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const role = useSelector((state) => state.logincheck.user?.role);
    const isNew = id === NEW_ID;
    const [city, setCity] = useState(null);

    const load = useCallback(() => {
        if (!isNew) adminApi.getCity(id).then(setCity).catch((error) => alert(getApiErrorMessage(error)));
    }, [id, isNew]);
    useEffect(load, [load]);

    const onSave = async (form) => {
        try {
            const saved = isNew ? await adminApi.createCity(form) : await adminApi.updateCity(id, form);
            alert(isNew ? '여행지를 추가했어요.' : '저장했어요.');
            if (isNew) navigate(`/admin/cities/${saved.id}`, { replace: true }); else setCity(saved);
        } catch (error) {
            alert(getApiErrorMessage(error));
        }
    };
    const onDelete = async () => {
        if (!window.confirm(`"${city.displayName}" 여행지를 삭제할까요? 추천 장소·월별 정보·여행기도 함께 삭제됩니다.`)) return;
        try {
            alert((await adminApi.deleteCity(id)).message);
            navigate('/admin/cities', { replace: true });
        } catch (error) {
            alert(getApiErrorMessage(error));
        }
    };

    return (
        <>
            <h1 className="admin__title">{isNew ? '여행지 추가' : `여행지 편집${city ? ` · ${city.displayName}` : ''}`}</h1>
            <p><Link to="/admin/cities">← 여행지 목록</Link>{city && <> · <Link to={`/map/${city.name}`}>지도에서 보기</Link></>}</p>
            {isNew && <CityForm initial={emptyCityForm()} isNew onSave={onSave} />}
            {!isNew && !city && <p>불러오는 중…</p>}
            {city && (
                <>
                    <CityForm key={city.id} initial={toCityForm(city)} onSave={onSave} onDelete={isAdmin(role) ? onDelete : null} />
                    <SpotManager cityId={city.id} spots={city.spots} onChanged={load} />
                    {city.region === 'DOMESTIC' && <TourImportPanel cityId={city.id} onImported={load} />}
                    <PostManager cityId={city.id} posts={city.posts} onChanged={load} />
                </>
            )}
        </>
    );
};

// 관리자: 여행지 추가·편집 (기본 정보, 월별 정보, 추천 장소, 여행기)
const AdminCityEdit = () => <AdminLayout><CityEditPanel /></AdminLayout>;

export default AdminCityEdit;
