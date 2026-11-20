import React from 'react';
import { Link } from 'react-router-dom';
import { FILE_URL } from '../config/apiurl';
import { HERO } from '../marketing/mainContent';
import './MainTop.scss';

// 실제 일정 만들기 화면 캡처를 브라우저 창 모양 안에 보여 줌 (첫 화면에서 서비스가 무엇인지 바로 보이게)
const HeroVisual = () => (
    <div className='mainHero__visual'>
        <div className='mainHero__frame'>
            <div className='mainHero__frameBar' aria-hidden='true'><span /><span /><span /></div>
            <img src={`${FILE_URL}${HERO.image.path}`} width={HERO.image.width} height={HERO.image.height}
                alt={HERO.image.alt} fetchpriority='high' />
        </div>
    </div>
);

// 메인 첫 화면: 서비스 한 줄 소개 + 시작 버튼 + 화면 미리 보기
const MainTop = ({ moveto }) => (
    <section className='mainHero'>
        <div className='mainHero__inner'>
            <div className='mainHero__text'>
                <p className='mainHero__eyebrow'>{HERO.eyebrow}</p>
                <h1 className='mainHero__title'>{HERO.titleLines.map((line) => <span key={line}>{line}</span>)}</h1>
                <p className='mainHero__description'>{HERO.description}</p>
                <div className='mainHero__actions'>
                    <a href='#places' onClick={moveto} className='mainHero__primary'>{HERO.primaryLabel}</a>
                    <Link to={HERO.secondaryPath} className='mainHero__secondary'>{HERO.secondaryLabel}</Link>
                </div>
                <ul className='mainHero__badges'>
                    {HERO.badges.map((badge) => <li key={badge}>{badge}</li>)}
                </ul>
            </div>
            <HeroVisual />
        </div>
    </section>
);

export default MainTop;
