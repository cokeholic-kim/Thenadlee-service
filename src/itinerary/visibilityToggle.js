import { changeItineraryVisibility } from '../api/itineraryApi';
import { getApiErrorMessage } from '../util/apiError';
import { confirmDialog, toast, toastError } from '../ui/feedback';

const PUBLISH_MESSAGE = '공개하면 누구나 이 일정 페이지와 지도 화면의 "추천 일정"에서 볼 수 있고, 좋아요와 댓글을 받을 수 있어요. 닉네임이 함께 보여요.';
const HIDE_MESSAGE = '비공개로 바꾸면 나만 볼 수 있고, 받은 댓글도 다른 사람에게 보이지 않아요.';

/**
 * 내 일정 공개·비공개 전환 (확인 창 → 저장 → 알림). 바뀐 공개 범위를 돌려주고, 취소·실패면 null
 *   onOpenPage: 공개한 뒤 알림의 "공개 페이지 보기"를 눌렀을 때 (없으면 버튼 없음)
 */
export const toggleItineraryVisibility = async (item, onOpenPage) => {
    const publishing = item.visibility !== 'PUBLIC';
    const ok = await confirmDialog(publishing ? PUBLISH_MESSAGE : HIDE_MESSAGE, {
        title: publishing ? '일정 공개하기' : '비공개로 바꾸기', confirmLabel: publishing ? '공개하기' : '비공개로', danger: false,
    });
    if (!ok) return null;
    try {
        const { visibility } = await changeItineraryVisibility(item.id, publishing ? 'PUBLIC' : 'PRIVATE');
        toast(publishing ? '일정을 공개했어요.' : '일정을 비공개로 바꿨어요.', publishing && onOpenPage ? { actionLabel: '공개 페이지 보기', onAction: onOpenPage } : {});
        return visibility;
    } catch (error) {
        toastError(getApiErrorMessage(error));
        return null;
    }
};
