// 압축하지 않는(store) zip 만들기 — 엑셀(.xlsx) 파일 묶음용. 브라우저에서만 만들고 서버로 보내지 않음
//   형식: 파일마다 [로컬 헤더 + 내용], 끝에 [중앙 디렉터리 + 끝 표시]. 파일 이름은 UTF-8(플래그 0x0800)
const SIGNATURES = { local: 0x04034b50, central: 0x02014b50, end: 0x06054b50 };
const VERSION = 20;
const UTF8_FLAG = 0x0800;
// 파일 시각은 1980-01-01 00:00 (zip 날짜 형식의 최소값)
const DOS_TIME = 0;
const DOS_DATE = 0x21;
const LOCAL_SIZE = 30;
const CENTRAL_SIZE = 46;
const END_SIZE = 22;

const CRC_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n += 1) {
        let c = n;
        for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        table[n] = c >>> 0;
    }
    return table;
})();

/** CRC-32 (zip 이 내용 확인에 쓰는 값) */
export const crc32 = (bytes) => {
    let crc = 0xffffffff;
    for (let index = 0; index < bytes.length; index += 1) crc = CRC_TABLE[(crc ^ bytes[index]) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
};

const toBytes = (data) => (typeof data === 'string' ? new TextEncoder().encode(data) : data);

// 로컬 헤더·중앙 디렉터리 공통 부분 (서명 다음: 버전·플래그·방식·시각·날짜·CRC·크기·크기·이름 길이)
const writeCommon = (view, offset, entry) => {
    view.setUint16(offset, UTF8_FLAG, true);
    view.setUint16(offset + 2, 0, true);
    view.setUint16(offset + 4, DOS_TIME, true);
    view.setUint16(offset + 6, DOS_DATE, true);
    view.setUint32(offset + 8, entry.crc, true);
    view.setUint32(offset + 12, entry.data.length, true);
    view.setUint32(offset + 16, entry.data.length, true);
    view.setUint16(offset + 20, entry.name.length, true);
};

const localHeader = (entry) => {
    const bytes = new Uint8Array(LOCAL_SIZE + entry.name.length);
    const view = new DataView(bytes.buffer);
    view.setUint32(0, SIGNATURES.local, true);
    view.setUint16(4, VERSION, true);
    writeCommon(view, 6, entry);
    bytes.set(entry.name, LOCAL_SIZE);
    return bytes;
};

const centralHeader = (entry) => {
    const bytes = new Uint8Array(CENTRAL_SIZE + entry.name.length);
    const view = new DataView(bytes.buffer);
    view.setUint32(0, SIGNATURES.central, true);
    view.setUint16(4, VERSION, true);
    view.setUint16(6, VERSION, true);
    writeCommon(view, 8, entry);
    view.setUint32(42, entry.offset, true);
    bytes.set(entry.name, CENTRAL_SIZE);
    return bytes;
};

const endRecord = (count, centralSize, centralOffset) => {
    const bytes = new Uint8Array(END_SIZE);
    const view = new DataView(bytes.buffer);
    view.setUint32(0, SIGNATURES.end, true);
    view.setUint16(8, count, true);
    view.setUint16(10, count, true);
    view.setUint32(12, centralSize, true);
    view.setUint32(16, centralOffset, true);
    return bytes;
};

const concat = (parts) => {
    const result = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
    parts.reduce((offset, part) => { result.set(part, offset); return offset + part.length; }, 0);
    return result;
};

/** [{ name, data: 문자열 또는 Uint8Array }] → zip 바이트 */
export const buildZip = (files) => {
    let offset = 0;
    const entries = files.map((file) => {
        const data = toBytes(file.data);
        const entry = { name: toBytes(file.name), data, crc: crc32(data), offset };
        offset += LOCAL_SIZE + entry.name.length + data.length;
        return entry;
    });
    const locals = entries.flatMap((entry) => [localHeader(entry), entry.data]);
    const centrals = entries.map(centralHeader);
    const centralSize = centrals.reduce((sum, part) => sum + part.length, 0);
    return concat([...locals, ...centrals, endRecord(entries.length, centralSize, offset)]);
};
