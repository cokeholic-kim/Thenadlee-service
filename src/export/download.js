import { buildXlsx, XLSX_MIME } from './xlsx';

// 브라우저에서 만든 파일 내려받기 (서버로 보내지 않음)
const REVOKE_DELAY_MS = 1000;
const FILE_NAME_FORBIDDEN = /[\\/:*?"<>|]/g;
const FILE_NAME_MAX = 80;

/** 파일 이름에 쓸 수 없는 문자를 빼고 길이 제한 */
export const safeFileName = (name) => ([...String(name || '')].filter((char) => char.charCodeAt(0) >= 32).join('').replace(FILE_NAME_FORBIDDEN, ' ').replace(/\s+/g, ' ').trim().slice(0, FILE_NAME_MAX) || 'thenadlee');

export const downloadBlob = (blob, fileName) => {
    const url = URL.createObjectURL(blob);
    const link = Object.assign(document.createElement('a'), { href: url, download: fileName });
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
};

/** 시트 목록을 엑셀 파일로 내려받기 (이름은 확장자 없이) */
export const downloadXlsx = (sheets, name) => downloadBlob(new Blob([buildXlsx(sheets)], { type: XLSX_MIME }), `${safeFileName(name)}.xlsx`);
