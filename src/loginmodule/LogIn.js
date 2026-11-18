import React, { useState } from 'react';
import './Login.scss';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../api/userApi';
import { setLogin } from '../modules/logincheck';
import { getApiErrorMessage } from '../util/apiError';
import usePageMeta from '../seo/usePageMeta';
import { PAGE_META } from '../seo/pageMeta';

// 로그인 후 돌아갈 주소 (?next=/groups/1). 다른 사이트로 보내지 않도록 이 사이트 경로만 허용
const safeNextPath = (next) => (next && next.startsWith('/') && !next.startsWith('//') ? next : '/');

const LogIn = () => {
    usePageMeta(PAGE_META.login);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loginData, setLoginData] = useState({ loginId: '', password: '' });

    const onChange = (e) => {
        const { name, value } = e.target;
        setLoginData({ ...loginData, [name]: value });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            dispatch(setLogin(await login(loginData)));
            navigate(safeNextPath(searchParams.get('next')), { replace: true });
        } catch (error) {
            alert(getApiErrorMessage(error));
        }
    };

    return (
        <div className='center'>
            <div className='container'>
                <h1 className='text'>LOG IN</h1>
                <div className='small-text'>지도 위에서 짜는 나만의 여행, 더 나들이</div>
                <div className='form-container'>
                    <form onSubmit={onSubmit}>
                        <div className='data'>
                            <label htmlFor='loginId'>아이디</label>
                            <input id='loginId' type='text' name='loginId' value={loginData.loginId}
                                onChange={onChange} autoComplete='username' required />
                        </div>
                        <div className='data'>
                            <label htmlFor='password'>비밀번호</label>
                            <input id='password' type='password' name='password' value={loginData.password}
                                onChange={onChange} autoComplete='current-password' required />
                        </div>
                        <div className='forgot-pass'>
                            <Link to='/findPass'>비밀번호를 잊으셨나요?</Link>
                        </div>
                        <div className='btn'>
                            <div className='inner'></div>
                            <button type='submit'>로그인</button>
                        </div>
                    </form>
                    <div className='datsignup-linka'>
                        회원이 아니라면? <Link to='/join'>회원가입하기</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogIn;
