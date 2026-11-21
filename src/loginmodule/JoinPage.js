import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { checkLoginId, join } from '../api/userApi';
import { getApiErrorMessage } from '../util/apiError';
import RecoveryCodeNotice from '../components/RecoveryCodeNotice';
import usePageMeta from '../seo/usePageMeta';
import { PAGE_META } from '../seo/pageMeta';
import { toast, toastError } from '../ui/feedback';
import { trackEvent } from '../analytics/analytics';
import AuthLayout, { AuthField } from './AuthLayout';

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

const AgreeCheck = ({ name, checked, onAgree, children, link }) => (
    <div className="auth-check-row">
        <label className="auth-check">
            <input type="checkbox" name={name} checked={checked} onChange={onAgree} />{children} <em>(필수)</em>
        </label>
        {link && <Link to={link} target="_blank">보기</Link>}
    </div>
);

// 전체 동의 + 항목별 동의 (체크 영역은 줄 전체)
const JoinAgreements = ({ agree, onAgree, onAgreeAll }) => (
    <fieldset className="auth-agree">
        <legend className="sr-only">약관 동의</legend>
        <label className="auth-check is-all">
            <input type="checkbox" checked={agree.age && agree.privacy && agree.terms} onChange={(e) => onAgreeAll(e.target.checked)} />
            전체 동의
        </label>
        <AgreeCheck name="age" checked={agree.age} onAgree={onAgree}>본인은 만 14세 이상입니다.</AgreeCheck>
        <AgreeCheck name="privacy" checked={agree.privacy} onAgree={onAgree} link="/privacy">개인정보 수집·이용 동의</AgreeCheck>
        <table className="auth-agree-table">
            <tbody>
                <tr><td>수집 항목</td><td>아이디, 닉네임, 비밀번호(암호화 저장)</td></tr>
                <tr><td>목적</td><td>회원 식별, 로그인</td></tr>
                <tr><td>보유 기간</td><td>회원 탈퇴 시 즉시 파기</td></tr>
            </tbody>
        </table>
        <AgreeCheck name="terms" checked={agree.terms} onAgree={onAgree} link="/terms">이용약관 동의</AgreeCheck>
    </fieldset>
);

const useLoginIdCheck = (loginId) => {
    const [checkedLoginId, setCheckedLoginId] = useState('');
    const onCheck = async () => {
        try {
            const result = await checkLoginId(loginId);
            setCheckedLoginId(result.available ? result.loginId : '');
            (result.available ? toast : toastError)(result.available ? '사용할 수 있는 아이디입니다.' : '이미 사용 중인 아이디입니다.');
        } catch (error) {
            toastError(getApiErrorMessage(error));
        }
    };
    return { checkedLoginId, onCheck };
};

const useJoinForm = () => {
    const [form, setForm] = useState(EMPTY_FORM);
    const [agree, setAgree] = useState(EMPTY_AGREE);
    const [recoveryCode, setRecoveryCode] = useState('');
    const idCheck = useLoginIdCheck(form.loginId);
    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.name === 'loginId' ? e.target.value.toLowerCase() : e.target.value });
    const onAgree = (e) => setAgree({ ...agree, [e.target.name]: e.target.checked });
    const onAgreeAll = (checked) => setAgree({ age: checked, privacy: checked, terms: checked });
    const onSubmit = async (e) => {
        e.preventDefault();
        const errorMessage = validateForm(form, agree, idCheck.checkedLoginId);
        if (errorMessage) return toastError(errorMessage);
        try {
            setRecoveryCode((await join(form)).recoveryCode);
            trackEvent('sign_up');
        } catch (error) {
            toastError(getApiErrorMessage(error));
        }
        return undefined;
    };
    return { form, agree, recoveryCode, idCheck, onChange, onAgree, onAgreeAll, onSubmit };
};

const JoinFields = ({ form, onChange, onCheckId }) => (
    <>
        <AuthField id="loginId" label="아이디" hint="영문 소문자·숫자·_ 4~20자">
            <div className="auth-input-row">
                <input className="auth-input" type="text" id="loginId" name="loginId" maxLength="20" value={form.loginId} onChange={onChange} autoComplete="username" />
                <button type="button" className="auth-inline-button" onClick={onCheckId}>중복 확인</button>
            </div>
        </AuthField>
        <AuthField id="nickName" label="닉네임" hint="2~20자">
            <input className="auth-input" type="text" id="nickName" name="nickName" maxLength="20" value={form.nickName} onChange={onChange} />
        </AuthField>
        <AuthField id="password" label="비밀번호" hint="영문자, 숫자, 특수문자 포함 8~20자">
            <input className="auth-input" type="password" id="password" name="password" maxLength="20" value={form.password} onChange={onChange} autoComplete="new-password" />
        </AuthField>
        <AuthField id="passwordConfirm" label="비밀번호 확인">
            <input className="auth-input" type="password" id="passwordConfirm" name="passwordConfirm" maxLength="20" value={form.passwordConfirm} onChange={onChange} autoComplete="new-password" />
        </AuthField>
    </>
);

const JoinPage = () => {
    usePageMeta(PAGE_META.join);
    const navigate = useNavigate();
    const { form, agree, recoveryCode, idCheck, onChange, onAgree, onAgreeAll, onSubmit } = useJoinForm();
    if (recoveryCode) {
        return <RecoveryCodeNotice title="가입 완료" recoveryCode={recoveryCode} onConfirm={() => navigate('/login')} />;
    }
    return (
        <AuthLayout title="회원가입" subtitle="아이디·닉네임·비밀번호만으로 가입해요. 이메일·실명은 받지 않아요.">
            <form onSubmit={onSubmit}>
                <JoinFields form={form} onChange={onChange} onCheckId={idCheck.onCheck} />
                <JoinAgreements agree={agree} onAgree={onAgree} onAgreeAll={onAgreeAll} />
                <button type="submit" className="auth-primary">가입하기</button>
            </form>
            <div className="auth-links">이미 회원이라면 <Link to="/login">로그인</Link></div>
        </AuthLayout>
    );
};

export default JoinPage;
