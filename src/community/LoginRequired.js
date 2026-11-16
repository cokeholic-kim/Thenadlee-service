import React from 'react';
import { Link } from 'react-router-dom';

// 로그인이 필요한 팝업 안내
const LoginRequired = ({ action }) => (
    <>
        <p className="map-modal__message">{action}하려면 로그인이 필요해요.</p>
        <div className="map-modal__actions">
            <Link to="/login" className="map-modal__button is-primary">로그인하기</Link>
        </div>
    </>
);

export default LoginRequired;
