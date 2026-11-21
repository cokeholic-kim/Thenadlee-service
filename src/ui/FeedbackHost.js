import React, { useEffect, useRef, useState } from 'react';
import { closeDialog, dismissToast, getFeedbackState, subscribeFeedback } from './feedback';
import './Feedback.scss';

const useFeedbackState = () => {
    const [current, setCurrent] = useState(getFeedbackState());
    useEffect(() => subscribeFeedback(setCurrent), []);
    return current;
};

const ToastItem = ({ item }) => (
    <div className={`toast${item.tone === 'error' ? ' is-error' : ''}`} role={item.tone === 'error' ? 'alert' : 'status'}>
        <span className="toast__message">{item.message}</span>
        {item.actionLabel && (
            <button type="button" className="toast__action" onClick={() => { item.onAction?.(); dismissToast(item.id); }}>{item.actionLabel}</button>
        )}
        <button type="button" className="toast__close" aria-label="알림 닫기" onClick={() => dismissToast(item.id)}>×</button>
    </div>
);

// 확인 창: 열리면 확인 버튼에 초점, Esc 는 취소, 바깥을 누르면 취소
const ConfirmDialog = ({ dialog }) => {
    const confirmRef = useRef(null);
    useEffect(() => {
        confirmRef.current?.focus();
        const onKey = (event) => { if (event.key === 'Escape') closeDialog(false); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);
    return (
        <div className="confirm-dialog__backdrop" onClick={(event) => { if (event.target === event.currentTarget) closeDialog(false); }}>
            <div className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-message">
                <h2 id="confirm-dialog-title">{dialog.title || '확인'}</h2>
                <p id="confirm-dialog-message">{dialog.message}</p>
                <div className="confirm-dialog__actions">
                    <button type="button" className="confirm-dialog__button" onClick={() => closeDialog(false)}>{dialog.cancelLabel || '취소'}</button>
                    <button type="button" ref={confirmRef} className={`confirm-dialog__button is-primary${dialog.danger ? ' is-danger' : ''}`}
                        onClick={() => closeDialog(true)}>{dialog.confirmLabel || '확인'}</button>
                </div>
            </div>
        </div>
    );
};

// 앱 전체에 한 번만 둠 (App.js)
const FeedbackHost = () => {
    const { toasts, dialog } = useFeedbackState();
    return (
        <>
            <div className="toast-stack" aria-live="polite">
                {toasts.map((item) => <ToastItem key={item.id} item={item} />)}
            </div>
            {dialog && <ConfirmDialog dialog={dialog} />}
        </>
    );
};

export default FeedbackHost;
