import { FaInfoCircle, FaMapMarkerAlt, FaPlus } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { setLeft } from "../modules/add";
import { categoryLabel } from '../community/spotCategories';
import './AddSpot.scss' ;

// 데이터 카드(li)에 대한 컴포넌트 (여행자 추천·장소 종류 배지, 지도에서 보기, i 버튼으로 상세 보기)

const SpotBadge = ({ spot }) => {
    const text = [spot.source === 'USER' && '여행자 추천', categoryLabel(spot.category)].filter(Boolean).join(' · ');
    if (!text) return null;
    return <span className={`spot-card__badge${spot.source === 'USER' ? '' : ' is-category'}`}>{text}</span>;
};

const LocateButton = ({ spot, active, onLocate }) => (
    <button type="button" className={`spot-card__locate${active ? ' is-active' : ''}`} onClick={() => onLocate(spot)}
        aria-pressed={active} aria-label={`${spot.spotName} 지도에서 보기`} title={active ? '지도 표시 끄기' : '지도에서 보기'}><FaMapMarkerAlt/></button>
);

const AddSpot = ({spot, onOpen, onLocate, isLocated}) => {
    const { spotName: spotname, imageUrl: img } = spot;
    const dispatch = useDispatch() ;

    // 현재 선택한 일차에 장소 담기 (담은 장소는 추천 목록에서 빠짐)
    const onclick= ()=>{
        dispatch(setLeft(spot));
    }

    return (
        <li className={` RightControlbar_contents_li${isLocated ? ' is-located' : ''}`}>
            <div className=" RightControlbar_contents_img">
                {img && <img className='RightControlbar_contents_img_i' src={img} referrerPolicy="no-referrer" alt=""></img>}
            </div>
            <div className=" RightControlbar_contents_p">
                <SpotBadge spot={spot} />
                <div className='RightControlbar_contents_p_left'>
                    <p><span>{spotname}</span></p>
                </div>
                <div className='RightControlbar_contents_p_right'>
                    <LocateButton spot={spot} active={isLocated} onLocate={onLocate} />
                    <button type="button" className="spot-card__info" onClick={()=>onOpen(spot)} aria-label={`${spotname} 자세히 보기`}><FaInfoCircle/></button>
                    <div><span onClick={onclick}><FaPlus/></span></div>
                </div>
            </div>
        </li>
    );
};

export default AddSpot;
