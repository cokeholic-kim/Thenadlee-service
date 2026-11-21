import { useState } from 'react';
import html2canvas from 'html2canvas';
import { shareCard } from '../share/kakaoShare';
import { toast } from '../ui/feedback';

// 이미지는 화면 크기와 상관없이 선명하게 (2배)
const IMAGE_SCALE = 2;
const PAPER_COLOR = '#fffdf9';

const renderCanvas = (element) => html2canvas(element, { scale: IMAGE_SCALE, backgroundColor: PAPER_COLOR, useCORS: true });
const toBlob = (canvas) => new Promise((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('blob'))), 'image/png'));

/**
 * 카드 영역(ref)을 PNG 이미지로 저장하거나 공유 { busy, saveImage, share(meta) }
 *   share meta: { title, text, path } — PC 에서 카카오톡 메시지로 보낼 요약 글과 모임 화면 경로
 */
const useCardExport = (cardRef, fileName) => {
    const [busy, setBusy] = useState(false);
    const run = async (task, failMessage) => {
        setBusy(true);
        try {
            await task(await renderCanvas(cardRef.current));
        } catch (error) {
            toast(failMessage);
        } finally {
            setBusy(false);
        }
    };
    const saveImage = () => run((canvas) => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `${fileName}.png`;
        link.click();
    }, '이미지를 만들지 못했어요. 잠시 후 다시 시도해 주세요.');
    const share = (meta) => run(async (canvas) => {
        await shareCard({ ...meta, blob: await toBlob(canvas), fileName: `${fileName}.png` });
    }, '공유하지 못했어요. 이미지로 저장해서 보내 주세요.');
    return { busy, saveImage, share };
};

export default useCardExport;
