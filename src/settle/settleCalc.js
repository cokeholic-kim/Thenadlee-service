// 정산 계산기 계산 (모임 정산과 같은 규칙, 브라우저에서만 계산하고 서버로 보내지 않음)
//   외화: 원화 금액 = 금액 × 환율(1 통화 = ?원)을 반올림, 정산은 모두 원화로
//   균등 나누기: 1원 단위 나머지는 낸 사람이 부담 (낸 사람이 나눈 사람에 없으면 첫 사람)
//   직접 정하기: 원래 통화 금액 합계가 지출 금액과 같아야 하고, 사람별로 원화 반올림한 차이는 낸 사람(없으면 첫 사람)에게
//   잔액 = 낸 돈 - 부담할 돈 (양수면 받을 돈, 음수면 보낼 돈), 송금은 금액 큰 순으로 짝지어 횟수를 줄임
import { BASE_CURRENCY, money, won } from '../group/expenseFormat';

export const SPLIT = { EQUAL: 'EQUAL', CUSTOM: 'CUSTOM' };
export const LIMITS = { people: 30, expenses: 200, nameLength: 20, titleLength: 50, maxAmount: 100000000, maxRate: 100000 };
// 외화 금액은 소수 둘째 자리까지 (모임 정산과 같음), 금액 비교 허용 오차
const AMOUNT_DIGITS = 2;
const AMOUNT_TOLERANCE = 0.005;

export const roundAmount = (value) => Number(Number(value).toFixed(AMOUNT_DIGITS));

const isForeign = (expense) => Boolean(expense.currency) && expense.currency !== BASE_CURRENCY;

/** 원래 통화 금액 (예전에 저장한 원화 지출은 amount 그대로) */
export const originalAmount = (expense) => (isForeign(expense) ? expense.originalAmount : expense.amount);

/** 원화 금액 */
export const toKrw = (amount, rate) => Math.round(amount * rate);

const shareTarget = (participantIds, payerId) => (participantIds.includes(payerId) ? payerId : participantIds[0]);

const equalShares = (amount, participantIds, payerId) => {
    const base = Math.floor(amount / participantIds.length);
    const rest = amount - base * participantIds.length;
    const receiver = shareTarget(participantIds, payerId);
    return participantIds.map((personId) => ({ personId, share: base + (personId === receiver ? rest : 0) }));
};

const customShares = (expense) => {
    const rate = isForeign(expense) ? expense.rate : 1;
    const shares = expense.participantIds.map((personId) => ({ personId, share: toKrw(Number(expense.custom[personId] || 0), rate) }));
    const diff = expense.amount - shares.reduce((sum, item) => sum + item.share, 0);
    const receiver = shareTarget(expense.participantIds, expense.payerId);
    return shares.map((item) => (item.personId === receiver ? { ...item, share: item.share + diff } : item));
};

/** 지출 하나의 사람별 부담액 (원화, 합계는 항상 지출 원화 금액과 같음) */
export const expenseShares = (expense) => (expense.split === SPLIT.CUSTOM
    ? customShares(expense)
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

const customTotal = (form) => roundAmount(form.participantIds.reduce((sum, id) => sum + Number(form.custom[id] || 0), 0));

const amountError = (form) => {
    if (isForeign(form) && !(form.rate > 0 && form.rate <= LIMITS.maxRate)) return `환율(1 ${form.currency} = ?원)을 적어 주세요.`;
    if (!(originalAmount(form) > 0) || !Number.isInteger(form.amount) || form.amount < 1 || form.amount > LIMITS.maxAmount) {
        return '금액은 원화로 1원 ~ 1억 원 사이가 되게 적어 주세요.';
    }
    return null;
};

/** 지출 입력 확인: 문제가 있으면 안내 문구 */
export const validateExpense = (form) => {
    if (!form.title.trim()) return '무엇에 쓴 돈인지 적어 주세요.';
    const error = amountError(form);
    if (error) return error;
    if (!form.payerId) return '낸 사람을 골라 주세요.';
    if (form.participantIds.length === 0) return '나눌 사람을 한 명 이상 골라 주세요.';
    if (form.split === SPLIT.CUSTOM && Math.abs(customTotal(form) - originalAmount(form)) > AMOUNT_TOLERANCE) {
        return `사람별 금액 합계(${money(customTotal(form), form.currency || BASE_CURRENCY)})가 지출 금액과 같아야 해요.`;
    }
    return null;
};

/** 쓴 외화별 환율 (결과 글에 함께 적음) */
export const usedRates = (expenses) => {
    const rates = new Map();
    expenses.filter(isForeign).forEach((expense) => rates.set(expense.currency, expense.rate));
    return [...rates.entries()].map(([currency, rate]) => `1 ${currency} = ${won(rate)}`);
};

/** 결과를 글로 (복사·공유용) */
export const summaryText = (rows, list, total, expenses = []) => [
    `[정산 결과] 총 ${won(total)}`,
    ...rows.map((row) => `${row.name}: 낸 돈 ${won(row.paid)} / 부담 ${won(row.owed)}`),
    ...(usedRates(expenses).length ? ['', `환율: ${usedRates(expenses).join(', ')}`] : []),
    '',
    list.length ? '보낼 돈' : '보낼 돈이 없어요.',
    ...list.map((item) => `${item.from} → ${item.to} ${won(item.amount)}`),
    '',
    '더 나들이 정산 계산기',
].join('\n');

/** 카카오톡 메시지용 짧은 글 (보낼 돈만, 메시지 글자 수 제한 때문에 표는 뺌) */
export const kakaoText = (list, total) => [
    `[정산 결과] 총 ${won(total)}`,
    ...(list.length ? list.map((item) => `${item.from} → ${item.to} ${won(item.amount)}`) : ['보낼 돈이 없어요.']),
].join('\n');
