import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { setLogin, setLogout } from "../modules/logincheck";
import { getCookie, removeCookie } from "../util/cookie";
import './Header.scss' ;

function Header({moveto}){
    const isLogin=useSelector(state=>state.logincheck.isLogin);
    const username=getCookie("username");
    const dispatch =useDispatch();
    const logoutClick = () =>{
        removeCookie('username');
        removeCookie('useremail');
        dispatch(setLogout());
        alert("로그아웃 되었습니다.")
    }
    useEffect(()=>{
        if(username){
            dispatch(setLogin());
        }
    },[])
    return(
        <header>
            <div className="header_top">
                <div className="header_top_left">
                    <Link to="/">
                        <h1>The나들이 <span>떠나 나들이</span></h1>
                    </Link>
                </div>
                <ul className="header_top_right">

                    <a href="tour" onClick={moveto}><li>여행지</li></a>
                    <a href="/guide"><li>이용방법</li></a>         
                    { isLogin? <a href="#"onClick={logoutClick}><li>로그아웃</li></a>:<Link to="/login"><li>로그인</li></Link>}
                </ul>
            </div>
        </header>    
    )
}

export default Header
