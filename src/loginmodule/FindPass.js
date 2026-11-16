import React, { useState } from 'react';
import './JoinPage.scss';
import { Link, useNavigate } from 'react-router-dom';
import { resetPassword } from '../api/userApi';
import { getApiErrorMessage } from '../util/apiError';
import RecoveryCodeNotice from '../components/RecoveryCodeNotice';
import usePageMeta from '../seo/usePageMeta';
import { PAGE_META } from '../seo/pageMeta';

const EMPTY_FORM = { loginId: '', recoveryCode: '', password: '', passwordConfirm: '' };

// 이메일 대신 가입 때 받은 복구 코드로 비밀번호 재설정
const FindPass = () => {
    usePageMeta(PAGE_META.resetPassword);
    const navigate = useNavigate();
    const [form, setForm] = useState(EMPTY_FORM);
    const [newRecoveryCode, setNewRecoveryCode] = useState('');

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.passwordConfirm) {
            return alert('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
        }
        try {
            setNewRecoveryCode((await resetPassword(form)).recoveryCode);
        } catch (error) {
            alert(getApiErrorMessage(error));
        }
    };

    if (newRecoveryCode) {
        return (
            <RecoveryCodeNotice title="비밀번호 변경 완료" recoveryCode={newRecoveryCode}
                onConfirm={() => navigate('/login')} />
        );
    }
    return (
        <div className="container">
            <h1 className="text">비밀번호 재설정</h1>
            <div className="small-text">가입할 때 받은 복구 코드로 새 비밀번호를 설정해요. 사용한 복구 코드는 새 코드로 바뀝니다.</div>
            <form onSubmit={onSubmit}>
                <label className="label-text" htmlFor="loginId">아이디</label>
                <input className="auth-input" id="loginId" name="loginId" type="text" value={form.loginId}
                    onChange={onChange} autoComplete="username" required />
                <label className="label-text" htmlFor="recoveryCode">복구 코드</label>
                <input className="auth-input" id="recoveryCode" name="recoveryCode" type="text" placeholder="XXXX-XXXX-XXXX-XXXX"
                    value={form.recoveryCode} onChange={onChange} required />
                <label className="label-text" htmlFor="password">새 비밀번호</label>
                <input className="auth-input" id="password" name="password" type="password" maxLength="20"
                    placeholder="영문자, 숫자, 특수문자 포함 8~20자" value={form.password} onChange={onChange}
                    autoComplete="new-password" required />
                <label className="label-text" htmlFor="passwordConfirm">새 비밀번호 확인</label>
                <input className="auth-input" id="passwordConfirm" name="passwordConfirm" type="password" maxLength="20"
                    value={form.passwordConfirm} onChange={onChange} autoComplete="new-password" required />
                <button className="auth-btn" type="submit">비밀번호 변경</button>
            </form>
            <div className="small-text">* 복구 코드를 잃어버렸다면 비밀번호를 재설정할 수 없어 새로 가입해야 합니다.</div>
            <Link to="/login"><button type="button" className="auth-btn-secondary">뒤로가기</button></Link>
        </div>
    );
};

export default FindPass;
