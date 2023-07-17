import { FaInfoCircle } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { setLeft } from "../modules/add";
import { setENTER, setLEAVE } from "../modules/hover";
import './AddSpot.scss' ;

// 데이터 카드(li)에 대한 컴포넌트

const AddSpot = ({spotname,nation, p_lat, p_lng , img,  time ,map}) => {
    const adds = useSelector(state=>state.add.right)

    // const [deleteArr, setDeleteArr ] = useState(spotname) ; 
    const dispatch = useDispatch() ;
    const onclick= ()=>{

        dispatch(setLeft(spotname,nation,p_lat,p_lng,img,time));
        

        // +시 배열에서 삭제
        // const  = state.adds.filter(add=> add.spotname !== action.spotname)
    }

    const onMouseEnter = (lat,lng)=>{
        dispatch(setENTER(lat,lng))
        map.panTo({lat,lng})
    }

    // const onMouseleave = ()=>{
    //     dispatch(setLEAVE())
    // }

        
    return (
        <li className=" RightControlbar_contents_li" onMouseEnter={()=>onMouseEnter(p_lat,p_lng)}>
            <div className=" RightControlbar_contents_img">
                <img className='RightControlbar_contents_img_i' src={img} referrerpolicy="no-referrer"></img>
            </div>
            <div className=" RightControlbar_contents_p">
                <div className='RightControlbar_contents_p_left'>
                    <p>{nation}</p>
                    <p><span>{spotname}</span></p>
                </div>
                <div className='RightControlbar_contents_p_right'>
                    <div><span onClick={onclick}><FaPlus/></span></div>
                </div>
            </div>
        </li>
    );
};

export default AddSpot;