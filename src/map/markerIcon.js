// 장소 종류 색 + 방문 순서 번호가 들어간 핀 (카카오·구글 공통 SVG)
export const PIN_WIDTH = 28;
export const PIN_HEIGHT = 38;

const pinSvg = (color, text) => `<svg xmlns="http://www.w3.org/2000/svg" width="${PIN_WIDTH}" height="${PIN_HEIGHT}" viewBox="0 0 28 38">`
    + `<path d="M14 37C14 37 26 22.5 26 13.5A12 12 0 0 0 2 13.5C2 22.5 14 37 14 37Z" fill="${color}" stroke="#ffffff" stroke-width="2"/>`
    + `<text x="14" y="18" text-anchor="middle" font-family="Arial, sans-serif" font-size="${String(text).length > 1 ? 11 : 13}" font-weight="700" fill="#ffffff">${text}</text>`
    + '</svg>';

/** 핀 그림 주소 (color: 종류 색, text: 순서 번호) */
export const pinIconUrl = (color, text = '') => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(pinSvg(color, text))}`;
