import React from 'react';
import { isKakaoShareAvailable, shareItinerary } from '../share/kakaoShare';
import { toast, toastError } from '../ui/feedback';
import { trackEvent } from '../analytics/analytics';

const copyLink = async (url) => {
    try {
        await navigator.clipboard.writeText(url);
        trackEvent('share', { method: 'copy_link' });
        toast('링크를 복사했어요.');
    } catch (error) {
        toastError('링크를 복사하지 못했어요. 주소창의 주소를 복사해 주세요.');
    }
};

// 공개 일정만 공유 버튼 표시 (비공개 일정은 다른 사람이 열 수 없음)
const ItineraryShare = ({ itinerary, title, description }) => {
    if (itinerary.visibility !== 'PUBLIC') return null;
    const path = `/itinerary/${itinerary.id}`;
    const imageUrl = itinerary.days.flatMap((day) => day.items).find((item) => item.imageUrl)?.imageUrl;
    const onKakao = () => shareItinerary({ title, description, path, imageUrl }).catch((error) => toastError(error.message));
    return (
        <div className="itinerary-share">
            {isKakaoShareAvailable() && <button type="button" className="itinerary-share__kakao" onClick={onKakao}>카카오톡 공유</button>}
            <button type="button" onClick={() => copyLink(`${window.location.origin}${path}`)}>링크 복사</button>
        </div>
    );
};

export default ItineraryShare;
