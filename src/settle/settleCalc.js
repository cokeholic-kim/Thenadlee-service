// 정산 계산기 계산 (모임 정산과 같은 규칙, 브라우저에서만 계산하고 서버로 보내지 않음)
//   균등 나누기: 1원 단위 나머지는 낸 사람이 부담 (낸 사람이 나눈 사람에 없으면 첫 사람)
//   잔액 = 낸 돈 - 부담할 돈 (양수면 받을 돈, 음수면 보낼 돈), 송금은 금액 큰 순으로 짝지어 횟수를 줄임
import { won } from '../group/expenseFormat';

export const SPLIT = { EQUAL: 'EQUAL', CUSTOM: 'CUSTOM' };
export const LIMITS = { people: 30, expenses: 200, nameLength: 20, titleLength: 50, maxAmount: 100000000 };

const equalShares = (amount, participantIds, payerId) => {
    const base = Math.floor(amount / participantIds.length);
    const rest = amount - base * participantIds.length;
    const receiver = participantIds.includes(payerId) ? payerId : participantIds[0];
    return participantIds.map((personId) => ({ personId, share: base + (personId === receiver ? rest : 0) }));
};

/** 지출 하나의 사람별 부담액 */
export const expenseShares = (expense) => (expense.split === SPLIT.CUSTOM
    ? expense.participantIds.map((personId) => ({ personId, share: Number(expense.custom[personId] || 0) }))
    : equalShares(expense.amount, expense.participantIds, expense.payerId));

/** 사람별 낸 돈·부담할 돈·잔액 */
export const balances = (people, expenses) => {
    const rows = new Map(people.map((person) => [person.id, { ...person, paid: 0, owed: 0, balance: 0 }]));
    expenses.forEach((expense) => {
        if (rows.has(expense.payerId)) rows.get(expense.payerId).paid += expense.amount;
        expenseShares(expense).forEach(({ personId, share }) => { if (rows.has(personId)) rows.get(personId).owed += share; });
    });
    return [...rows.values()].map((row) => ({ ...row, balance: row.paid - row.owed }));
};

const sortedAmounts = (rows, sign) => rows.filter((row) => sign * row.balance > 0)
    .map((row) => ({ id: row.id, name: row.name, amount: sign * row.balance }))
    .sort((a, b) => b.amount - a.amount);

/** 보낼 돈: [{ from, to, amount }] */
export const transfers = (rows) => {
    const creditors = sortedAmounts(rows, 1);
    const debtors = sortedAmounts(rows, -1);
    const result = [];
    while (creditors.length && debtors.length) {
        const amount = Math.min(creditors[0].amount, debtors[0].amount);
        result.push({ from: debtors[0].name, to: creditors[0].name, amount });
        [creditors, debtors].forEach((list) => { list[0].amount -= amount; if (list[0].amount <= 0) list.shift(); list.sort((a, b) => b.amount - a.amount); });
    }
    return result;
};

const customTotal = (form) => form.participantIds.reduce((sum, id) => sum + Number(form.custom[id] || 0), 0);

/** 지출 입력 확인: 문제가 있으면 안내 문구 */
export const validateExpense = (form) => {
    if (!form.title.trim()) return '무엇에 쓴 돈인지 적어 주세요.';
    if (!Number.isInteger(form.amount) || form.amount < 1 || form.amount > LIMITS.maxAmount) return '금액은 1원 ~ 1억 원 사이로 적어 주세요.';
    if (!form.payerId) return '낸 사람을 골라 주세요.';
    if (form.participantIds.length === 0) return '나눌 사람을 한 명 이상 골라 주세요.';
    if (form.split === SPLIT.CUSTOM && customTotal(form) !== form.amount) return `사람별 금액 합계(${won(customTotal(form))})가 지출 금액과 같아야 해요.`;
    return null;
};

/** 결과를 글로 (복사·공유용) */
export const summaryText = (rows, list, total) => [
    `[정산 결과] 총 ${won(total)}`,
    ...rows.map((row) => `${row.name}: 낸 돈 ${won(row.paid)} / 부담 ${won(row.owed)}`),
    '',
    list.length ? '보낼 돈' : '보낼 돈이 없어요.',
    ...list.map((item) => `${item.from} → ${item.to} ${won(item.amount)}`),
    '',
    '더 나들이 정산 계산기',
].join('\n');
