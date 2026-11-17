import React from 'react';
import "./MainTop.scss"

// 이용 순서 안내 (메인 오른쪽 영역 카드)
const STEPS = [
    { title: '도시 고르기', description: '아래 여행지 목록에서 떠나고 싶은 도시를 골라요.' },
    { title: '장소 담기', description: '운영진과 여행자가 추천한 장소를 일차별로 담고 순서를 바꿔요. 지도에 실제 이동 경로가 그려져요.' },
    { title: '일정 저장·공유', description: '로그인하고 저장하면 언제든 다시 열 수 있고, 공개하면 다른 여행자와 나눌 수 있어요.' },
];

const StepGuide = () => (
    <div className='mainGuide'>
        <p className='mainGuide__intro'>가고 싶은 곳을 지도에 담고 순서를 바꿔 보면서,<br/>나에게 꼭 맞는 여행 동선을 만들어 보세요.</p>
        <ol className='mainGuide__steps'>
            {STEPS.map((step, index) => (
                <li key={step.title} className='mainGuide__step'>
                    <span className='mainGuide__number'>STEP {index + 1}</span>
                    <div>
                        <strong>{step.title}</strong>
                        <p>{step.description}</p>
                    </div>
                </li>
            ))}
        </ol>
    </div>
);

const MainTop = ({moveto}) => {
    return (
        <div className='MainTop'>
            <div className='leftMainTop'>
                <div>
                    <h2>지도 위에서 짜는 나만의 여행</h2>
                </div>
                <h1><b>THE나들이</b></h1>
                <div id="startbutton">
                    <a onClick={moveto} className="mainstartbutton">시작하기</a>
                </div>
            </div>
            {/* 배경 동영상(57MB)은 트래픽 부담이 커서 그라데이션 배경 + 이용 순서 안내로 대체 */}
            <div className='mainVisual'>
                <StepGuide/>
            </div>
        </div>
    );
};

export default MainTop;
