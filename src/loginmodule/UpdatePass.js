import axios from 'axios';
import React,{useState} from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config/apiurl';

const UpdatePass = () => {
    
    const userid = useSelector(state=>state.logincheck.updateId)
    const navigate= useNavigate();
    const [formData,setFormData]=useState({
        m_pass:"",
        m_passch:"",
        m_email:userid
    })
    const onChange=(e)=>{
        const {name,value}= e.target;
        
        setFormData({
            ...formData,
            [name]:value   
        })
    }
    const onSubmit = (e) => {
        //axios.put은 리소스 전체를 patch는 일부를 업데이트 할수있게 해준다.
        e.preventDefault();
        if(formData.m_pass==formData.m_passch){
            axios.patch(`${API_URL}/updatePass`,formData)
            .then(res=>{
                if(res.data){
                    alert('패스워드가 변경되었습니다.');
                    navigate('/login')
                }
            })
            .catch(e=>{
                console.log(e)
            })
        }else{
            console.log(formData.m_pass)
            console.log(formData.m_passch)
            alert('비밀번호가 일치하지 않습니다.')
        }
    }
    return (
        <div className="container">
            <div className="text">비밀번호 변경</div>
            <form onSubmit={onSubmit}>
                <label className="label-text">비밀번호</label>
                <div className="uk-form-controls">
                    <input className="uk-input" value={formData.m_pass} name="m_pass" minLength="10" maxLength="20" onChange={onChange} type="password"placeholder="영문 대,소문자 + 숫자 + 특수문자를 포함하여 10~20자" />
                </div>
                <label className="label-text">비밀번호 재확인</label>
                <div className="uk-form-controls">
                    <input className="uk-input" value={formData.m_passch} name="m_passch" minLength="10" maxLength="20" onChange={onChange} type="password"placeholder="" />
                </div>
            <div>
                <button className="myro-btn" type="submit">발급받기</button>
            </div>
            </form>
            <div>
                <Link to="/login"><button className="myro-btn-back">뒤로가기</button></Link>
            </div>
        </div>
    );
};

export default UpdatePass;