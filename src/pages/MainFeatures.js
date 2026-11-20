import React from 'react';
import { MdAttachMoney, MdDateRange, MdDirections, MdGroups, MdPhotoLibrary, MdPlace } from 'react-icons/md';
import { FEATURES, STEPS } from '../marketing/mainContent';
import './MainFeatures.scss';

const ICONS = { place: MdPlace, route: MdDirections, calendar: MdDateRange, group: MdGroups, money: MdAttachMoney, album: MdPhotoLibrary };

const FeatureCard = ({ feature }) => {
    const Icon = ICONS[feature.icon];
    return (
        <li className='mainFeatures__card'>
            <span className='mainFeatures__icon' aria-hidden='true'>{Icon && <Icon />}</span>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
        </li>
    );
};

// 메인: 할 수 있는 것 6가지 + 이용 순서 3단계
const MainFeatures = () => (
    <section className='mainFeatures' aria-labelledby='main-features-title'>
        <div className='mainFeatures__inner'>
            <p className='mainFeatures__eyebrow'>더 나들이로 할 수 있는 것</p>
            <h2 id='main-features-title'>계획부터 정산, 추억 정리까지 한곳에서</h2>
            <ul className='mainFeatures__grid'>
                {FEATURES.map((feature) => <FeatureCard key={feature.title} feature={feature} />)}
            </ul>
            <ol className='mainFeatures__steps' aria-label='이용 순서'>
                {STEPS.map((step, index) => (
                    <li key={step.title}>
                        <span className='mainFeatures__stepNo'>STEP {index + 1}</span>
                        <strong>{step.title}</strong>
                        <p>{step.description}</p>
                    </li>
                ))}
            </ol>
        </div>
    </section>
);

export default MainFeatures;
