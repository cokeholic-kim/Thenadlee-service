import React from 'react';
import PageLayout from '../../components/PageLayout';
import './Policy.scss';

const PolicyLayout = ({ title, effectiveDate, children }) => (
    <PageLayout>
        <article className="policy">
            <h1>{title}</h1>
            <p className="policy-date">시행일: {effectiveDate}</p>
            {children}
        </article>
    </PageLayout>
);

export default PolicyLayout;
