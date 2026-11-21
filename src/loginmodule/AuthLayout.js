import React from 'react';
import { Link } from 'react-router-dom';
import './Auth.scss';

// 로그인 계열 화면 틀: 가운데 카드 + 서비스 이름(메인으로)
const AuthLayout = ({ title, subtitle, children }) => (
    <main className="auth-page">
        <div className="auth-card">
            <Link to="/" className="auth-home">The나들이</Link>
            <h1>{title}</h1>
            {subtitle && <p className="auth-subtitle">{subtitle}</p>}
            {children}
        </div>
    </main>
);

export const AuthField = ({ id, label, hint, children }) => (
    <div className="auth-field">
        <label htmlFor={id}>{label}</label>
        {children}
        {hint && <p className="auth-hint">{hint}</p>}
    </div>
);

export default AuthLayout;
