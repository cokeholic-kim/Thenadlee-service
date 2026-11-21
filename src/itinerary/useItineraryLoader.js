import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchItinerary } from '../api/itineraryApi';
import { loadDays, setDayCount } from '../modules/add';
import { resetItinerary, setItineraryInfo } from '../modules/itinerary';
import { getApiErrorMessage } from '../util/apiError';
import { toast, toastError } from '../ui/feedback';
import { clearMapDraft } from './mapDraft';

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

// 새 일정으로 초기화 (기간·이동수단 기본값, 1일차만)
const startFresh = (dispatch) => {
    dispatch(resetItinerary());
    dispatch(setDayCount(1));
};

// 담아 두었던 일정 되살리기: 그사이 삭제·숨김된 장소는 빼고, "새로 시작"으로 버릴 수 있게 알림
const restoreDraft = (dispatch, draft, spotIds) => {
    dispatch(setItineraryInfo(draft.itinerary));
    dispatch(loadDays(draft.days.map((spots) => spots.filter((spot) => spotIds.has(spot.id)))));
    toast('담아 두었던 장소를 다시 불러왔어요.', {
        actionLabel: '새로 시작',
        onAction: () => { clearMapDraft(); startFresh(dispatch); dispatch(loadDays([[]])); },
    });
};

const loadSaved = (dispatch, itineraryId, isCancelled) => fetchItinerary(itineraryId)
    .then((detail) => {
        if (isCancelled()) return;
        dispatch(setItineraryInfo(toItineraryInfo(detail)));
        dispatch(loadDays(detail.days.map((day) => day.items)));
    })
    .catch((error) => toastError(getApiErrorMessage(error)));

/**
 * 지도 화면을 열 때 일정 준비: 같은 화면에서 담던 일정이 있으면 되살리고, 없으면 ?itinerary=ID 로 저장된 일정을 불러옴 (둘 다 없으면 새 일정)
 * 장소 목록(setRedo)이 먼저 채워진 뒤 실행되도록 spotsReady 이후에 동작
 *   draft: 화면을 그릴 때 미리 읽어 둔 임시 일정 (효과 실행 중에 임시 보관이 덮어써도 영향 없게), spotIds: 지금 도시의 장소 ID
 */
const useItineraryLoader = (itineraryId, spotsReady, draft = null, spotIds = new Set()) => {
    const dispatch = useDispatch();
    useEffect(() => {
        if (!spotsReady) return undefined;
        startFresh(dispatch);
        if (draft && (!itineraryId || String(draft.itinerary?.id) === String(itineraryId))) {
            restoreDraft(dispatch, draft, spotIds);
            return undefined;
        }
        if (!itineraryId) return undefined;
        let cancelled = false;
        loadSaved(dispatch, itineraryId, () => cancelled);
        return () => { cancelled = true; };
    }, [itineraryId, spotsReady, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps
};

export default useItineraryLoader;
