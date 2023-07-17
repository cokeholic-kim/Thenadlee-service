import React from "react";
import './Footer.scss';
import { AiFillInstagram,AiFillGithub,AiFillFacebook } from "react-icons/ai";

function Footer(){
    return(
        <footer>
            <div className="inner">
                <div className="icondiv">
                    <a href="#"><AiFillInstagram/></a>
                    <a href="#"><AiFillGithub/></a>
                    <a href="#"><AiFillFacebook/></a>
                </div>
                <div className="describe">
                    <a href="#">이용약관</a>|
                    <a href="#">이용방침</a>
                </div>
                <div className="brief">
                    <p>주식회사 더나들이</p>
                    <p>사업자등록번호 546-78-912</p>
                    <p>울산s</p>
                    <p>contant@yourself</p>
                </div>
                <p>© Thenadlee Co.,Ltd. All rights reserved.</p>
            </div>
        </footer>
    )
}

export default Footer