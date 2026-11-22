// 모임 탭을 확인했다고 서버에 기록한 뒤 헤더 알림 종의 모임 새 소식을 바로 다시 셈
const GROUP_SEEN_EVENT = 'thenadlee:group-seen';

export const notifyGroupSeen = () => window.dispatchEvent(new Event(GROUP_SEEN_EVENT));

export const onGroupSeen = (listener) => {
    window.addEventListener(GROUP_SEEN_EVENT, listener);
    return () => window.removeEventListener(GROUP_SEEN_EVENT, listener);
};
