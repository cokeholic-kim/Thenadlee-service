// 화면 알림(토스트)·확인 창 공통 저장소: 브라우저 기본 alert·confirm 대신 사용
// 어느 파일에서든 toast()·confirmDialog() 를 부르면 FeedbackHost 가 그려 줌

const DEFAULT_DURATION_MS = 3500;
const ACTION_DURATION_MS = 6000;

let state = { toasts: [], dialog: null };
let nextId = 1;
const listeners = new Set();

const emit = (next) => {
    state = next;
    listeners.forEach((listener) => listener(state));
};

export const subscribeFeedback = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

export const getFeedbackState = () => state;

export const dismissToast = (id) => emit({ ...state, toasts: state.toasts.filter((item) => item.id !== id) });

/**
 * 짧은 알림. options: { actionLabel, onAction (예: 되돌리기), duration, tone: 'info'|'error' }
 */
export const toast = (message, options = {}) => {
    const id = nextId++;
    const duration = options.duration ?? (options.actionLabel ? ACTION_DURATION_MS : DEFAULT_DURATION_MS);
    emit({ ...state, toasts: [...state.toasts, { id, message: String(message ?? ''), ...options }] });
    setTimeout(() => dismissToast(id), duration);
    return id;
};

export const toastError = (message) => toast(message, { tone: 'error' });

/**
 * 확인 창. 누른 결과를 Promise<boolean> 으로 돌려줌
 *   options: { title, confirmLabel, cancelLabel, danger }
 */
// 지우기·내보내기처럼 되돌리기 어려운 동작은 따로 정하지 않아도 빨간 확인 버튼
const DANGER_WORDS = /삭제|지울|지워|내보낼|나갈|되돌릴 수 없/;

export const confirmDialog = (message, options = {}) => new Promise((resolve) => {
    const danger = options.danger ?? DANGER_WORDS.test(String(message));
    emit({ ...state, dialog: { message, ...options, danger, resolve } });
});

export const closeDialog = (result) => {
    state.dialog?.resolve(result);
    emit({ ...state, dialog: null });
};
