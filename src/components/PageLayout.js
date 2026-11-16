import React from 'react';
import Header from './Header';
import Footer from './Footer';
import './PageLayout.scss';

// 헤더 높이만큼 본문을 내리고, 내용이 짧아도 푸터는 항상 화면 맨 아래에 붙는 공통 레이아웃
const PageLayout = ({ className = '', children }) => (
    <div className="page-layout">
        <Header />
        <main className={`page-layout__content ${className}`}>{children}</main>
        <Footer />
    </div>
);

export default PageLayout;
