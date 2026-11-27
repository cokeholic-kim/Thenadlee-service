import { buildZip } from './zipStore';

// 엑셀(.xlsx) 파일 만들기 — 라이브러리 없이 최소 구성(통합 문서·시트·굵은 글씨 스타일)만, 브라우저에서만 만듦
//   sheets: [{ name, rows: [[값...]], widths?: [열 너비], boldRows?: [굵게 할 행 번호(0부터)] }]
//   값: 숫자는 숫자 칸(엑셀에서 합계 가능), 그 밖은 글자 칸, null·'' 은 빈 칸
export const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const SHEET_NAME_MAX = 31;
const SHEET_NAME_FORBIDDEN = /[\\/?*[\]:]/g;
const BOLD_STYLE = 1;

// 엑셀이 받지 않는 제어 문자는 지움 (탭·줄바꿈은 둠)
const KEPT_CONTROLS = [9, 10, 13];
const stripControls = (text) => [...text].filter((char) => char.charCodeAt(0) >= 32 || KEPT_CONTROLS.includes(char.charCodeAt(0))).join('');

const escapeXml = (value) => stripControls(String(value)).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** 0 → A, 25 → Z, 26 → AA */
export const columnName = (index) => {
    let name = '';
    for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) name = String.fromCharCode(65 + ((n - 1) % 26)) + name;
    return name;
};

const cellXml = (value, ref, bold) => {
    if (value === null || value === undefined || value === '') return '';
    const style = bold ? ` s="${BOLD_STYLE}"` : '';
    if (typeof value === 'number' && Number.isFinite(value)) return `<c r="${ref}"${style}><v>${value}</v></c>`;
    return `<c r="${ref}"${style} t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
};

const rowXml = (cells, rowIndex, bold) => `<row r="${rowIndex + 1}">${cells.map((value, col) => cellXml(value, `${columnName(col)}${rowIndex + 1}`, bold)).join('')}</row>`;

const colsXml = (widths = []) => (widths.length === 0 ? '' : `<cols>${widths.map((width, index) => `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`).join('')}</cols>`);

const sheetXml = (sheet) => {
    const bold = new Set(sheet.boldRows || []);
    const rows = sheet.rows.map((cells, index) => rowXml(cells, index, bold.has(index))).join('');
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        + `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${colsXml(sheet.widths)}<sheetData>${rows}</sheetData></worksheet>`;
};

/** 시트 이름 규칙(31자, 금지 문자, 중복 없음)에 맞게 */
export const sheetNames = (names) => names.reduce((result, name, index) => {
    const base = (String(name || `시트${index + 1}`).replace(SHEET_NAME_FORBIDDEN, ' ').trim() || `시트${index + 1}`).slice(0, SHEET_NAME_MAX);
    let unique = base;
    for (let n = 2; result.includes(unique); n += 1) unique = `${base.slice(0, SHEET_NAME_MAX - String(n).length - 1)}_${n}`;
    return [...result, unique];
}, []);

const workbookXml = (names) => '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    + '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'
    + names.map((name, index) => `<sheet name="${escapeXml(name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`).join('') + '</sheets></workbook>';

const workbookRelsXml = (count) => '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    + Array.from({ length: count }, (_, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`).join('')
    + `<Relationship Id="rId${count + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;

const contentTypesXml = (count) => '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
    + '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>'
    + '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
    + Array.from({ length: count }, (_, index) => `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')
    + '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>';

const ROOT_RELS = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    + '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>';

// 스타일 0: 기본, 1: 굵게 (제목·머리글 행)
const STYLES = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
    + '<fonts count="2"><font><sz val="11"/><name val="맑은 고딕"/></font><font><b/><sz val="11"/><name val="맑은 고딕"/></font></fonts>'
    + '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>'
    + '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
    + '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
    + '<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs>'
    + '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>'
    + '</styleSheet>';

/** 시트 목록 → .xlsx 파일 바이트 */
export const buildXlsx = (sheets) => {
    const names = sheetNames(sheets.map((sheet) => sheet.name));
    return buildZip([
        { name: '[Content_Types].xml', data: contentTypesXml(sheets.length) },
        { name: '_rels/.rels', data: ROOT_RELS },
        { name: 'xl/workbook.xml', data: workbookXml(names) },
        { name: 'xl/_rels/workbook.xml.rels', data: workbookRelsXml(sheets.length) },
        { name: 'xl/styles.xml', data: STYLES },
        ...sheets.map((sheet, index) => ({ name: `xl/worksheets/sheet${index + 1}.xml`, data: sheetXml(sheet) })),
    ]);
};
