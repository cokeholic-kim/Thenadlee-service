import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { groupApi } from '../api/groupApi';
import MapModal from '../community/MapModal';
import { getApiErrorMessage } from '../util/apiError';
import { PhotoTagFields, groupPhotos, VIEW_MODES } from './albumFormat';
import './Album.scss';

const POLL_INTERVAL_MS = 15000;

// 앨범 데이터 (보고 있는 동안 자동 갱신), run 은 변경 후 돌려받은 앨범으로 갱신
const useAlbum = (groupId) => {
    const [album, setAlbum] = useState(null);
    const reload = useCallback(() => groupApi.album(groupId).then(setAlbum).catch((error) => alert(getApiErrorMessage(error))), [groupId]);
    useEffect(() => {
        reload();
        const timer = setInterval(() => { if (document.visibilityState === 'visible') reload(); }, POLL_INTERVAL_MS);
        return () => clearInterval(timer);
    }, [reload]);
    const run = async (action) => {
        try {
            setAlbum(await action());
            return true;
        } catch (error) {
            alert(getApiErrorMessage(error));
            return false;
        }
    };
    return { album, run };
};

const EMPTY_TAGS = { dayNo: '', spotId: '', caption: '' };
const toPayload = (tags) => ({ dayNo: tags.dayNo || null, spotId: tags.spotId || null, caption: tags.caption });

// 고른 사진을 하나씩 올리고 앨범에 등록 (일차·장소·기록은 모두에 똑같이 붙음)
const useUpload = (groupId, run) => {
    const [progress, setProgress] = useState(null);
    const upload = async (files, tags) => {
        for (let index = 0; index < files.length; index += 1) {
            setProgress(`${index + 1} / ${files.length}`);
            const ok = await run(() => groupApi.addPhoto(groupId, files[index], toPayload(tags)));
            if (!ok) break;
        }
        setProgress(null);
    };
    return { progress, upload };
};

const UploadForm = ({ group, album, run }) => {
    const [files, setFiles] = useState([]);
    const [tags, setTags] = useState(EMPTY_TAGS);
    const { progress, upload } = useUpload(group.id, run);
    const submit = async (e) => {
        e.preventDefault();
        await upload(files, tags);
        setFiles([]);
        setTags(EMPTY_TAGS);
        e.target.reset();
    };
    return (
        <form className="album-upload" onSubmit={submit}>
            <label className="album-upload__file">사진 고르기 (여러 장 가능)<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => setFiles([...e.target.files])} /></label>
            <PhotoTagFields album={album} tags={tags} onChange={setTags} />
            <button type="submit" className="group-button is-primary" disabled={files.length === 0 || Boolean(progress)}>
                {progress ? `올리는 중 ${progress}` : `${files.length}장 올리기`}
            </button>
        </form>
    );
};

const PhotoEditForm = ({ group, album, photo, run, onDone }) => {
    const [tags, setTags] = useState({ dayNo: photo.dayNo ?? '', spotId: photo.spotId ?? '', caption: photo.caption ?? '' });
    const submit = async (e) => {
        e.preventDefault();
        if (await run(() => groupApi.updatePhoto(group.id, photo.id, toPayload(tags)))) onDone();
    };
    return (
        <form className="album-upload" onSubmit={submit}>
            <PhotoTagFields album={album} tags={tags} onChange={setTags} />
            <div className="group-actions">
                <button type="submit" className="group-button is-primary">저장</button>
                <button type="button" className="group-button" onClick={onDone}>취소</button>
            </div>
        </form>
    );
};

const PhotoActions = ({ group, album, photo, run, onEdit, onClose }) => (
    <div className="group-actions">
        {album.canFeature && <button type="button" className={`group-button is-small${photo.featured ? ' is-active' : ''}`}
            onClick={() => run(() => groupApi.featurePhoto(group.id, photo.id, !photo.featured))}>{photo.featured ? '★ 대표 사진' : '☆ 대표 사진으로'}</button>}
        {photo.canEdit && <button type="button" className="group-button is-small" onClick={onEdit}>정보 수정</button>}
        {photo.canDelete && <button type="button" className="group-button is-small is-danger"
            onClick={async () => window.confirm('이 사진을 지울까요? 파일도 함께 삭제돼요.') && await run(() => groupApi.deletePhoto(group.id, photo.id)) && onClose()}>삭제</button>}
    </div>
);

const PhotoViewer = ({ group, album, photo, run, onClose }) => {
    const [editing, setEditing] = useState(false);
    const meta = [photo.dayNo ? `${photo.dayNo}일차` : null, photo.spotName, `${photo.uploaderName} 님`].filter(Boolean).join(' · ');
    return (
        <MapModal title={photo.caption || '사진'} onClose={onClose} wide>
            <img className="album-viewer__image" src={photo.imageUrl} alt={photo.caption || '모임 사진'} />
            <p className="album-viewer__meta">{meta}</p>
            {editing
                ? <PhotoEditForm group={group} album={album} photo={photo} run={run} onDone={() => setEditing(false)} />
                : <PhotoActions group={group} album={album} photo={photo} run={run} onEdit={() => setEditing(true)} onClose={onClose} />}
        </MapModal>
    );
};

const PhotoGrid = ({ sections, onOpen }) => sections.map((section) => (
    <div key={section.key} className="album-section">
        <h3>{section.title} <span>{section.photos.length}</span></h3>
        <ul className="album-grid">
            {section.photos.map((photo) => (
                <li key={photo.id}>
                    <button type="button" onClick={() => onOpen(photo.id)} aria-label={photo.caption || '사진 크게 보기'}>
                        <img src={photo.imageUrl} alt={photo.caption || ''} loading="lazy" />
                        {photo.featured && <span className="album-grid__star">★</span>}
                        {photo.caption && <span className="album-grid__caption">{photo.caption}</span>}
                    </button>
                </li>
            ))}
        </ul>
    </div>
));

// 앨범 탭: 멤버 전용 사진 + 한 줄 기록, 일차별·장소별 보기
const AlbumTab = ({ group }) => {
    const { album, run } = useAlbum(group.id);
    const [mode, setMode] = useState('day');
    const [openId, setOpenId] = useState(null);
    const sections = useMemo(() => (album ? groupPhotos(album.photos, mode) : []), [album, mode]);
    if (!album) return <p>불러오는 중…</p>;
    const opened = album.photos.find((photo) => photo.id === openId);
    return (
        <>
            <section className="group-section">
                <h2>사진 올리기 <span className="group-hint">{album.count} / {album.maxPhotos}장</span></h2>
                <p className="group-hint">모임 멤버에게만 보여요. 사진의 촬영 위치 정보(EXIF)는 저장하지 않아요. 탈퇴하면 올린 사진도 함께 삭제돼요.</p>
                <UploadForm group={group} album={album} run={run} />
            </section>
            <section className="group-section">
                <div className="report-toolbar">
                    <h2>앨범</h2>
                    {VIEW_MODES.map((item) => <button key={item.value} type="button" className={`group-button is-small${mode === item.value ? ' is-active' : ''}`} onClick={() => setMode(item.value)}>{item.label}</button>)}
                </div>
                {album.count === 0 ? <p className="group-empty">아직 올린 사진이 없어요.</p> : <PhotoGrid sections={sections} onOpen={setOpenId} />}
            </section>
            {opened && <PhotoViewer group={group} album={album} photo={opened} run={run} onClose={() => setOpenId(null)} />}
        </>
    );
};

export default AlbumTab;
