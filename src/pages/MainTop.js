import React from 'react';
import "./MainTop.scss"

const MainTop = ({moveto}) => {
    return (
        <div className='MainTop'>
            <div className='leftMainTop'>
                <div>
                    <h2>효율적인 여행 가이드</h2>
                </div>
                <h1><b>THE나들이</b></h1>
                <div id="startbutton">
                    <a onClick={moveto} className="mainstartbutton">시작하기</a>
                </div>
            </div>
            <div className='videodiv'>
                <video autoPlay muted loop id="mainVideo">
                    <source src="./videos/Newyork.mp4" type="video/mp4"/>
                </video>
            </div>
        </div>
    );
};

export default MainTop;