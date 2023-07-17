import React, { useState } from 'react';
import './Login.scss'
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { setCookie } from '../util/cookie';
import { goToHome, setLogin } from '../modules/logincheck';
import { API_URL } from '../config/apiurl';

const LogIn = () => {
    const dispatch = useDispatch();
    const navigate=useNavigate();
    const [loginData,setLoginData]=useState({
        useremail:"",
        userpass:""
    })
    const onChange= (e)=>{
        const {name,value} = e.target;
        setLoginData({
            ...loginData,
            [name]:value
        })
    }
    const onSubmit = (e) =>{
        //form 전송이벤트 제거
        e.preventDefault();
        //인풋에 입력되었는지 확인
        if(loginData.useremail === ''|| loginData.userpass === ''){
            alert("이메일과 비밀번호를 입력해주세요");
        }else{
            axios.post(`${API_URL}/login`,loginData)
            .then(result=>{
                const { m_email,m_nickname } =result.data[0];
                if(m_email && m_nickname){
                    alert("로그인 되었습니다.");
                    //현재 시간 객체
                    let expires =new Date();
                    //60분을 더한 값으로
                    expires.setMinutes(expires.getMinutes()+60);
                    //쿠키생성
                    setCookie('useremail',`${m_email}`,{path:'/',expires});
                    setCookie('username',`${m_nickname}`,{path:'/',expires});
                    dispatch(setLogin());
                    dispatch(goToHome(navigate))
                }
            })
            .catch(e=>{
                console.log(e)
            })
        }
    }
    return (
        <div className='center'>
            <div className='container'>
                <div className='text'>LOG IN</div>
                <div className='small-text'>효율적인 여행 가이드 THE-나들이</div>
                <div className='form-container'>
                    <form onSubmit={onSubmit}>
                        <div className='data'>
                            <label>E-mail</label>
                            <input type='text' onChange={onChange} name='useremail' value={loginData.useremail} required></input>
                        </div>
                        <div className='data'>
                            <label>Password</label>
                            <input type="password" value={loginData.userpass}  name='userpass' onChange={onChange} required=""></input>
                        </div>
                        <div className='forgot-pass'>
                            <Link to="/findPass">비밀번호를 잊으셨나요?</Link>
                        </div>
                        <div className='btn'>
                            <div className="inner"></div>
                            <button type="submit"  onClick={(e)=>{console.log(e)}}>로그인</button>
                        </div>
                    </form>
                    <div className='datsignup-linka'>
                        "회원이 아니라면?"
                        <Link to="/join">회원가입하기</Link>
                    </div>
                </div>
                <div className="divider-container">
                    <div className="divider"></div>
                    <span>or</span>
                </div>
                <div className="sns-text">SNS 간편 로그인</div>
                <div className="socialBtn-container">
                    <div className="socialBtn">
                        <div className="socialBtn-image-container" onClick={(e)=>{console.log(e)}}>
                            <img src="/imgs/kakaolink_btn.png" alt="logo"/>
                        </div>
                    </div>
                    <div className="socialBtn">
                        <div className="socialBtn-image-container" onClick={(e)=>{console.log(e)}}>
                            <img src="imgs/naver_btn.png" alt="logo"/>
                        </div>
                    </div>
                    
                    <div className="socialBtn google-mobile-login">
                        <div className="socialBtn-image-container" onClick={(e)=>{console.log(e)}}>
                            <img src="/imgs/google_btn.png" alt="logo"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        // <script src="/build/login.js"></script>
        // <script>
        //     let headAddress = 'https://www.myro.co.kr';
        //     let savedRouteTokenKey = '';
        //     let fromMobile = '0';
        // </script>
    );
};

export default LogIn;