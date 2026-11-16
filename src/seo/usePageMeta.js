import { useEffect } from 'react';
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_NAME, SITE_URL } from '../config/site';

const upsertMeta = (attribute, key, content) => {
    let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
    if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
    }
    element.setAttribute('content', content);
};

const upsertCanonical = (href) => {
    let element = document.head.querySelector('link[rel="canonical"]');
    if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', 'canonical');
        document.head.appendChild(element);
    }
    element.setAttribute('href', href);
};

// SPA 라 페이지 이동 시 제목·설명·대표 주소를 직접 바꿔줘야 검색엔진이 페이지별로 구분함
const usePageMeta = ({ title, description, path, noindex } = {}) => {
    useEffect(() => {
        const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
        const fullDescription = description || DEFAULT_DESCRIPTION;
        const url = `${SITE_URL}${path || window.location.pathname}`;
        document.title = fullTitle;
        upsertMeta('name', 'description', fullDescription);
        upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
        upsertMeta('property', 'og:title', fullTitle);
        upsertMeta('property', 'og:description', fullDescription);
        upsertMeta('property', 'og:url', url);
        upsertMeta('name', 'twitter:title', fullTitle);
        upsertMeta('name', 'twitter:description', fullDescription);
        upsertCanonical(url);
    }, [title, description, path, noindex]);
};

export default usePageMeta;
