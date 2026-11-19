import React, { useState } from 'react';
import { groupApi } from '../api/groupApi';
import { getApiErrorMessage } from '../util/apiError';
import { formatDateTime } from './groupFormat';

const inviteUrl = (token) => `${window.location.origin}/invite/${token}`;

// 방장: 초대 링크 발급(원문은 발급할 때만 보임)·복사·끄기
const InviteBox = ({ group, run }) => {
    const [token, setToken] = useState(null);
    const create = async () => {
        try {
            setToken((await groupApi.createInvite(group.id)).token);
        } catch (error) {
            alert(getApiErrorMessage(error));
        }
    };
    const copy = () => navigator.clipboard?.writeText(inviteUrl(token)).then(() => alert('초대 링크를 복사했어요.'));
    return (
        <div className="invite-box">
            <p className="group-hint">
                {group.invite.active ? `초대 링크 사용 중 (${formatDateTime(group.invite.expiresAt)}까지)` : '초대 링크가 꺼져 있어요.'}
                {' '}새로 만들면 이전 링크는 쓸 수 없어요.
            </p>
            {token && <div className="invite-box__url"><input readOnly value={inviteUrl(token)} onFocus={(e) => e.target.select()} /><button type="button" className="group-button is-small" onClick={copy}>복사</button></div>}
            <div className="group-actions">
                <button type="button" className="group-button is-primary" onClick={create}>{group.invite.active ? '새 초대 링크 만들기' : '초대 링크 만들기'}</button>
                {group.invite.active && <button type="button" className="group-button" onClick={() => { setToken(null); run(() => groupApi.disableInvite(group.id).then(() => groupApi.detail(group.id))); }}>링크 끄기</button>}
            </div>
        </div>
    );
};

// 방장: 참여자의 기록을 나중에 가입한 실제 멤버에게 연결 (정산 금액이 옮겨지므로 방장만)
const GuestLink = ({ group, member, run }) => {
    const targets = group.members.filter((item) => !item.isGuest);
    const link = (e) => {
        const target = targets.find((item) => item.id === Number(e.target.value));
        if (target && window.confirm(`"${member.nickName}"의 지출·정산 기록을 ${target.nickName}님에게 연결할까요? 되돌릴 수 없어요.`)) {
            run(() => groupApi.claimGuest(group.id, member.id, target.id));
        }
    };
    return (
        <select className="group-select" value="" aria-label="기록을 연결할 멤버" onChange={link}>
            <option value="">멤버에게 연결</option>
            {targets.map((item) => <option key={item.id} value={item.id}>{item.nickName}</option>)}
        </select>
    );
};

// 이름만 있는 참여자: 방장만 삭제(기록 없을 때)·멤버에게 연결. 나가거나 탈퇴한 멤버의 기록은 연결 불가
const Guest = ({ group, member, run, isOwner }) => (
    <li className="group-item">
        <div className="group-item__text">
            <strong>{member.nickName}</strong>
            <span>{member.isFormer ? '나간 멤버의 정산 기록' : '이름만 있는 참여자 (정산용) · 가입했다면 방장에게 기록 연결을 요청하세요'}</span>
        </div>
        {isOwner && !member.isFormer && <GuestLink group={group} member={member} run={run} />}
        {isOwner && <button type="button" className="group-button is-small is-danger"
            onClick={() => window.confirm(`"${member.nickName}"을(를) 지울까요?`) && run(() => groupApi.deleteGuest(group.id, member.id))}>삭제</button>}
    </li>
);

const GuestForm = ({ group, run }) => {
    const [name, setName] = useState('');
    const submit = async (e) => { e.preventDefault(); if (await run(() => groupApi.addGuest(group.id, name))) setName(''); };
    return (
        <form className="group-form group-form--row" onSubmit={submit}>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength="50" placeholder="가입하지 않은 사람 이름 (정산용)" required />
            <button type="submit" className="group-button">참여자 추가</button>
        </form>
    );
};

const Member = ({ group, member, run, isOwner }) => (member.isGuest ? <Guest group={group} member={member} run={run} isOwner={isOwner} /> : (
    <li className="group-item">
        <div className="group-item__text">
            <strong>{member.nickName}{member.isMe ? ' (나)' : ''}</strong>
            <span>{member.role === 'OWNER' ? '방장' : '멤버'} · {formatDateTime(member.joinedAt)} 참여</span>
        </div>
        {isOwner && !member.isMe && <button type="button" className="group-button is-small"
            onClick={() => window.confirm(`${member.nickName}님에게 방장을 넘길까요?`) && run(() => groupApi.transferOwner(group.id, member.id))}>방장 넘기기</button>}
        {isOwner && !member.isMe && <button type="button" className="group-button is-small is-danger"
            onClick={() => window.confirm(`${member.nickName}님을 내보낼까요?`) && run(() => groupApi.kick(group.id, member.id))}>내보내기</button>}
    </li>
));

// 멤버 목록, 초대 링크(방장), 나가기
const MemberPanel = ({ group, run, onLeave }) => {
    const isOwner = group.myRole === 'OWNER';
    const memberCount = group.members.filter((member) => !member.isGuest).length;
    return (
        <section className="group-section">
            <h2>멤버 {memberCount}/{group.maxMembers}</h2>
            <ul className="group-items">{group.members.map((member) => <Member key={member.id} group={group} member={member} run={run} isOwner={isOwner} />)}</ul>
            <GuestForm group={group} run={run} />
            <p className="group-hint">정산에만 필요한 사람(예: 가입하지 않은 가족)은 이름만으로 추가할 수 있어요. 나중에 가입해 참여하면 방장이 그 멤버에게 기록을 연결해 줄 수 있어요.</p>
            {isOwner && <InviteBox group={group} run={run} />}
            <div className="group-actions">
                <button type="button" className="group-button is-danger" onClick={onLeave}>{isOwner && memberCount === 1 ? '모임 삭제' : '모임 나가기'}</button>
            </div>
        </section>
    );
};

export default MemberPanel;
