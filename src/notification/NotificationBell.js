import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { FiBell } from 'react-icons/fi';
import { fetchNotifications, fetchNotificationSummary, readAllNotifications } from '../api/notificationApi';
import { describeNotification, formatRelativeTime } from './notificationText';
import useAutoRefresh from './useAutoRefresh';
import useGroupNews from './useGroupNews';
import './NotificationBell.scss';

const MAX_BADGE = 99;

// 읽지 않은 알림 수: 화면을 옮길 때·창으로 돌아올 때 다시 셈 (실패하면 그대로, 화면 표시용이라 오류 안내 없음)
const useUnreadCount = (isLogin) => {
    const [count, setCount] = useState(0);
    const refresh = useCallback(() => {
        fetchNotificationSummary().then((summary) => setCount(summary.unreadCount)).catch(() => {});
    }, []);
    const reset = useCallback(() => setCount(0), []);
    useAutoRefresh(isLogin, refresh, reset);
    return [count, setCount];
};

// 바깥을 누르거나 Esc·화면 이동이면 닫힘
const useDismiss = (open, setOpen, rootRef) => {
    const { pathname } = useLocation();
    useEffect(() => setOpen(false), [pathname, setOpen]);
    useEffect(() => {
        if (!open) return undefined;
        const onPointer = (event) => { if (!rootRef.current?.contains(event.target)) setOpen(false); };
        const onKey = (event) => { if (event.key === 'Escape') setOpen(false); };
        document.addEventListener('pointerdown', onPointer);
        window.addEventListener('keydown', onKey);
        return () => { document.removeEventListener('pointerdown', onPointer); window.removeEventListener('keydown', onKey); };
    }, [open, setOpen, rootRef]);
};

const NotificationItem = ({ item }) => {
    const view = describeNotification(item);
    if (!view) return null;
    return (
        <li className={item.isRead ? '' : 'is-new'}>
            <Link to={view.path}>
                <span className="notification-item__icon" aria-hidden="true">{view.icon}</span>
                <span className="notification-item__text">{view.text}<em>{formatRelativeTime(item)}</em></span>
            </Link>
        </li>
    );
};

// 모임 새 소식은 알림 목록 위에 모임별로 (종을 열어도 읽음 처리하지 않고, 모임 탭을 보면 사라짐)
const GroupNewsList = ({ groups }) => (groups.length === 0 ? null : (
    <ul className="notification-list notification-list--groups" aria-label="모임 새 소식">
        {groups.map((group) => (
            <li key={group.id} className="is-new">
                <Link to={`/groups/${group.id}`}>
                    <span className="notification-item__icon" aria-hidden="true">🧳</span>
                    <span className="notification-item__text"><b>{group.name}</b> 모임에 새 소식 {group.unreadCount}개<em>모임에서 확인하면 사라져요</em></span>
                </Link>
            </li>
        ))}
    </ul>
));

const NotificationPanel = ({ items, groups }) => (
    <div className="notification-panel" role="dialog" aria-label="알림">
        <strong className="notification-panel__title">알림</strong>
        <GroupNewsList groups={groups} />
        {items === null && <p className="notification-panel__message">불러오는 중…</p>}
        {items?.length === 0 && groups.length === 0 && <p className="notification-panel__message">아직 알림이 없어요.<br />내 일정을 공개하면 댓글·좋아요 소식을 알려 드려요.</p>}
        {items?.length > 0 && <ul className="notification-list">{items.map((item) => <NotificationItem key={item.id} item={item} />)}</ul>}
    </div>
);

// 종을 열면 최근 알림을 불러오고 모두 읽음으로 (방금 읽은 것은 이번 목록에서만 "새 알림"으로 표시)
const useNotificationList = (setCount) => {
    const [items, setItems] = useState(null);
    const load = useCallback(async () => {
        setItems(null);
        try {
            const result = await fetchNotifications();
            setItems(result.items);
            if (result.unreadCount > 0) await readAllNotifications();
            setCount(0);
        } catch {
            setItems([]);
        }
    }, [setCount]);
    return [items, load];
};

// 헤더 알림 종 (로그인했을 때만)
const NotificationBell = () => {
    const isLogin = useSelector((state) => state.logincheck.isLogin);
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);
    const [unread, setCount] = useUnreadCount(isLogin);
    const groups = useGroupNews(isLogin);
    const [items, load] = useNotificationList(setCount);
    const count = unread + groups.reduce((sum, group) => sum + group.unreadCount, 0);
    useDismiss(open, setOpen, rootRef);
    if (!isLogin) return null;
    const toggle = () => { if (!open) load(); setOpen(!open); };
    return (
        <div className="notification-bell" ref={rootRef}>
            <button type="button" className="notification-bell__button" aria-expanded={open} onClick={toggle}
                aria-label={count > 0 ? `알림 (새 소식 ${count}개)` : '알림'}>
                <FiBell aria-hidden="true" />
                {count > 0 && <span className="notification-bell__count">{count > MAX_BADGE ? `${MAX_BADGE}+` : count}</span>}
            </button>
            {open && <NotificationPanel items={items} groups={groups} />}
        </div>
    );
};

export default NotificationBell;
