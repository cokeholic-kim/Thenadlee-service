import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchItinerary } from '../api/itineraryApi';
import { loadDays, setDayCount } from '../modules/add';
import { resetItinerary, setItineraryInfo } from '../modules/itinerary';
import { getApiErrorMessage } from '../util/apiError';

const toItineraryInfo = (detail) => ({
    id: detail.id,
    title: detail.title,
    description: detail.description || '',
    visibility: detail.visibility,
    isOwner: detail.isOwner,
    authorNickName: detail.authorNickName,
    startDate: detail.startDate,
    endDate: detail.endDate,
    travelMode: detail.travelMode,
});

/**
 * 주소의 ?itinerary=ID 로 저장된 일정을 지도에 불러옴 (없으면 새 일정으로 초기화)
 * 장소 목록(setRedo)이 먼저 채워진 뒤 실행되도록 spotsReady 이후에 동작
 */
const useItineraryLoader = (itineraryId, spotsReady) => {
    const dispatch = useDispatch();
    useEffect(() => {
        if (!spotsReady) return undefined;
        dispatch(resetItinerary());
        dispatch(setDayCount(1));
        if (!itineraryId) return undefined;
        let cancelled = false;
        fetchItinerary(itineraryId)
            .then((detail) => {
                if (cancelled) return;
                dispatch(setItineraryInfo(toItineraryInfo(detail)));
                dispatch(loadDays(detail.days.map((day) => day.items)));
            })
            .catch((error) => alert(getApiErrorMessage(error)));
        return () => { cancelled = true; };
    }, [itineraryId, spotsReady, dispatch]);
};

export default useItineraryLoader;
