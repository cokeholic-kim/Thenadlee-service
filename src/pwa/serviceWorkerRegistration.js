// 운영 빌드에서만 서비스 워커 등록 (개발 서버에서는 화면이 바로 바뀌도록 등록하지 않음)
const SERVICE_WORKER_URL = `${process.env.PUBLIC_URL}/service-worker.js`;
// 앱을 오래 켜 둔 경우에도 새 버전을 알 수 있도록 주기적으로 확인
const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

const watchInstalling = (registration, onUpdate) => {
    const worker = registration.installing;
    if (!worker) return;
    worker.addEventListener('statechange', () => {
        // 이미 이전 버전이 화면을 맡고 있을 때만 "새 버전" 안내 (처음 설치는 안내 없음)
        if (worker.state === 'installed' && navigator.serviceWorker.controller) onUpdate(registration);
    });
};

// 등록 직후에 이미 설치 중이거나 기다리는 새 버전이 있을 수 있어 바로 확인하고, 이후 새 버전도 감시
const register = async (onUpdate) => {
    try {
        const registration = await navigator.serviceWorker.register(SERVICE_WORKER_URL);
        if (registration.waiting && navigator.serviceWorker.controller) onUpdate(registration);
        watchInstalling(registration, onUpdate);
        registration.addEventListener('updatefound', () => watchInstalling(registration, onUpdate));
        setInterval(() => registration.update().catch(() => {}), UPDATE_CHECK_INTERVAL_MS);
    } catch (error) {
        console.warn('서비스 워커를 등록하지 못했어요.', error);
    }
};

/** @param {(registration: ServiceWorkerRegistration) => void} onUpdate 새 버전이 기다리고 있을 때 */
export const registerServiceWorker = (onUpdate) => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    if (document.readyState === 'complete') register(onUpdate);
    else window.addEventListener('load', () => register(onUpdate), { once: true });
};

// 기다리던 새 버전을 적용하고, 적용되면 한 번 새로고침
export const applyUpdate = (registration) => {
    navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), { once: true });
    registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
};
