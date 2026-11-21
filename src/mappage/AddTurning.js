import React, { forwardRef, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { FiX } from "react-icons/fi";
import './AddTurning.scss' ;
import { setRight } from '../modules/add';

// 끌 수 있다는 표시: 가로줄 3줄
const GripLines = () => (
    <svg viewBox="0 0 20 14" aria-hidden="true" focusable="false">
        <path d="M2 2h16M2 7h16M2 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
);

// 손잡이에서 위·아래 화살표 키로도 순서를 바꿀 수 있음 (키보드 사용자)
const KEY_OFFSETS = { ArrowUp: -1, ArrowDown: 1 };

const DragHandle = forwardRef(({ spotName, onKeyMove }, ref) => (
    <button ref={ref} type="button" className="AddTurning_handle" data-drag-handle aria-label={`${spotName} 순서 바꾸기 (끌거나 위·아래 화살표 키)`}
        onKeyDown={(e) => { if (KEY_OFFSETS[e.key]) { e.preventDefault(); onKeyMove(KEY_OFFSETS[e.key]); } }}>
        <GripLines />
    </button>
));

// 화살표 키로 옮기면 카드가 DOM 에서 자리를 바꾸며 초점이 빠지므로, 옮긴 뒤 손잡이에 다시 초점
const useKeyMoveFocus = (index, onKeyMove) => {
    const handleRef = useRef(null);
    const keyMoved = useRef(false);
    useEffect(() => {
        if (!keyMoved.current) return;
        keyMoved.current = false;
        handleRef.current?.focus();
    }, [index]);
    const moveByKey = (offset) => { keyMoved.current = true; onKeyMove(index, offset); };
    return { handleRef, moveByKey };
};

// 일정에 담은 장소 카드: 끌어서 순서 바꾸기, 휴지통으로 빼기
const AddTurning = ({ adds, index, onKeyMove, dragProps }) => {
    const dispatch = useDispatch();
    const { handleRef, moveByKey } = useKeyMoveFocus(index, onKeyMove);
    return (
        <li className="AddTurning_contents_li" {...dragProps}>
            <div className="AddTurning_contents_img">
                {adds.imageUrl ? <img className='AddTurning_contents_img_i' src={adds.imageUrl} alt="" draggable="false" referrerPolicy="no-referrer" />
                    : <div className='AddTurning_contents_img_i AddTurning_noimg' />}
            </div>
            <div className="AddTurning_contents_p">
                <div className='AddTurning_contents_p_left'>
                    <p><span>{adds.spotName}</span></p>
                </div>
                <div className='AddTurning_contents_p_right'>
                    <button type="button" className="AddTurning_remove" onClick={() => dispatch(setRight(adds))} aria-label={`${adds.spotName} 일정에서 빼기`} title="일정에서 빼기"><FiX aria-hidden="true" /></button>
                </div>
            </div>
            <div className='AddTurning_contents_arrow'>
                <DragHandle ref={handleRef} spotName={adds.spotName} onKeyMove={moveByKey} />
            </div>
        </li>
    );
};

export default AddTurning;
