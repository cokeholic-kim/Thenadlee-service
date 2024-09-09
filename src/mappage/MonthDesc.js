import React from 'react';
import './MonthDesc.scss'
const MonthDesc = ({recommenddesc}) => {
    return (
        <>
            <div className='descdiv'>
                <h2 className='titleh4'>여행 tip</h2>
                <p style={{fontSize:14}}>{recommenddesc}</p>
            </div>
        </>
    );
};

export default MonthDesc;