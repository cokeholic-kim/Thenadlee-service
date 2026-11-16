import React from 'react';
import './MainBottom.scss' ;

function MainBottom () {
    return (
        <div className='MainBottom'>
            <div className='MainBottom_left'>
                <p>
                    가고 싶은 곳을 지도에 담고 순서를 바꿔 보면서, 나에게 꼭 맞는 여행 동선을 만들어 보세요.
                </p>
            </div>
            <ul className='MainBottom_right'>
                <li>
                    <p className='MainBottom_right_stepBoldP'>STEP 1</p>
                    <p className='MainBottom_right_steplightP'>도시 고르기</p>
                </li>

                <li>
                    <p className='MainBottom_right_stepBoldP'>STEP 2</p>
                    <p className='MainBottom_right_steplightP'>장소 담기</p>
                </li>

                <li>
                    <p className='MainBottom_right_stepBoldP'>STEP 3</p>
                    <p className='MainBottom_right_steplightP'>동선 저장</p>
                </li>
            </ul>
        </div>
    );
};

export default MainBottom;
