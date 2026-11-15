import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { API_URL } from '../config/apiurl';
import { getApiErrorMessage } from '../util/apiError';

const UpdatePass = () => {
    const navigate = useNavigate();
    // 재설정 메일 링크(/updatePass?token=...)로 들어온 토큰
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';
    const [formData, setFormData] = useState({
        m_pass: "",
        m_passch: ""
    })
    const onChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        })
    }
    const onSubmit = (e) => {
        e.preventDefault();
        if (formData.m_pass !== formData.m_passch) {
            alert('비밀번호가 일치하지 않습니다.')
            return;
        }
        axios.post(`${API_URL}/updatePass`, { ...formData, token })
            .then(res => {
                alert(res.data.body.message);
                navigate('/login')
            })
            .catch(e => {
                alert(getApiErrorMessage(e))
            })
    }
    if (!token) {
        return (
            <div className="container">
                <div className="text">비밀번호 변경</div>
                <div className="small-text">유효하지 않은 접근입니다. 비밀번호 찾기에서 재설정 메일을 다시 받아주세요.</div>
                <Link to="/findPass"><button className="myro-btn-back">비밀번호 찾기</button></Link>
            </div>
        );
    }
    return (
        <div className="container">
            <div className="text">비밀번호 변경</div>
            <form onSubmit={onSubmit}>
                <label className="label-text">비밀번호</label>
                <div className="uk-form-controls">
                    <input className="uk-input" value={formData.m_pass} name="m_pass" minLength="8" maxLength="20" onChange={onChange} type="password" placeholder="영문자, 숫자, 특수문자를 포함하여 8~20자" />
                </div>
                <label className="label-text">비밀번호 재확인</label>
                <div className="uk-form-controls">
                    <input className="uk-input" value={formData.m_passch} name="m_passch" minLength="8" maxLength="20" onChange={onChange} type="password" placeholder="" />
                </div>
                <div>
                    <button className="myro-btn" type="submit">변경하기</button>
                </div>
            </form>
            <div>
                <Link to="/login"><button className="myro-btn-back">뒤로가기</button></Link>
            </div>
        </div>
    );
};

export default UpdatePass;
