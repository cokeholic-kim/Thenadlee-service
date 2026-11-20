import React from 'react';
import './MonthDesc.scss'
const MonthDesc = ({recommenddesc}) => {
    return (
        <>
            <div className='descdiv'>
                <h2 className='titleh4'>여행 tip</h2>
                {/* 관리자가 입력한 줄바꿈(날씨 / 축제 등)을 그대로 보여 줌 */}
                <p style={{fontSize:14, whiteSpace:'pre-line'}}>{recommenddesc}</p>
            </div>
        </>
    );
};

export default MonthDesc;