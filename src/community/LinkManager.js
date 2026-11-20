import React, { useState } from 'react';
import { getApiErrorMessage } from '../util/apiError';
import { providerLabel } from './SocialLinks';
import './SocialLinks.scss';

const MAX_LINKS = 3;

// 작성자 본인 전용: 내 SNS 게시물 링크 붙이기·지우기 (onAdd·onRemove 는 서버 호출 후 최신 목록을 돌려줌)
const LinkManager = ({ links, onAdd, onRemove, onChange, hint }) => {
    const [url, setUrl] = useState('');
    const [busy, setBusy] = useState(false);
    const run = async (action) => {
        setBusy(true);
        try { onChange(await action()); return true; } catch (error) { alert(getApiErrorMessage(error)); return false; } finally { setBusy(false); }
    };
    const submit = async (e) => {
        e.preventDefault();
        if (await run(() => onAdd(url.trim()))) setUrl('');
    };
    return (
        <div className="link-manager">
            <p className="link-manager__hint">{hint} 유튜브·인스타그램·틱톡·블로그 게시물 주소를 {MAX_LINKS}개까지 붙일 수 있어요.</p>
            {links.length > 0 && (
                <ul>
                    {links.map((link) => (
                        <li key={link.id}>
                            <span>{providerLabel(link.provider)}</span>
                            <span className="link-manager__url">{link.url}</span>
                            <button type="button" disabled={busy} onClick={() => run(() => onRemove(link.id))}>삭제</button>
                        </li>
                    ))}
                </ul>
            )}
            {links.length < MAX_LINKS && (
                <form onSubmit={submit}>
                    <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." required aria-label="SNS 게시물 주소" />
                    <button type="submit" disabled={busy}>붙이기</button>
                </form>
            )}
        </div>
    );
};

export default LinkManager;
