import React, { useState } from 'react';
import { uploadPhoto } from '../api/communityApi';
import { resizeImage } from '../admin/resizeImage';
import { getApiErrorMessage } from '../util/apiError';

const ACCEPT_TYPES = 'image/jpeg,image/png,image/webp';

// 사진 올리기 (브라우저에서 줄인 뒤 업로드, 서버가 위치정보를 지우고 다시 저장)
const PhotoUploader = ({ images, onChange, max }) => {
    const [uploading, setUploading] = useState(false);
    const onSelect = async (e) => {
        const files = Array.from(e.target.files || []).slice(0, max - images.length);
        e.target.value = '';
        if (files.length === 0) return;
        setUploading(true);
        const uploaded = [...images];
        try {
            for (const file of files) uploaded.push((await uploadPhoto(await resizeImage(file))).url);
        } catch (error) {
            alert(error.response ? getApiErrorMessage(error) : error.message);
        } finally {
            onChange(uploaded);
            setUploading(false);
        }
    };
    return (
        <div className="photo-uploader">
            {images.map((url) => (
                <div key={url} className="photo-uploader__item">
                    <img src={url} alt="" />
                    <button type="button" onClick={() => onChange(images.filter((image) => image !== url))} aria-label="사진 빼기">×</button>
                </div>
            ))}
            {images.length < max && (
                <label className="photo-uploader__add">
                    {uploading ? '올리는 중…' : `+ 사진 (${images.length}/${max})`}
                    <input type="file" accept={ACCEPT_TYPES} multiple hidden disabled={uploading} onChange={onSelect} />
                </label>
            )}
        </div>
    );
};

export default PhotoUploader;
