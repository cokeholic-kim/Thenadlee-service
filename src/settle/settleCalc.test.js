import { balances, expenseShares, SPLIT, transfers, validateExpense } from './settleCalc';

const people = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }, { id: 3, name: 'C' }];
const equal = (amount, payerId, participantIds = [1, 2, 3]) => ({ title: 't', amount, payerId, participantIds, split: SPLIT.EQUAL, custom: {} });

test('균등 나누기 나머지는 낸 사람이 부담', () => {
    expect(expenseShares(equal(10000, 2)).map((s) => s.share)).toEqual([3333, 3334, 3333]);
});

test('낸 사람이 나눈 사람에 없으면 첫 사람이 나머지 부담', () => {
    expect(expenseShares(equal(10001, 3, [1, 2])).map((s) => s.share)).toEqual([5001, 5000]);
});

test('잔액 합은 0, 송금으로 모두 정리', () => {
    const rows = balances(people, [equal(30000, 1), equal(9000, 2), { ...equal(6000, 3), split: SPLIT.CUSTOM, custom: { 1: 1000, 2: 2000, 3: 3000 } }]);
    expect(rows.reduce((sum, row) => sum + row.balance, 0)).toBe(0);
    const list = transfers(rows);
    const after = Object.fromEntries(rows.map((row) => [row.name, row.balance]));
    list.forEach((t) => { after[t.from] += t.amount; after[t.to] -= t.amount; });
    expect(Object.values(after).every((v) => v === 0)).toBe(true);
    expect(list.length).toBeLessThanOrEqual(2);
});

test('직접 정한 금액 합계가 다르면 안내', () => {
    expect(validateExpense({ ...equal(5000, 1), split: SPLIT.CUSTOM, custom: { 1: 1000, 2: 1000, 3: 1000 } })).toMatch('합계');
    expect(validateExpense(equal(5000, null))).toMatch('낸 사람');
    expect(validateExpense(equal(0, 1))).toMatch('금액');
    expect(validateExpense(equal(5000, 1))).toBeNull();
});
