import axios from 'axios';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config/apiurl';
import { getApiErrorMessage } from '../util/apiError';

const FindPass = () => {
    const [mailSent, setMailSent] = useState(false)
    const [findPassdata, setFindPassData] = useState({
        useremail: ""
    })
    const onChange = (e) => {
        const { name, value } = e.target;
        setFindPassData({
            [name]: value
        })
    }
    // 가입된 이메일이면 서버가 비밀번호 재설정 링크를 메일로 발송함
    const onSubmit = (e) => {
        e.preventDefault();
        axios.post(`${API_URL}/findPass`, findPassdata)
            .then(res => {
                alert(res.data.body.message)
                setMailSent(true)
            })
            .catch(e => { alert(getApiErrorMessage(e)) })
    }
    return (
        <div className="container">
            <div className="text">비밀번호 찾기</div>
            {mailSent ?
                <div className="small-text">메일함을 확인해주세요. 메일의 링크에서 새 비밀번호를 설정할 수 있습니다.</div> :
                <form onSubmit={onSubmit}>
                    <label className="label-text">이메일</label>
                    <div className="uk-form-controls">
                        <input className="uk-input" value={findPassdata.useremail} name="useremail" onChange={onChange} type="text" placeholder="" />
                    </div>
                    <div className="small-text">회원가입시 등록하셨던 이메일 주소를 입력해주시면 비밀번호 재설정 링크를 보내드립니다.</div>
                    <div>
                        <button className="myro-btn" type="submit">재설정 메일 받기</button>
                    </div>
                </form>
            }
            {mailSent ? <></> : <div className="small-text">* 가입한 이메일이 기억나지 않는다면 새로 가입부탁드립니다.</div>}
            <div>
                <Link to="/login"><button className="myro-btn-back">뒤로가기</button></Link>
            </div>
        </div>
    );
};

export default FindPass;
