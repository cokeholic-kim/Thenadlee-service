import React from 'react';
import "./MainTop.scss"

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
            {/* 배경 동영상(57MB)은 트래픽 부담이 커서 내려받을 파일이 없는 CSS 그라데이션으로 대체 */}
            <div className='mainVisual' aria-hidden="true"/>
        </div>
    );
};

export default MainTop;