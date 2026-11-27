import { BASE_CURRENCY } from '../group/expenseFormat';
import { expenseShares, originalAmount, SPLIT } from './settleCalc';

// 정산 계산기 → 엑셀 시트 (정산 · 보낼 돈 · 지출). 금액은 숫자 칸이라 엑셀에서 바로 합계를 낼 수 있음
const nameOf = (people, id) => people.find((person) => person.id === id)?.name || '';

const balanceState = (balance) => (balance > 0 ? '받기' : balance < 0 ? '보내기' : '끝');

const sharesText = (people, expense) => expenseShares(expense).map(({ personId, share }) => `${nameOf(people, personId)} ${share.toLocaleString('ko-KR')}`).join(' / ');

const expenseRow = (people, expense) => {
    const currency = expense.currency || BASE_CURRENCY;
    return [
        expense.title, currency, originalAmount(expense), currency === BASE_CURRENCY ? null : expense.rate, expense.amount,
        nameOf(people, expense.payerId), expense.participantIds.map((id) => nameOf(people, id)).join(', '),
        expense.split === SPLIT.CUSTOM ? '직접 정하기' : '똑같이', sharesText(people, expense),
    ];
};

/** rows: balances 결과, list: transfers 결과 */
export const settleSheets = ({ people, expenses, rows, list, total }) => [
    {
        name: '정산',
        rows: [['이름', '낸 돈(원)', '부담(원)', '정산(원)', '상태'], ...rows.map((row) => [row.name, row.paid, row.owed, Math.abs(row.balance), balanceState(row.balance)]), [], ['총 사용 금액(원)', total]],
        widths: [14, 14, 14, 14, 10], boldRows: [0, rows.length + 2],
    },
    {
        name: '보낼 돈',
        rows: [['보내는 사람', '받는 사람', '금액(원)'], ...list.map((item) => [item.from, item.to, item.amount])],
        widths: [14, 14, 14], boldRows: [0],
    },
    {
        name: '지출',
        rows: [['내용', '통화', '금액', '환율(1통화=원)', '원화 금액(원)', '낸 사람', '나눈 사람', '나누는 방법', '사람별 부담(원)'], ...expenses.map((expense) => expenseRow(people, expense))],
        widths: [22, 8, 12, 14, 14, 12, 24, 12, 40], boldRows: [0],
    },
];
