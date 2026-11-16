import React, { useState } from 'react';
import './RecoveryCodeNotice.scss';

// 복구 코드는 서버에 원문이 없어서 이 화면에서만 확인 가능
const RecoveryCodeNotice = ({ title, recoveryCode, onConfirm }) => {
    const [copied, setCopied] = useState(false);
    const [saved, setSaved] = useState(false);

    const copyCode = async () => {
        try {
            await navigator.clipboard.writeText(recoveryCode);
            setCopied(true);
        } catch (error) {
            alert('복사에 실패했습니다. 코드를 직접 적어 두세요.');
        }
    };

    return (
        <div className="container recovery-notice">
            <div className="text">{title}</div>
            <p className="recovery-desc">
                비밀번호를 잊었을 때 이 <b>복구 코드</b>로만 재설정할 수 있어요.<br />
                이 화면을 벗어나면 <b>다시 볼 수 없으니</b> 안전한 곳에 보관해 주세요.
            </p>
            <div className="recovery-code" aria-label="복구 코드">{recoveryCode}</div>
            <button type="button" className="auth-btn-secondary" onClick={copyCode}>
                {copied ? '복사됨' : '복구 코드 복사'}
            </button>
            <label className="recovery-check">
                <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} />
                복구 코드를 안전한 곳에 보관했습니다.
            </label>
            <button type="button" className="auth-btn" disabled={!saved} onClick={onConfirm}>
                확인
            </button>
        </div>
    );
};

export default RecoveryCodeNotice;
