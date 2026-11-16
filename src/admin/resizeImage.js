// 업로드 전에 브라우저에서 긴 변 1600px JPEG 로 줄여 용량을 낮춤
// (공유호스팅 업로드 용량 제한 대비. 서버에서도 한 번 더 줄이고 위치정보를 지움)
const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.85;
const OUTPUT_TYPE = 'image/jpeg';

const loadImage = (file) => new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('이미지를 읽을 수 없습니다.')); };
    image.src = url;
});

export const resizeImage = async (file) => {
    const image = await loadImage(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    const context = canvas.getContext('2d');
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, OUTPUT_TYPE, JPEG_QUALITY));
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: OUTPUT_TYPE });
};
