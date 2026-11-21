import React, { useState } from 'react';
import { adminApi } from '../api/adminApi';
import { getApiErrorMessage } from '../util/apiError';
import { resizeImage } from './resizeImage';
import { toast } from '../ui/feedback';

// 이미지 주소 입력 + 파일 올리기 (올리면 /file/uploads/... 주소가 채워짐)
const ImageUploadField = ({ id, label, value, onChange }) => {
    const [uploading, setUploading] = useState(false);

    const onSelectFile = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        setUploading(true);
        try {
            const uploaded = await adminApi.uploadImage(await resizeImage(file));
            onChange(uploaded.url);
        } catch (error) {
            toast(error.response ? getApiErrorMessage(error) : error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="admin-image-field">
            <label htmlFor={id}>{label}</label>
            <div className="admin-image-field__row">
                {value ? <img src={value} alt="" /> : <div className="admin-image-field__empty">이미지 없음</div>}
                <div className="admin-image-field__inputs">
                    <input id={id} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="/file/... 또는 https://..." />
                    <label className="admin-button">
                        {uploading ? '올리는 중…' : '이미지 올리기'}
                        <input type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={uploading} onChange={onSelectFile} />
                    </label>
                </div>
            </div>
        </div>
    );
};

export default ImageUploadField;
