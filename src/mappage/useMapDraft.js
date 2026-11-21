import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { consumeResumeSave, saveMapDraft } from '../itinerary/mapDraft';

// 담는 장소·기간이 바뀔 때마다 임시 보관 (장소 목록을 다 불러온 뒤부터)
export const useMapDraftSaver = (cityName, search, ready) => {
    const days = useSelector((state) => state.add.days);
    const itinerary = useSelector((state) => state.itinerary);
    useEffect(() => {
        if (ready) saveMapDraft({ cityName, search, days, itinerary });
    }, [ready, cityName, search, days, itinerary]);
};

// 저장하려다 로그인하러 갔다 돌아오면 저장 창을 바로 다시 열어 줌
export const useResumeSave = (ready, onResume) => {
    const isLogin = useSelector((state) => state.logincheck.isLogin);
    useEffect(() => {
        if (ready && isLogin && consumeResumeSave()) onResume();
    }, [ready, isLogin]); // eslint-disable-line react-hooks/exhaustive-deps
};
