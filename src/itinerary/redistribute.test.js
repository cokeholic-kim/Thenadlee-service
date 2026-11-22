import { canRedistribute, redistributeDays } from './redistribute';

const spot = (id, lat, lon) => ({ id, lat, lon });
// 서쪽 묶음(126.2대)과 동쪽 묶음(126.9대)이 두 일차에 섞여 있음
const west = [spot(1, 33.40, 126.20), spot(2, 33.42, 126.22), spot(3, 33.41, 126.25)];
const east = [spot(4, 33.45, 126.90), spot(5, 33.47, 126.93), spot(6, 33.46, 126.95)];
const mixed = [[west[0], east[0], west[1]], [east[1], west[2], east[2]]];

test('섞인 일차를 가까운 것끼리 고르게 나눔', () => {
    const result = redistributeDays(mixed);
    expect(result.changed).toBe(true);
    expect(result.afterMeters).toBeLessThan(result.beforeMeters);
    const groups = result.days.map((day) => day.map((s) => s.id).sort());
    expect(groups).toEqual([[1, 2, 3], [4, 5, 6]]);
});

test('이미 묶여 있으면 바꾸지 않음, 장소 수는 그대로', () => {
    const result = redistributeDays([west, east]);
    expect(result.changed).toBe(false);
    expect(result.days.flat()).toHaveLength(6);
});

test('1일이거나 장소가 일차 수 이하이거나 좌표가 없으면 할 수 없음', () => {
    expect(canRedistribute([west])).toBe(false);
    expect(canRedistribute([[west[0]], [east[0]]])).toBe(false);
    expect(canRedistribute([[...west, spot(9, null, null)], east])).toBe(false);
});

test('장소 수가 고르게 (7곳 3일 → 3·2·2 이하로)', () => {
    const many = [[...west, ...east, spot(7, 33.30, 126.55)], [], []];
    const result = redistributeDays(many);
    expect(Math.max(...result.days.map((day) => day.length))).toBeLessThanOrEqual(3);
    expect(result.days.flat()).toHaveLength(7);
});
