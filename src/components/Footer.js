import React from "react";
import { Link } from "react-router-dom";
import { CONTACT_EMAIL, SITE_NAME } from "../config/site";
import './Footer.scss';

function Footer() {
    return (
        <footer>
            <div className="inner">
                <div className="describe">
                    <Link to="/terms">이용약관</Link>|
                    <Link to="/privacy"><b>개인정보처리방침</b></Link>|
                    <Link to="/inquiries">고객 문의</Link>
                </div>
                <div className="brief">
                    <p>{SITE_NAME} · 여행 일정 플래너</p>
                    {CONTACT_EMAIL && <p>문의 {CONTACT_EMAIL}</p>}
                </div>
                <p>© {SITE_NAME}. All rights reserved.</p>
            </div>
        </footer>
    );
}

export default Footer;
