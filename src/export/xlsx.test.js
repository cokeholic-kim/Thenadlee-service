import { TextDecoder, TextEncoder } from 'util';
import { crc32, buildZip } from './zipStore';
import { buildXlsx, columnName, sheetNames } from './xlsx';
import { safeFileName } from './download';

global.TextEncoder = global.TextEncoder || TextEncoder;

// 압축 없는 zip 에서 파일 이름 → 내용 꺼내기 (테스트용)
const readZip = (bytes) => {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const files = {};
    let offset = 0;
    while (view.getUint32(offset, true) === 0x04034b50) {
        const size = view.getUint32(offset + 18, true);
        const nameLength = view.getUint16(offset + 26, true);
        const name = new TextDecoder().decode(bytes.slice(offset + 30, offset + 30 + nameLength));
        const start = offset + 30 + nameLength;
        files[name] = { text: new TextDecoder().decode(bytes.slice(start, start + size)), crc: view.getUint32(offset + 14, true), data: bytes.slice(start, start + size) };
        offset = start + size;
    }
    return files;
};

test('CRC-32 표준 값', () => {
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926);
});

test('zip: 파일 내용·CRC 가 맞고 끝 표시가 있음', () => {
    const bytes = buildZip([{ name: 'a.txt', data: '가나다' }, { name: 'b/c.xml', data: '<x/>' }]);
    const files = readZip(bytes);
    expect(files['a.txt'].text).toBe('가나다');
    expect(files['a.txt'].crc).toBe(crc32(files['a.txt'].data));
    const view = new DataView(bytes.buffer);
    expect(view.getUint32(bytes.length - 22, true)).toBe(0x06054b50);
    expect(view.getUint16(bytes.length - 22 + 10, true)).toBe(2);
});

test('xlsx: 필요한 부품과 올바른 XML, 숫자·글자 칸, 특수 문자 이스케이프', () => {
    const files = readZip(buildXlsx([{ name: '정산', rows: [['이름', '금액'], ['A&B <민수>', 1234.5], ['', null]], boldRows: [0], widths: [10, 12] }, { name: '정산', rows: [['x']] }]));
    expect(Object.keys(files)).toEqual(expect.arrayContaining(['[Content_Types].xml', '_rels/.rels', 'xl/workbook.xml', 'xl/styles.xml', 'xl/worksheets/sheet1.xml', 'xl/worksheets/sheet2.xml']));
    Object.values(files).forEach((file) => {
        const doc = new DOMParser().parseFromString(file.text, 'application/xml');
        expect(doc.getElementsByTagName('parsererror').length).toBe(0);
    });
    const sheet = files['xl/worksheets/sheet1.xml'].text;
    expect(sheet).toContain('<c r="B2"><v>1234.5</v></c>');
    expect(sheet).toContain('A&amp;B &lt;민수&gt;');
    expect(sheet).toContain('<c r="A1" s="1" t="inlineStr">');
    expect(sheet).not.toContain('r="A3"');
    expect(files['xl/workbook.xml'].text).toContain('name="정산_2"');
});

test('열 이름·시트 이름·파일 이름 규칙', () => {
    expect([0, 25, 26, 51, 701, 702].map(columnName)).toEqual(['A', 'Z', 'AA', 'AZ', 'ZZ', 'AAA']);
    expect(sheetNames(['a/b', '', 'x'.repeat(40)])).toEqual(['a b', '시트2', 'x'.repeat(31)]);
    expect(safeFileName('제주: 3일 / "여행"?')).toBe('제주 3일 여행');
});
