import { balances, expenseShares, kakaoText, SPLIT, summaryText, transfers, validateExpense } from './settleCalc';

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

const foreign = (originalAmount, rate, payerId, participantIds = [1, 2, 3], extra = {}) => ({
    title: 't', currency: 'USD', originalAmount, rate, amount: Math.round(originalAmount * rate), payerId, participantIds, split: SPLIT.EQUAL, custom: {}, ...extra,
});

test('외화는 원화로 바꿔 똑같이 나눔 (합계 = 반올림한 원화)', () => {
    const expense = foreign(100.5, 1380.5, 1);
    expect(expense.amount).toBe(138740);
    const shares = expenseShares(expense).map((s) => s.share);
    expect(shares.reduce((a, b) => a + b, 0)).toBe(138740);
    expect(shares).toEqual([46248, 46246, 46246]);
});

test('외화 직접 정하기: 사람별 반올림 차이는 낸 사람이 부담', () => {
    const expense = foreign(10, 1333.33, 2, [1, 2, 3], { split: SPLIT.CUSTOM, custom: { 1: 3.33, 2: 3.33, 3: 3.34 } });
    const shares = expenseShares(expense);
    expect(shares.reduce((sum, s) => sum + s.share, 0)).toBe(expense.amount);
    expect(shares.find((s) => s.personId === 1).share).toBe(Math.round(3.33 * 1333.33));
});

test('외화 입력 확인: 환율 없음·합계 다름 안내, 소수 합계 오차는 허용', () => {
    expect(validateExpense(foreign(10, 0, 1))).toMatch('환율');
    expect(validateExpense(foreign(10, 1300, 1, [1, 2], { split: SPLIT.CUSTOM, custom: { 1: 5, 2: 4 } }))).toMatch('합계');
    expect(validateExpense(foreign(0.3, 1300, 1, [1, 2, 3], { split: SPLIT.CUSTOM, custom: { 1: 0.1, 2: 0.1, 3: 0.1 } }))).toBeNull();
    expect(validateExpense(foreign(100000, 1500, 1))).toMatch('1억');
});

test('결과 글에 쓴 환율, 카카오 글은 보낼 돈만', () => {
    const expenses = [foreign(10, 1380, 1), equal(9000, 2)];
    const rows = balances(people, expenses);
    expect(summaryText(rows, transfers(rows), 22800, expenses)).toContain('1 USD = 1,380원');
    expect(kakaoText([{ from: 'B', to: 'A', amount: 1000 }], 22800)).toBe('[정산 결과] 총 22,800원\nB → A 1,000원');
});
