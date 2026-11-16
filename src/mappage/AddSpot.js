import { FaInfoCircle } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { setLeft } from "../modules/add";
import { setENTER } from "../modules/hover";
import './AddSpot.scss' ;

// 데이터 카드(li)에 대한 컴포넌트 (여행자 추천 장소는 배지 표시, i 버튼으로 상세 보기)

const AddSpot = ({spot, map, onOpen}) => {
    const { spotName: spotname, lat: p_lat, lon: p_lng, imageUrl: img } = spot;
    const dispatch = useDispatch() ;

    // 현재 선택한 일차에 장소 담기 (담은 장소는 추천 목록에서 빠짐)
    const onclick= ()=>{
        dispatch(setLeft(spot));
    }

    const onMouseEnter = (lat,lng)=>{
        dispatch(setENTER(lat,lng))
        map.panTo({lat,lng})
    }

    return (
        <li className=" RightControlbar_contents_li" onMouseEnter={()=>onMouseEnter(p_lat,p_lng)}>
            <div className=" RightControlbar_contents_img">
                {img && <img className='RightControlbar_contents_img_i' src={img} referrerPolicy="no-referrer" alt=""></img>}
            </div>
            <div className=" RightControlbar_contents_p">
                {spot.source === 'USER' && <span className="spot-card__badge">여행자 추천</span>}
                <div className='RightControlbar_contents_p_left'>
                    <p><span>{spotname}</span></p>
                </div>
                <div className='RightControlbar_contents_p_right'>
                    <button type="button" className="spot-card__info" onClick={()=>onOpen(spot)} aria-label={`${spotname} 자세히 보기`}><FaInfoCircle/></button>
                    <div><span onClick={onclick}><FaPlus/></span></div>
                </div>
            </div>
        </li>
    );
};

export default AddSpot;
