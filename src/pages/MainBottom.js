import React from 'react';
import './MainBottom.scss' ;

function MainBottom () {
    return (
        <div className='MainBottom'>
            <div className='MainBottom_left'>
                <p>
                    여행 일자, 숙소, 가고 싶은 장소만 선택하면 일정이 자동으로 완성되는 쉽고 간편한 여행 일정 플래너
                </p>
            </div>
            <ul className='MainBottom_right'>
                <li>
                    <p className='MainBottom_right_stepBoldP'>STEP 1</p>
                    <p className='MainBottom_right_steplightP'>여행지 선택</p>
                </li>

                <li>
                    <p className='MainBottom_right_stepBoldP'>STEP 2</p>
                    <p className='MainBottom_right_steplightP'>장소 선택</p>
                </li>

                <li>
                    <p className='MainBottom_right_stepBoldP'>STEP 3</p>
                    <p className='MainBottom_right_steplightP'>일정 생성</p>
                </li>
            </ul>
        </div>
    );
};

export default MainBottom;