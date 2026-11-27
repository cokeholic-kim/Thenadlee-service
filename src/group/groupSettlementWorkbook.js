import { BASE_CURRENCY, categoryLabel } from './expenseFormat';

// 모임 정산 → 엑셀 시트 (정산 · 보낼 돈 · 지출 · 송금 완료). 서버가 준 정산 결과(overview)를 그대로 옮김, 브라우저에서만 만듦
const SPLIT_LABELS = { EQUAL: '똑같이', CUSTOM: '사람별 금액' };

const sharesText = (expense) => expense.shares.map((share) => `${share.name} ${share.shareKrw.toLocaleString('ko-KR')}`).join(' / ');

const expenseRow = (expense) => [
    expense.spentOn, categoryLabel(expense.category), expense.title, expense.currency, expense.amount,
    expense.currency === BASE_CURRENCY ? null : expense.exchangeRate, expense.amountKrw, expense.payerName,
    SPLIT_LABELS[expense.splitType] || expense.splitType, sharesText(expense), expense.memo || '',
];

const memberRow = (member) => [member.name, member.paid, member.owed, member.sent, member.received, member.balance];

/** overview: 모임 정산 응답 { expenses, members, transfers, settlements, totalKrw } */
export const groupSettlementSheets = (overview) => [
    {
        name: '정산',
        rows: [['이름', '낸 돈(원)', '부담(원)', '보낸 돈(원)', '받은 돈(원)', '남은 정산(원, +받을 돈 / -보낼 돈)'], ...overview.members.map(memberRow), [], ['총 사용 금액(원)', overview.totalKrw]],
        widths: [14, 14, 14, 14, 14, 30], boldRows: [0, overview.members.length + 2],
    },
    {
        name: '보낼 돈',
        rows: [['보내는 사람', '받는 사람', '금액(원)'], ...overview.transfers.map((item) => [item.fromName, item.toName, item.amountKrw])],
        widths: [14, 14, 14], boldRows: [0],
    },
    {
        name: '지출',
        rows: [['날짜', '분류', '내용', '통화', '금액', '환율(1통화=원)', '원화 금액(원)', '낸 사람', '나누는 방법', '사람별 부담(원)', '메모'], ...overview.expenses.map(expenseRow)],
        widths: [12, 10, 22, 8, 12, 14, 14, 12, 12, 40, 24], boldRows: [0],
    },
    {
        name: '송금 완료',
        rows: [['기록 시각', '보낸 사람', '받은 사람', '금액(원)'], ...overview.settlements.map((item) => [item.createdAt, item.fromName, item.toName, item.amountKrw])],
        widths: [20, 14, 14, 14], boldRows: [0],
    },
];
