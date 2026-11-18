import { useState } from 'react';
import html2canvas from 'html2canvas';

// 이미지는 화면 크기와 상관없이 선명하게 (2배)
const IMAGE_SCALE = 2;
const PAPER_COLOR = '#fffdf9';

/** 카드 영역(ref)을 PNG 이미지로 저장 { busy, saveImage } */
const useCardExport = (cardRef, fileName) => {
    const [busy, setBusy] = useState(false);
    const saveImage = async () => {
        setBusy(true);
        try {
            const canvas = await html2canvas(cardRef.current, { scale: IMAGE_SCALE, backgroundColor: PAPER_COLOR, useCORS: true });
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `${fileName}.png`;
            link.click();
        } catch (error) {
            alert('이미지를 만들지 못했어요. 잠시 후 다시 시도해 주세요.');
        } finally {
            setBusy(false);
        }
    };
    return { busy, saveImage };
};

export default useCardExport;
