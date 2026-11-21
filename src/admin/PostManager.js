import React, { useState } from 'react';
import { adminApi } from '../api/adminApi';
import { getApiErrorMessage } from '../util/apiError';
import { toastError, confirmDialog } from '../ui/feedback';

// 여행기(블로그 포스팅) 링크 목록·추가·삭제. 지도 화면 "여행기" 팝업에 순서대로 표시
const PostManager = ({ cityId, posts, onChanged }) => {
    const [postUrl, setPostUrl] = useState('');
    const run = async (action) => {
        try { await action(); onChanged(); return true; } catch (error) { toastError(getApiErrorMessage(error)); return false; }
    };
    const onAdd = async (e) => {
        e.preventDefault();
        if (await run(() => adminApi.addPost(cityId, postUrl))) setPostUrl('');
    };
    return (
        <section className="admin-section">
            <h2>여행기 링크 ({posts.length})</h2>
            <p className="admin__hint">네이버 블로그 등 일부 사이트는 다른 사이트 안에 표시(iframe)를 막아 팝업에서 보이지 않을 수 있어요.</p>
            <ul className="admin-list">
                {posts.map((post) => (
                    <li key={post.id} className="admin-list__item">
                        <a className="admin-list__text" href={post.postUrl} target="_blank" rel="noreferrer">{post.postUrl}</a>
                        <button type="button" className="admin-button is-danger"
                            onClick={async () => await confirmDialog('이 여행기 링크를 삭제할까요?') && run(() => adminApi.deletePost(post.id))}>삭제</button>
                    </li>
                ))}
            </ul>
            <form className="admin-form admin-form--row" onSubmit={onAdd}>
                <input type="url" value={postUrl} onChange={(e) => setPostUrl(e.target.value)} placeholder="https://..." required />
                <button type="submit" className="admin-button is-primary">추가</button>
            </form>
        </section>
    );
};

export default PostManager;
