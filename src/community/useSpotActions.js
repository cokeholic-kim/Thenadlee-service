import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { deleteSpot, fetchSpots } from '../api/communityApi';
import { replaceSpots, setLeft } from '../modules/add';
import { getApiErrorMessage } from '../util/apiError';
import { toast, toastError, confirmDialog } from '../ui/feedback';

/**
 * 지도 화면 추천 장소 팝업 상태와 동작 (상세 보기, 등록·수정, 삭제, 신고)
 *   modal: { type: 'detail'|'form'|'report', spot }
 */
const useSpotActions = (cityName) => {
    const dispatch = useDispatch();
    const [modal, setModal] = useState(null);
    const close = () => setModal(null);
    const refresh = () => fetchSpots(cityName).then((list) => dispatch(replaceSpots(list)))
        .catch((error) => toastError(getApiErrorMessage(error)));

    const remove = async (spot) => {
        if (!await confirmDialog(`"${spot.spotName}" 장소를 삭제할까요? 이 장소를 담은 다른 여행자의 일정에서도 빠져요.`)) return;
        try {
            toast((await deleteSpot(spot.id)).message);
            close();
            refresh();
        } catch (error) {
            toastError(getApiErrorMessage(error));
        }
    };
    const open = (type, spot = null) => setModal({ type, spot });
    const add = (spot) => { dispatch(setLeft(spot)); close(); };
    return { modal, open, close, refresh, remove, add };
};

export default useSpotActions;
