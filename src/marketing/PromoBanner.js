import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PROMOTIONS } from './mainContent';
import './PromoBanner.scss';

const SLIDE_MILLIS = 6000;

const isActive = (promotion, today) =>
    (!promotion.startDate || promotion.startDate <= today) && (!promotion.endDate || today <= promotion.endDate);

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// 마우스를 올리거나 버튼에 초점이 있으면 멈춤, 움직임 줄이기 설정이면 자동으로 넘기지 않음
const useAutoSlide = (count, paused) => {
    const [index, setIndex] = useState(0);
    useEffect(() => {
        if (count < 2 || paused || prefersReducedMotion()) return undefined;
        const timer = setInterval(() => setIndex((current) => (current + 1) % count), SLIDE_MILLIS);
        return () => clearInterval(timer);
    }, [count, paused]);
    return [index, setIndex];
};

// 사이트 안 주소는 Link, #places 는 여행지 목록으로 스크롤, 외부(제휴) 주소는 새 창 + 광고 링크 표시
const PromoLink = ({ promotion, onScroll }) => {
    if (promotion.url) {
        const rel = promotion.sponsored ? 'sponsored noopener noreferrer' : 'noopener noreferrer';
        return <a className='promoBanner__link' href={promotion.url} target='_blank' rel={rel}>{promotion.linkLabel}</a>;
    }
    if (promotion.path?.startsWith('#')) {
        return <a className='promoBanner__link' href={promotion.path} onClick={onScroll}>{promotion.linkLabel}</a>;
    }
    return <Link className='promoBanner__link' to={promotion.path}>{promotion.linkLabel}</Link>;
};

const Slide = ({ promotion, active, onScroll }) => (
    <li className={`promoBanner__slide is-${promotion.theme}`} aria-hidden={!active}>
        <span className='promoBanner__label'>{promotion.sponsored ? '광고' : promotion.label}</span>
        <h2>{promotion.title}</h2>
        <p>{promotion.description}</p>
        {active && <PromoLink promotion={promotion} onScroll={onScroll} />}
    </li>
);

const Dots = ({ count, index, onSelect }) => (
    <div className='promoBanner__dots'>
        {Array.from({ length: count }, (_, i) => (
            <button key={i} type='button' className={i === index ? 'active' : ''} aria-label={`${i + 1}번째 배너 보기`}
                aria-current={i === index} onClick={() => onSelect(i)} />
        ))}
    </div>
);

// 메인 배너: 서비스 기능 소개·계절 기획전·제휴(항공권·관광 홍보) 배너를 돌아가며 보여 줌
const PromoBanner = ({ onScroll }) => {
    const promotions = useMemo(() => PROMOTIONS.filter((item) => isActive(item, new Date().toISOString().slice(0, 10))), []);
    const [paused, setPaused] = useState(false);
    const [index, setIndex] = useAutoSlide(promotions.length, paused);
    if (promotions.length === 0) return null;
    return (
        <section className='promoBanner' aria-roledescription='carousel' aria-label='추천 배너'
            onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
            <ul className='promoBanner__track' style={{ transform: `translateX(-${index * 100}%)` }}>
                {promotions.map((item, i) => <Slide key={item.id} promotion={item} active={i === index} onScroll={onScroll} />)}
            </ul>
            {promotions.length > 1 && <Dots count={promotions.length} index={index} onSelect={setIndex} />}
        </section>
    );
};

export default PromoBanner;
