import { TextEncoder } from 'util';
import { buildXlsx } from './xlsx';
import { settleSheets } from '../settle/settleWorkbook';
import { balances, transfers, SPLIT } from '../settle/settleCalc';
import { groupSettlementSheets } from '../group/groupSettlementWorkbook';
import { buildSchedule, scheduleSheets } from '../itinerary/scheduleExport';

global.TextEncoder = global.TextEncoder || TextEncoder;

// 엑셀 검증용 표본 파일을 남기고 싶을 때만 (XLSX_SAMPLE_DIR 환경변수)
const writeSample = (name, sheets) => {
    const dir = process.env.XLSX_SAMPLE_DIR;
    if (!dir) return;
    // eslint-disable-next-line global-require
    require('fs').writeFileSync(`${dir}/${name}.xlsx`, Buffer.from(buildXlsx(sheets)));
};

const people = [{ id: 1, name: '민수' }, { id: 2, name: '지영' }, { id: 3, name: '하늘' }];
const expenses = [
    { id: 4, title: '숙소', currency: 'KRW', originalAmount: 90000, rate: 1, amount: 90000, payerId: 1, participantIds: [1, 2, 3], split: SPLIT.EQUAL, custom: {} },
    { id: 5, title: '호커센터 저녁', currency: 'SGD', originalAmount: 45.6, rate: 1031.5, amount: 47036, payerId: 2, participantIds: [1, 2, 3], split: SPLIT.EQUAL, custom: {} },
];

test('정산 계산기 엑셀: 정산·보낼 돈·지출 시트와 숫자 금액', () => {
    const rows = balances(people, expenses);
    const sheets = settleSheets({ people, expenses, rows, list: transfers(rows), total: 137036 });
    expect(sheets.map((s) => s.name)).toEqual(['정산', '보낼 돈', '지출']);
    expect(sheets[0].rows[1]).toEqual(['민수', 90000, 45678, 44322, '받기']);
    expect(sheets[1].rows[1]).toEqual(['하늘', '민수', 44322]);
    expect(sheets[2].rows[2].slice(0, 5)).toEqual(['호커센터 저녁', 'SGD', 45.6, 1031.5, 47036]);
    writeSample('settle', sheets);
});

test('모임 정산 엑셀: 서버 정산 결과를 그대로 옮김', () => {
    const overview = {
        totalKrw: 30000,
        members: [{ memberId: 1, name: '민수', paid: 30000, owed: 15000, sent: 0, received: 0, balance: 15000 }, { memberId: 2, name: '지영', paid: 0, owed: 15000, sent: 0, received: 0, balance: -15000 }],
        transfers: [{ fromName: '지영', toName: '민수', amountKrw: 15000 }],
        expenses: [{ spentOn: '2026-12-24', category: 'FOOD', title: '저녁', currency: 'KRW', amount: 30000, exchangeRate: 1, amountKrw: 30000, payerName: '민수', splitType: 'EQUAL', shares: [{ name: '민수', shareKrw: 15000 }, { name: '지영', shareKrw: 15000 }], memo: '' }],
        settlements: [],
    };
    const sheets = groupSettlementSheets(overview);
    expect(sheets.map((s) => s.name)).toEqual(['정산', '보낼 돈', '지출', '송금 완료']);
    expect(sheets[0].rows[2]).toEqual(['지영', 0, 15000, 0, 0, -15000]);
    expect(sheets[2].rows[1][9]).toBe('민수 15,000 / 지영 15,000');
    writeSample('group', sheets);
});

test('일정표 엑셀: 일차·날짜·시각·장소, 분은 숫자', () => {
    const itinerary = {
        title: '부산 1박 2일', cityName: 'Busan', dayCount: 2, travelMode: 'TRANSIT', startDate: '2026-12-24', endDate: '2026-12-25',
        days: [{ dayNo: 1, items: [{ spotId: 1, spotName: '해운대', category: 'NATURE', memo: '일몰' }, { spotId: 2, spotName: '광안리', category: 'VIEW' }] }, { dayNo: 2, items: [] }],
    };
    const clock = (text) => ({ text, nextDay: false });
    const timetables = [{ rows: [{ arrive: clock('10:00'), leave: clock('11:00'), stay: 60, travel: null }, { arrive: clock('11:25'), leave: clock('13:25'), stay: 120, travel: { mode: 'TRANSIT', minutes: 25, estimated: false } }] }, { rows: [] }];
    const schedule = buildSchedule(itinerary, timetables);
    expect(schedule.days[0].dateLabel).toBe('12.24 목');
    const [sheet] = scheduleSheets(schedule);
    expect(sheet.rows[5]).toEqual(['1일차', '12.24 목', 2, '11:25', '13:25', '광안리', '랜드마크·전망', 120, '대중교통 25분', 25, '']);
    writeSample('schedule', [sheet]);
});
