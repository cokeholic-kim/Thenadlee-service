import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { resetPassword } from '../api/userApi';
import { getApiErrorMessage } from '../util/apiError';
import RecoveryCodeNotice from '../components/RecoveryCodeNotice';
import usePageMeta from '../seo/usePageMeta';
import { PAGE_META } from '../seo/pageMeta';
import { toastError } from '../ui/feedback';
import AuthLayout, { AuthField } from './AuthLayout';

const EMPTY_FORM = { loginId: '', recoveryCode: '', password: '', passwordConfirm: '' };

const useResetForm = () => {
    const [form, setForm] = useState(EMPTY_FORM);
    const [newRecoveryCode, setNewRecoveryCode] = useState('');
    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const onSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.passwordConfirm) return toastError('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
        try {
            setNewRecoveryCode((await resetPassword(form)).recoveryCode);
        } catch (error) {
            toastError(getApiErrorMessage(error));
        }
        return undefined;
    };
    return { form, newRecoveryCode, onChange, onSubmit };
};

// 이메일 대신 가입 때 받은 복구 코드로 비밀번호 재설정
const FindPass = () => {
    usePageMeta(PAGE_META.resetPassword);
    const navigate = useNavigate();
    const { form, newRecoveryCode, onChange, onSubmit } = useResetForm();
    if (newRecoveryCode) {
        return <RecoveryCodeNotice title="비밀번호 변경 완료" recoveryCode={newRecoveryCode} onConfirm={() => navigate('/login')} />;
    }
    return (
        <AuthLayout title="비밀번호 재설정" subtitle="가입할 때 받은 복구 코드로 새 비밀번호를 설정해요. 사용한 복구 코드는 새 코드로 바뀝니다.">
            <form onSubmit={onSubmit}>
                <AuthField id="loginId" label="아이디">
                    <input className="auth-input" id="loginId" name="loginId" type="text" value={form.loginId} onChange={onChange} autoComplete="username" required />
                </AuthField>
                <AuthField id="recoveryCode" label="복구 코드">
                    <input className="auth-input" id="recoveryCode" name="recoveryCode" type="text" placeholder="XXXX-XXXX-XXXX-XXXX" value={form.recoveryCode} onChange={onChange} required />
                </AuthField>
                <AuthField id="password" label="새 비밀번호" hint="영문자, 숫자, 특수문자 포함 8~20자">
                    <input className="auth-input" id="password" name="password" type="password" maxLength="20" value={form.password} onChange={onChange} autoComplete="new-password" required />
                </AuthField>
                <AuthField id="passwordConfirm" label="새 비밀번호 확인">
                    <input className="auth-input" id="passwordConfirm" name="passwordConfirm" type="password" maxLength="20" value={form.passwordConfirm} onChange={onChange} autoComplete="new-password" required />
                </AuthField>
                <button className="auth-primary" type="submit">비밀번호 변경</button>
            </form>
            <p className="auth-footnote">* 복구 코드를 잃어버렸다면 비밀번호를 재설정할 수 없어 새로 가입해야 합니다.</p>
            <div className="auth-links"><Link to="/login">로그인으로 돌아가기</Link></div>
        </AuthLayout>
    );
};

export default FindPass;
