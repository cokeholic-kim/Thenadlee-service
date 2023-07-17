import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaTrash } from "react-icons/fa";
import './AddTurning.scss' ;
import { setDown, setRight, setTop} from '../modules/add';
import { AiFillCaretUp,AiFillCaretDown } from "react-icons/ai";

// 데이터 카드(li)가 LeftControlbar로 넘어가기 위한 컴포넌트



const AddTurning = ({adds,uparr,downarr,index}) => {
    const dispatch = useDispatch() ;
    const onclick= ()=>{
        dispatch(setRight(adds.spotname,adds.nation,adds.lat,adds.lng ,adds.img,adds.time));
    }
    return (
            <li className="AddTurning_contents_li">
                <div className="AddTurning_contents_img">
                    <img className='AddTurning_contents_img_i' src={adds.img}></img>
                </div>
                <div className="AddTurning_contents_p">
                    <div className='AddTurning_contents_p_left'>
                        <p>{adds.nation}</p>
                        <p><span>{adds.spotname}</span></p>
                    </div>
                    <div className='AddTurning_contents_p_right'>
                        <div><span onClick={onclick}><FaTrash/></span></div>
                    </div>
                </div>
                <div className='AddTurning_contents_arrow'>
                    <AiFillCaretUp onClick={()=>uparr(index)}/>
                    <AiFillCaretDown onClick={()=>downarr(index)}/>
                </div>
            </li>
    );
};

export default AddTurning;