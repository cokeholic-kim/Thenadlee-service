import { FaInfoCircle, FaMapMarkerAlt, FaPlus } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { setLeft } from "../modules/add";
import { categoryLabel } from '../community/spotCategories';
import { iconTags } from '../community/spotTags';
import SpotThumbPlaceholder from '../community/SpotThumbPlaceholder';
import { toast } from '../ui/feedback';
import { trackEvent } from '../analytics/analytics';
import { MAP_PANELS, requestMapPanel } from './mapPanelEvents';
import './AddSpot.scss' ;

// 데이터 카드(li)에 대한 컴포넌트 (여행자 추천·장소 종류 배지, 지도에서 보기, i 버튼으로 상세 보기)

// 상황 태그는 좁은 카드에 맞게 아이콘만 (이름은 툴팁·읽기 도구용)
const TagIcons = ({ tags }) => {
    const list = iconTags(tags);
    if (list.length === 0) return null;
    const names = list.map((tag) => tag.name).join(', ');
    return <span className="spot-card__tags" title={names} aria-label={`상황: ${names}`}>{list.map((tag) => tag.icon).join('')}</span>;
};

const SpotBadge = ({ spot }) => {
    const text = [spot.source === 'USER' && '여행자 추천', categoryLabel(spot.category)].filter(Boolean).join(' · ');
    if (!text && iconTags(spot.tags).length === 0) return null;
    return <span className={`spot-card__badge${spot.source === 'USER' ? '' : ' is-category'}`}>{text}<TagIcons tags={spot.tags} /></span>;
};

const LocateButton = ({ spot, active, onLocate }) => (
    <button type="button" className={`spot-card__locate${active ? ' is-active' : ''}`} onClick={() => onLocate(spot)}
        aria-pressed={active} aria-label={`${spot.spotName} 지도에서 보기`} title={active ? '지도 표시 끄기' : '지도에서 보기'}><FaMapMarkerAlt/></button>
);

// 휴대폰은 담은 목록이 다른 탭에 있으므로 담았다는 알림과 "내 일정 보기"를 띄움
const MOBILE_QUERY = '(max-width: 600px)';

const useAddSpot = (spot) => {
    const dispatch = useDispatch();
    const activeDay = useSelector((state) => state.add.activeDay);
    return () => {
        dispatch(setLeft(spot));
        trackEvent('add_spot', { category: spot.category || 'NONE' });
        if (window.matchMedia(MOBILE_QUERY).matches) {
            toast(`${activeDay + 1}일차에 "${spot.spotName}"을(를) 담았어요.`, { actionLabel: '내 일정 보기', onAction: () => requestMapPanel(MAP_PANELS.PLAN) });
        }
    };
};

const AddSpot = ({spot, onOpen, onLocate, isLocated}) => {
    const { spotName: spotname, imageUrl: img } = spot;
    // 현재 선택한 일차에 장소 담기 (담은 장소는 추천 목록에서 빠짐)
    const onclick = useAddSpot(spot);

    return (
        <li className={` RightControlbar_contents_li${isLocated ? ' is-located' : ''}`}>
            <div className=" RightControlbar_contents_img">
                {img ? <img className='RightControlbar_contents_img_i' src={img} referrerPolicy="no-referrer" alt=""></img>
                    : <SpotThumbPlaceholder category={spot.category} className='RightControlbar_contents_img_i'/>}
            </div>
            <div className=" RightControlbar_contents_p">
                <SpotBadge spot={spot} />
                <div className='RightControlbar_contents_p_left'>
                    <p><span>{spotname}</span></p>
                </div>
                <div className='RightControlbar_contents_p_right'>
                    <LocateButton spot={spot} active={isLocated} onLocate={onLocate} />
                    <button type="button" className="spot-card__info" onClick={()=>onOpen(spot)} aria-label={`${spotname} 자세히 보기`}><FaInfoCircle/></button>
                    <div><button type="button" className="spot-card__add" onClick={onclick} aria-label={`${spotname} 일정에 담기`} title="일정에 담기"><span><FaPlus/></span></button></div>
                </div>
            </div>
        </li>
    );
};

export default AddSpot;
