import React, { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../api/userApi';
import { setLogin } from '../modules/logincheck';
import { getApiErrorMessage } from '../util/apiError';
import usePageMeta from '../seo/usePageMeta';
import { PAGE_META } from '../seo/pageMeta';
import { toastError } from '../ui/feedback';
import AuthLayout, { AuthField } from './AuthLayout';

// 로그인 후 돌아갈 주소 (?next=/groups/1). 다른 사이트로 보내지 않도록 이 사이트 경로만 허용
const safeNextPath = (next) => (next && next.startsWith('/') && !next.startsWith('//') ? next : '/');

const useLoginForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loginData, setLoginData] = useState({ loginId: '', password: '', remember: false });
    const onChange = (e) => {
        const { name, value, type, checked } = e.target;
        setLoginData({ ...loginData, [name]: type === 'checkbox' ? checked : value });
    };
    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            dispatch(setLogin(await login(loginData)));
            navigate(safeNextPath(searchParams.get('next')), { replace: true });
        } catch (error) {
            toastError(getApiErrorMessage(error));
        }
    };
    return { loginData, onChange, onSubmit, expired: searchParams.get('expired') === '1' };
};

const LogIn = () => {
    usePageMeta(PAGE_META.login);
    const { loginData, onChange, onSubmit, expired } = useLoginForm();
    const { search } = useLocation();
    return (
        <AuthLayout title="로그인" subtitle="지도 위에서 짜는 나만의 여행, 더 나들이">
            {expired && <p className="auth-notice">로그인 시간이 지나 로그아웃됐어요. 다시 로그인하면 보던 화면으로 돌아가요.</p>}
            <form onSubmit={onSubmit}>
                <AuthField id="loginId" label="아이디">
                    <input className="auth-input" id="loginId" type="text" name="loginId" value={loginData.loginId}
                        onChange={onChange} autoComplete="username" required />
                </AuthField>
                <AuthField id="password" label="비밀번호">
                    <input className="auth-input" id="password" type="password" name="password" value={loginData.password}
                        onChange={onChange} autoComplete="current-password" required />
                </AuthField>
                <label className="auth-check">
                    <input type="checkbox" name="remember" checked={loginData.remember} onChange={onChange} />
                    로그인 상태 유지 <em>(공용 PC에서는 사용하지 마세요)</em>
                </label>
                <button type="submit" className="auth-primary">로그인</button>
            </form>
            <div className="auth-links">
                <Link to="/findPass">비밀번호 재설정</Link>
                <span aria-hidden="true">·</span>
                <Link to={`/join${search}`}>회원가입</Link>
            </div>
        </AuthLayout>
    );
};

export default LogIn;
