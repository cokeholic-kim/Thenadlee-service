import React from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import usePageMeta from '../seo/usePageMeta';
import { PAGE_META } from '../seo/pageMeta';
import './policy/Policy.scss';

const NotFound = () => {
    usePageMeta(PAGE_META.notFound);
    return (
        <PageLayout>
            <article className="policy">
                <h1>페이지를 찾을 수 없습니다</h1>
                <p>주소가 바뀌었거나 삭제된 페이지입니다.</p>
                <p><Link to="/">메인으로 돌아가기</Link></p>
            </article>
        </PageLayout>
    );
};

export default NotFound;
