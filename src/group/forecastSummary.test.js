import { summarizeForecast } from './forecastSummary';

const KST = 9 * 3600;
// 현지(KST) 날짜·시각의 3시간 예보 한 칸
const slot = (date, hour, main, pop = 0, icon = '01d') => ({
    dt: Date.UTC(...date.split('-').map((v, i) => (i === 1 ? Number(v) - 1 : Number(v))), hour) / 1000 - KST,
    main: { temp_min: 10, temp_max: 15 }, weather: [{ main, icon }], pop,
});

test('낮에 비 예보가 있으면 RAIN, 강수확률은 낮 최대값', () => {
    const day = summarizeForecast([slot('2026-11-24', 9, 'Clear', 0.1), slot('2026-11-24', 12, 'Rain', 0.8, '10d'), slot('2026-11-24', 15, 'Clouds', 0.3)], KST)['2026-11-24'];
    expect(day.wet).toBe('RAIN');
    expect(day.pop).toBe(80);
});

test('밤에만 비면 낮 기준으로는 비 아님, 현지 날짜로 묶음', () => {
    const result = summarizeForecast([slot('2026-11-24', 12, 'Clear'), slot('2026-11-24', 23, 'Rain', 0.9, '10n'), slot('2026-11-25', 0, 'Clear')], KST);
    expect(result['2026-11-24'].wet).toBeNull();
    expect(Object.keys(result)).toEqual(['2026-11-24', '2026-11-25']);
});

test('강수확률만 높아도 비, 눈이 있으면 SNOW 우선', () => {
    expect(summarizeForecast([slot('2026-11-24', 10, 'Clouds', 0.7)], KST)['2026-11-24'].wet).toBe('RAIN');
    expect(summarizeForecast([slot('2026-11-24', 10, 'Rain', 0.9), slot('2026-11-24', 13, 'Snow', 0.9, '13d')], KST)['2026-11-24'].wet).toBe('SNOW');
});
