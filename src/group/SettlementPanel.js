import React from 'react';
import { groupApi } from '../api/groupApi';
import { formatDateTime } from './groupFormat';
import { won } from './expenseFormat';
import { confirmDialog } from '../ui/feedback';

const BalanceRow = ({ member }) => (
    <tr>
        <td>{member.name}</td>
        <td>{won(member.paid)}</td>
        <td>{won(member.owed)}</td>
        <td className={member.balance > 0 ? 'is-plus' : member.balance < 0 ? 'is-minus' : ''}>
            {member.balance > 0 ? `${won(member.balance)} 받기` : member.balance < 0 ? `${won(-member.balance)} 보내기` : '정산 끝'}
        </td>
    </tr>
);

// 받는 사람 또는 방장만 송금 완료로 표시 가능 (서버도 같은 규칙으로 확인)
const TransferRow = ({ group, transfer, run }) => {
    const canMark = group.myRole === 'OWNER' || transfer.toId === group.myMemberId;
    return (
        <li className="group-item">
            <div className="group-item__text"><strong>{transfer.fromName} → {transfer.toName}</strong><span>{won(transfer.amountKrw)}</span></div>
            {canMark && <button type="button" className="group-button is-small is-primary"
                onClick={async () => await confirmDialog(`${transfer.fromName}님에게서 ${won(transfer.amountKrw)}을 받았나요?`) && run(() => groupApi.settle(group.id, transfer.fromId, transfer.toId, transfer.amountKrw))}>받았어요</button>}
        </li>
    );
};

const SettledList = ({ group, overview, run }) => (
    <details className="settled-list">
        <summary>송금 완료 기록 {overview.settlements.length}건</summary>
        <ul className="group-items">
            {overview.settlements.map((item) => (
                <li key={item.id} className="group-item">
                    <div className="group-item__text"><strong>{item.fromName} → {item.toName} {won(item.amountKrw)}</strong><span>{formatDateTime(item.createdAt)} 완료</span></div>
                    {item.canDelete && <button type="button" className="group-button is-small" onClick={() => run(() => groupApi.unsettle(group.id, item.id))}>취소</button>}
                </li>
            ))}
        </ul>
    </details>
);

// 사람별 잔액 + 송금 횟수를 줄인 정산안 (송금은 각자 은행·간편송금 앱에서, 계좌번호는 저장하지 않음)
const SettlementPanel = ({ group, overview, run }) => (
    <section className="group-section">
        <h2>정산 {overview.settled ? '· 모두 끝났어요 🎉' : ''}</h2>
        <div className="balance-table-wrap">
            <table className="balance-table">
                <thead><tr><th>이름</th><th>낸 돈</th><th>쓴 돈</th><th>정산</th></tr></thead>
                <tbody>{overview.members.map((member) => <BalanceRow key={member.memberId} member={member} />)}</tbody>
            </table>
        </div>
        {overview.transfers.length > 0 && <h3 className="settle-title">이렇게 보내면 끝나요</h3>}
        <ul className="group-items">{overview.transfers.map((transfer) => <TransferRow key={`${transfer.fromId}-${transfer.toId}`} group={group} transfer={transfer} run={run} />)}</ul>
        <p className="group-hint">송금은 각자 은행이나 간편송금 앱에서 해 주세요. 돈을 받은 사람(또는 방장)이 "받았어요"를 누르면 정산에 반영돼요.</p>
        {overview.settlements.length > 0 && <SettledList group={group} overview={overview} run={run} />}
    </section>
);

export default SettlementPanel;
