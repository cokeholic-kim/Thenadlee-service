import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { applyUpdate, registerServiceWorker } from './serviceWorkerRegistration';
import './Pwa.scss';

const DISMISS_KEY = 'pwa-install-dismissed';
const IOS_PATTERN = /iphone|ipad|ipod/i;

// 설치 안내는 React 가 뜨기 전에 올 수 있어 시작할 때부터 받아 둠
let deferredPrompt = null;
const promptListeners = new Set();
window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    promptListeners.forEach((listener) => listener(event));
});

const readDismissed = () => {
    try { return window.localStorage.getItem(DISMISS_KEY) === '1'; } catch { return false; }
};
const saveDismissed = () => {
    try { window.localStorage.setItem(DISMISS_KEY, '1'); } catch { /* 저장 못 해도 이번 화면에서만 닫힘 */ }
};
const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

const useInstallPrompt = () => {
    const [prompt, setPrompt] = useState(deferredPrompt);
    useEffect(() => {
        promptListeners.add(setPrompt);
        const installed = () => setPrompt(null);
        window.addEventListener('appinstalled', installed);
        return () => { promptListeners.delete(setPrompt); window.removeEventListener('appinstalled', installed); };
    }, []);
    return prompt;
};

const useOnline = () => {
    const [online, setOnline] = useState(navigator.onLine);
    useEffect(() => {
        const update = () => setOnline(navigator.onLine);
        window.addEventListener('online', update);
        window.addEventListener('offline', update);
        return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); };
    }, []);
    return online;
};

// 메인 화면에서만: 설치 가능한 브라우저는 설치 버튼, 아이폰 사파리는 홈 화면 추가 방법 안내
const InstallBanner = () => {
    const prompt = useInstallPrompt();
    const [dismissed, setDismissed] = useState(readDismissed);
    const ios = IOS_PATTERN.test(navigator.userAgent);
    if (dismissed || isStandalone() || (!prompt && !ios)) return null;
    const close = () => { saveDismissed(); setDismissed(true); };
    const install = async () => { prompt.prompt(); await prompt.userChoice; deferredPrompt = null; close(); };
    return (
        <div className="pwa-banner" role="dialog" aria-label="앱 설치 안내">
            <p>{prompt ? '더 나들이를 앱으로 설치하면 홈 화면에서 바로 열 수 있어요.' : '사파리 아래쪽 공유 버튼 → "홈 화면에 추가"로 앱처럼 쓸 수 있어요.'}</p>
            {prompt && <button type="button" className="pwa-banner__primary" onClick={install}>설치</button>}
            <button type="button" onClick={close}>닫기</button>
        </div>
    );
};

/** PWA 안내: 새 버전 알림, 오프라인 표시, (메인 화면) 앱 설치 */
const PwaNotices = () => {
    const { pathname } = useLocation();
    const online = useOnline();
    const [waiting, setWaiting] = useState(null);
    useEffect(() => { registerServiceWorker(setWaiting); }, []);
    return (
        <>
            {!online && <div className="pwa-offline" role="status">오프라인 상태예요. 저장된 화면만 볼 수 있고, 일정·모임 정보는 연결되면 다시 불러와요.</div>}
            {waiting && (
                <div className="pwa-banner" role="status">
                    <p>새 버전이 준비됐어요.</p>
                    <button type="button" className="pwa-banner__primary" onClick={() => applyUpdate(waiting)}>새로고침</button>
                </div>
            )}
            {!waiting && pathname === '/' && <InstallBanner />}
        </>
    );
};

export default PwaNotices;
