import React, { useState } from 'react';
import './JoinPage.scss';
import { Link, useNavigate } from 'react-router-dom';
import { checkLoginId, join } from '../api/userApi';
import { getApiErrorMessage } from '../util/apiError';
import RecoveryCodeNotice from '../components/RecoveryCodeNotice';
import usePageMeta from '../seo/usePageMeta';
import { PAGE_META } from '../seo/pageMeta';

// 서버와 같은 규칙 (영문 소문자·숫자·_ 4~20자 / 영문·숫자·특수문자 포함 8~20자)
const LOGIN_ID_PATTERN = /^[a-z0-9_]{4,20}$/;
const PASSWORD_PATTERN = /^(?=.*[a-zA-Z])(?=.*[!@#$%^&*+=-])(?=.*[0-9]).{8,20}$/;
const EMPTY_FORM = { loginId: '', nickName: '', password: '', passwordConfirm: '' };
const EMPTY_AGREE = { age: false, privacy: false, terms: false };

const validateForm = (form, agree, checkedLoginId) => {
    if (!LOGIN_ID_PATTERN.test(form.loginId)) return '아이디는 영문 소문자, 숫자, 밑줄(_)로 4~20자여야 합니다.';
    if (checkedLoginId !== form.loginId) return '아이디 중복 확인을 해주세요.';
    if (form.nickName.trim().length < 2) return '닉네임은 2~20자로 입력해주세요.';
    if (!PASSWORD_PATTERN.test(form.password)) return '비밀번호는 영문자, 숫자, 특수문자를 포함한 8~20자여야 합니다.';
    if (form.password !== form.passwordConfirm) return '비밀번호와 비밀번호 확인이 일치하지 않습니다.';
    if (!agree.age || !agree.privacy || !agree.terms) return '필수 항목에 모두 동의해주세요.';
    return null;
};

const JoinAgreements = ({ agree, onAgree }) => (
    <div className="agree-container">
        <span className="agree-link-container">
            <label><input type="checkbox" name="age" checked={agree.age} onChange={onAgree} />
                본인은 만 14세 이상입니다.<span>(필수)</span></label>
        </span>
        <span className="agree-link-container">
            <label><input type="checkbox" name="privacy" checked={agree.privacy} onChange={onAgree} />
                개인정보 수집·이용에 동의합니다.<span>(필수)</span></label>
            <Link to="/privacy" target="_blank" className="agree-link-text">보기</Link>
        </span>
        <table>
            <tbody>
                <tr><td>수집 항목</td><td className="second-td">아이디, 닉네임, 비밀번호(암호화 저장)</td></tr>
                <tr><td>목적</td><td className="second-td">회원 식별, 로그인</td></tr>
                <tr><td>보유 기간</td><td className="second-td">회원 탈퇴 시 즉시 파기</td></tr>
            </tbody>
        </table>
        <span className="agree-link-container">
            <label><input type="checkbox" name="terms" checked={agree.terms} onChange={onAgree} />
                이용약관에 동의합니다.<span>(필수)</span></label>
            <Link to="/terms" target="_blank" className="agree-link-text">보기</Link>
        </span>
    </div>
);

const JoinPage = () => {
    usePageMeta(PAGE_META.join);
    const navigate = useNavigate();
    const [form, setForm] = useState(EMPTY_FORM);
    const [agree, setAgree] = useState(EMPTY_AGREE);
    const [checkedLoginId, setCheckedLoginId] = useState('');
    const [recoveryCode, setRecoveryCode] = useState('');

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: name === 'loginId' ? value.toLowerCase() : value });
    };
    const onAgree = (e) => setAgree({ ...agree, [e.target.name]: e.target.checked });

    const onCheckLoginId = async () => {
        try {
            const result = await checkLoginId(form.loginId);
            setCheckedLoginId(result.available ? result.loginId : '');
            alert(result.available ? '사용할 수 있는 아이디입니다.' : '이미 사용 중인 아이디입니다.');
        } catch (error) {
            alert(getApiErrorMessage(error));
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const errorMessage = validateForm(form, agree, checkedLoginId);
        if (errorMessage) return alert(errorMessage);
        try {
            setRecoveryCode((await join(form)).recoveryCode);
        } catch (error) {
            alert(getApiErrorMessage(error));
        }
    };

    if (recoveryCode) {
        return <RecoveryCodeNotice title="가입 완료" recoveryCode={recoveryCode} onConfirm={() => navigate('/login')} />;
    }
    return (
        <div className="container">
            <h1 className="text">회원가입</h1>
            <div className="small-text">지도 위에서 짜는 나만의 여행, 더 나들이</div>
            <form className="auth-form" onSubmit={onSubmit}>
                <label className="label-text" htmlFor="loginId">아이디 (영문 소문자·숫자·_ 4~20자)</label>
                <div className="input-button-flex">
                    <input className="auth-input" type="text" id="loginId" name="loginId" maxLength="20"
                        value={form.loginId} onChange={onChange} autoComplete="username" />
                    <button type="button" className="email-btn" onClick={onCheckLoginId}>확인</button>
                </div>
                <label className="label-text" htmlFor="nickName">닉네임 (2~20자)</label>
                <input className="auth-input" type="text" id="nickName" name="nickName" maxLength="20"
                    value={form.nickName} onChange={onChange} />
                <label className="label-text" htmlFor="password">비밀번호</label>
                <input className="auth-input" type="password" id="password" name="password" maxLength="20"
                    placeholder="영문자, 숫자, 특수문자 포함 8~20자" value={form.password} onChange={onChange}
                    autoComplete="new-password" />
                <label className="label-text" htmlFor="passwordConfirm">비밀번호 확인</label>
                <input className="auth-input" type="password" id="passwordConfirm" name="passwordConfirm" maxLength="20"
                    value={form.passwordConfirm} onChange={onChange} autoComplete="new-password" />
                <JoinAgreements agree={agree} onAgree={onAgree} />
                <button type="submit" className="auth-btn">회원가입</button>
            </form>
            <Link to="/login"><button type="button" className="auth-btn-secondary">뒤로가기</button></Link>
        </div>
    );
};

export default JoinPage;
