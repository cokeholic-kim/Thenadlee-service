import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { createSpot, updateSpot } from '../api/communityApi';
import { getApiErrorMessage } from '../util/apiError';
import LocationPicker from './LocationPicker';
import LoginRequired from './LoginRequired';
import MapModal from './MapModal';
import PhotoUploader from './PhotoUploader';
import PlaceSearch from './PlaceSearch';
import { SPOT_CATEGORIES } from './spotCategories';
import HashtagInput from './HashtagInput';
import { addSpotTag } from '../api/communityApi';
import './Community.scss';
import { toast, toastError } from '../ui/feedback';

// 서버 설정(community.maxSpotImages)과 같은 값
const MAX_PHOTOS = 3;

const toForm = (spot) => ({
    name: spot?.spotName || '',
    category: spot?.category || '',
    tags: [],
    isNew: !spot,
    description: spot?.description || '',
    position: spot ? { lat: spot.lat, lng: spot.lon } : null,
    imageUrls: spot?.source === 'USER' ? spot.images : [],
});

// 등록한 장소에 고른 태그를 차례로 닮 (규칙에 어긋난 태그는 알리고 나머지는 계속)
const addTagsAfterCreate = async (spotId, names) => {
    for (const name of names) {
        try {
            await addSpotTag(spotId, name); // eslint-disable-line no-await-in-loop
        } catch (error) {
            toastError(`#${name}: ${getApiErrorMessage(error)}`);
        }
    }
};

const useSpotSave = (cityName, spot, onSaved) => {
    const [saving, setSaving] = useState(false);
    const save = async (form) => {
        if (!form.position) return toast('지도를 눌러 장소 위치를 정해 주세요.');
        setSaving(true);
        const payload = { name: form.name, category: form.category, description: form.description, lat: form.position.lat, lng: form.position.lng, imageUrls: form.imageUrls };
        try {
            const saved = await (spot ? updateSpot(spot.id, payload) : createSpot(cityName, payload));
            if (!spot) await addTagsAfterCreate(saved.id, form.tags);
            toast(spot ? '장소를 수정했어요.' : '장소를 등록했어요. 다른 여행자에게 바로 보여요.');
            onSaved();
        } catch (error) {
            toastError(getApiErrorMessage(error));
            setSaving(false);
        }
        return undefined;
    };
    return { saving, save };
};

const cleanTag = (text) => text.replace(/[#\s·]/g, '').toLowerCase();

// 새로 등록할 때만: 해시태그 (선택, 등록 뒤 달림. 등록한 장소의 태그는 장소 상세에서 고침)
const NewSpotTags = ({ form, set }) => (
    <>
        <label>해시태그 (선택)</label>
        {form.tags.length > 0 && <p className="new-spot-tags">{form.tags.map((name) => <button key={name} type="button" onClick={() => set('tags', form.tags.filter((item) => item !== name))}>#{name} ×</button>)}</p>}
        <HashtagInput exclude={form.tags} onAdd={(text) => { const name = cleanTag(text); if (name && !form.tags.includes(name)) set('tags', [...form.tags, name]); return true; }} />
    </>
);

// 종류(필수, 하나) + 새 장소면 해시태그
const KindFields = ({ form, set, isNew }) => (
    <>
        <label htmlFor="spotCategory">종류</label>
        <select id="spotCategory" value={form.category} onChange={(e) => set('category', e.target.value)} required>
            <option value="">골라 주세요</option>
            {SPOT_CATEGORIES.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
        </select>
        {isNew && <NewSpotTags form={form} set={set} />}
    </>
);

const SpotForm = ({ initial, center, provider, saving, onSubmit }) => {
    const [form, setForm] = useState(initial);
    const set = useCallback((key, value) => setForm((current) => ({ ...current, [key]: value })), []);
    const onPosition = useCallback((position) => set('position', position), [set]);
    // 검색으로 고르면 위치를 채우고, 이름이 비어 있으면 이름도 채움
    const onPick = ({ name, position }) => setForm((current) => ({ ...current, position, name: current.name || name }));
    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
            <label htmlFor="spotName">장소 이름</label>
            <input id="spotName" value={form.name} onChange={(e) => set('name', e.target.value)} maxLength="100" required />
            <KindFields form={form} set={set} isNew={form.isNew} />
            <label>위치 (검색하거나 지도를 눌러 표시)</label>
            <PlaceSearch provider={provider} center={center} onPick={onPick} />
            <LocationPicker provider={provider} center={center} position={form.position} onChange={onPosition} />
            <label htmlFor="spotDescription">소개 (선택)</label>
            <textarea id="spotDescription" rows="3" maxLength="1000" value={form.description} onChange={(e) => set('description', e.target.value)} />
            <label>사진 (선택, 최대 {MAX_PHOTOS}장)</label>
            <PhotoUploader images={form.imageUrls} max={MAX_PHOTOS} onChange={(urls) => set('imageUrls', urls)} />
            <p className="map-modal__hint">직접 찍은 사진만 올려 주세요. 사진의 촬영 위치 정보는 서버에서 지워져요.</p>
            <div className="map-modal__actions">
                <button type="submit" className="map-modal__button is-primary" disabled={saving}>{saving ? '저장 중…' : '저장'}</button>
            </div>
        </form>
    );
};

// 여행자 추천장소 등록(spot 없음)·수정(내가 등록한 spot)
const SpotFormModal = ({ cityName, center, provider, spot, onClose, onSaved }) => {
    const isLogin = useSelector((state) => state.logincheck.isLogin);
    const { saving, save } = useSpotSave(cityName, spot, onSaved);
    return (
        <MapModal title={spot ? '내 장소 수정' : '추천 장소 등록'} onClose={onClose}>
            {!isLogin && <LoginRequired action="장소를 등록" />}
            {isLogin && (
                <>
                    {!spot && <p className="map-modal__message">등록한 장소는 "여행자 추천"으로 바로 공개되고 닉네임이 함께 표시돼요.</p>}
                    <SpotForm initial={toForm(spot)} center={center} provider={provider} saving={saving} onSubmit={save} />
                </>
            )}
        </MapModal>
    );
};

export default SpotFormModal;
