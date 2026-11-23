import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { adminApi } from '../api/adminApi';
import { getApiErrorMessage } from '../util/apiError';
import { toast, toastError } from '../ui/feedback';
import EditorStats from '../editor/EditorStats';
import { editorPath } from '../editor/editorPaths';

const toForm = (profile) => ({
    intro: profile.intro || '',
    links: [...profile.links.map((link) => link.url), ...Array(profile.maxLinks).fill('')].slice(0, profile.maxLinks),
    isPublic: profile.isPublic,
});

const useEditorProfile = () => {
    const [profile, setProfile] = useState(null);
    useEffect(() => { adminApi.getEditorProfile().then(setProfile).catch((error) => toastError(getApiErrorMessage(error))); }, []);
    const save = async (form) => {
        try {
            setProfile(await adminApi.saveEditorProfile({ ...form, links: form.links.filter((url) => url.trim() !== '') }));
            toast('프로필을 저장했어요.');
        } catch (error) {
            toastError(getApiErrorMessage(error));
        }
    };
    return { profile, save };
};

const LinkInputs = ({ links, onChange }) => links.map((url, index) => (
    // eslint-disable-next-line react/no-array-index-key
    <input key={index} type="url" value={url} placeholder="https://www.youtube.com/@내채널" aria-label={`SNS 주소 ${index + 1}`}
        onChange={(e) => onChange(links.map((value, i) => (i === index ? e.target.value : value)))} />
));

const ProfileForm = ({ profile, onSave }) => {
    const [form, setForm] = useState(() => toForm(profile));
    const set = (key, value) => setForm({ ...form, [key]: value });
    return (
        <form className="admin-form" onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
            <label>소개 <small>{form.intro.length} / {profile.introMaxLength}자</small>
                <textarea rows="4" value={form.intro} maxLength={profile.introMaxLength} placeholder="어떤 여행을 좋아하는지, 어떤 곳을 잘 아는지 적어 주세요." onChange={(e) => set('intro', e.target.value)} />
            </label>
            <div className="admin-form__group">
                <strong>내 SNS (유튜브·인스타그램·틱톡·블로그, {profile.maxLinks}개까지)</strong>
                <LinkInputs links={form.links} onChange={(links) => set('links', links)} />
            </div>
            <label className="admin-check"><input type="checkbox" checked={form.isPublic} onChange={(e) => set('isPublic', e.target.checked)} /> 프로필 공개 (소개 페이지와 내가 등록한 장소에 "에디터 {profile.nickName}" 표시)</label>
            <div className="admin-form__actions"><button type="submit" className="admin-button is-primary">저장</button></div>
        </form>
    );
};

const CityChips = ({ cities }) => (
    <p className="admin-chips">{cities === null ? <span>모든 여행지 (관리자)</span>
        : cities.length === 0 ? <span className="is-empty">아직 없어요. 관리자에게 요청해 주세요.</span>
            : cities.map((city) => <span key={city.id}>{city.displayName}</span>)}</p>
);

const ProfilePanel = () => {
    const { profile, save } = useEditorProfile();
    if (!profile) return <p className="admin__message">불러오는 중…</p>;
    return (
        <>
            <h2 className="admin-subtitle">담당 여행지</h2>
            <CityChips cities={profile.cities} />
            <h2 className="admin-subtitle">내 활동</h2>
            <EditorStats stats={profile.stats} />
            <h2 className="admin-subtitle">공개 프로필</h2>
            {profile.isPublic && profile.profileId && <p className="admin-hint">공개 중: <Link to={editorPath(profile.profileId)}>내 소개 페이지 보기</Link></p>}
            <ProfileForm key={profile.profileId ?? 'new'} profile={profile} onSave={save} />
        </>
    );
};

// 내 에디터 프로필 (에디터 이상): 공개하면 소개 페이지·장소 크레딧에 이름이 보임
const AdminEditorProfile = () => <AdminLayout title="내 에디터 프로필"><ProfilePanel /></AdminLayout>;

export default AdminEditorProfile;
