import React from 'react';
import './MonthDesc.scss'
const MonthDesc = ({recommenddesc}) => {
    return (
        <>
            <div className='descdiv'>
                <h4 className='titleh4'>여행 tip</h4>
                <p>{recommenddesc}</p>
            </div>
        </>
    );
};

export default MonthDesc;