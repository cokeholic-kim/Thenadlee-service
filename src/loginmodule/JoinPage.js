import React, { useState } from 'react';
import axios from 'axios';
// import { API_URL } from '../../config/apiurl';
import './JoinPage.scss';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config/apiurl';

const JoinPage = () => {
    const navigate =useNavigate();
    const [formData,setFormData]=useState({
        m_name:"",
        m_pass:"",
        m_passch:"",
        m_nickname:"",
        m_email:"",
        m_phone:"",
        m_address1:"",
        m_address2:"",

    });
    const onChange = (e)=>{
        const {name,value} =e.target;
        setFormData({
            ...formData,
            [name]:value
        })
    }
    const check1=document.querySelector("#userAgeChecked");
    const check2=document.querySelector("#userPolicyChecked");
    const check3=document.querySelector("#userAgreementsChecked");
    
    //폼전송 이벤트
    const onSubmit = (e) => {
        e.preventDefault();
        if(formData.m_name !== ""&&formData.m_pass !==""&&formData.m_passch !=="" &&formData.m_nickname !==""&&formData.m_email !==""){
            if(check1.checked&&check2.checked&&check3.checked==true){ 
            // console.log("prevent통과")
                // console.log("빈칸통과")
                if(formData.m_pass==formData.m_passch){
                    // console.log("비밀번호들 일치")
                    if(checkPassword(formData.m_pass)==true){
                        // console.log("비밀번호 정규표현식 시작")
                        addMember();
                    }else{
                        alert("비밀번호의 형식이 일치하지 않습니다.")
                        // console.log("정규표현식이 틀림")
                    }
                }else{
                    alert("비밀번호와 비밀번호재확인이 일치하지 않습니다.")
                }
            }else{
                alert("약관에 동의하지 않았습니다.")
            }
        }else{
            alert("입력하지 않은 값이 존재합니다..")
        }
    }
    const addMember = () => {
        axios.post(`${API_URL}/join`,formData)
        .then(res=>{
            alert('등록되었습니다.');
            navigate('/');
        })
        .catch(e=>{
            console.log("에러발생")
            console.log(e);
        })
    }
    const checkPassword= (e) =>{
        // 영문자,특수문자,숫자 10~20자 사이
        const regExp = /^(?=.*[a-zA-Z])(?=.*[!@#$%^&*+=-])(?=.*[0-9]).{8,20}$/;
        if(regExp.test(e)){
            // alert("조건을 만족하였습니다.")
            addMember();
        }else{
            alert("비밀번호에는 영문자,특수문자,숫자가 1개이상 포함되어야 합니다.")
        }
    }

    return (
        <div className="container">
            <div className="text">Join us!!</div>
            <div className="small-text">효율적인 여행 가이드 THE-나들이</div>
            <form className="uk-form-stacked" onSubmit={onSubmit}>
                <div>
                    <label className="label-text" for="signInEmail">이메일</label>
                    <div className="uk-form-controls input-button-flex">
                        <input className="uk-input" type="text" id="signInEmail" maxLength="30"  name="m_email" value={formData.m_email} onChange={onChange} />
                        <button className="uk-button email-btn" id="checkDuplicationEmail">확인</button>
                    </div>
                </div>
                <div>
                    <label className="label-text" for="signInName">이름</label>
                    <div className="uk-form-controls">
                        <input className="uk-input" type="text" id="signInName"  name="m_name" maxLength="12" value={formData.m_name} onChange={onChange} />
                    </div>
                </div>
                <div>
                    <label className="label-text" for="signInNickname">닉네임</label>
                    <div className="uk-form-controls">
                        <input className="uk-input" type="text" id="signInNickname"  name="m_nickname" maxLength="12" value={formData.m_nickname} onChange={onChange}/>
                    </div>
                </div>
                <div>
                    <label className="label-text" for="signInPwd">비밀번호</label>
                    <div className="uk-form-controls"> 
                        <input className="uk-input" type="password" id="signInPwd"   name="m_pass"  placeholder="비밀번호(영문자, 숫자, 특수문자 포함 8~20자)" maxLength="20" value={formData.m_pass} required="" onChange={onChange} />
                    </div>
                </div>
                <div>
                    <label className="label-text" for="checkSignInPwd">비밀번호확인</label>
                    <div className="uk-form-controls">
                        <input className="uk-input" type="password" id="checkSignInPwd"  name="m_passch" placeholder="비밀번호 재입력"  value={formData.m_passch}  maxLength="20" required="" onChange={onChange} />
                    </div>
                </div>
                <div className="agree-container">
                    <span className="agree-link-container">
                        <label><input type="checkbox" id="userAgeChecked" name="color" value="blue"/>
                            본인은 만 14세 이상입니다.<span>(필수)</span></label>
                    </span>
                    <span className="agree-link-container">
                        <label><input type="checkbox" id="userPolicyChecked" name="color" value="blue"/>
                            개인정보수집에 동의합니다.
                            <span>(필수)</span></label>
                        {/* <a onclick="window.open('/userPolicy')" class="agree-link-text">보기</a> */}
                        <Link to="/UserPolicy" target="_blank"><li className="agree-link-text">보기</li></Link>
                    </span>
                    <table>
                        <tbody><tr>
                            <td>개인정보수집</td>
                        </tr>
                        <tr>
                            <td>목적</td>
                            <td className="second-td">
                                개인식별, 회원자격 유지・관리
                            </td>
                        </tr>
                        <tr>
                            <td>항목</td>
                            <td className="second-td">
                                이름,아이디,이메일,닉네임,비밀번호
                            </td>
                        </tr>
                        <tr>
                            <td>보유기간</td>
                            <td className="second-td">회원탈퇴 시 즉시 파기</td>
                        </tr>
                    </tbody></table>
                    <span className="agree-link-container">
                        <label><input type="checkbox" id="userAgreementsChecked"/>
                            이용약관에 동의합니다.
                            <span>(필수)</span></label>
                            <Link to="/UserPolicy2" target="_blank"><li className="agree-link-text">보기</li></Link>                    </span>
                </div>
                <div>
                    <button className="myro-btn" id="completeSignInAndSendVerifyCode">
                        회원가입
                    </button>
                </div>
            </form>
                <div>                    
                <Link to="/login"><button className="myro-btn-back" id="backPage">
                        뒤로가기
                    </button></Link>
                </div>
            <div className="small-text"></div>
        </div>
    );
};

export default JoinPage;