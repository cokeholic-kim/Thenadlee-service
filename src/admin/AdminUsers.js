import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { adminApi } from '../api/adminApi';
import { getApiErrorMessage } from '../util/apiError';
import AdminLayout from './AdminLayout';
import { ROLE_OPTIONS } from './roles';

const UserRow = ({ user, isSelf, onChangeRole }) => (
    <tr>
        <td>{user.loginId}</td>
        <td>{user.nickName}</td>
        <td>{user.itineraryCount}개</td>
        <td>{user.createdAt.slice(0, 10)}</td>
        <td>
            <select value={user.role} disabled={isSelf} onChange={(e) => onChangeRole(user, e.target.value)} aria-label={`${user.loginId} 권한`}>
                {ROLE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            {isSelf && <small> (본인)</small>}
        </td>
    </tr>
);

const UserPanel = () => {
    const myLoginId = useSelector((state) => state.logincheck.user?.loginId);
    const [keyword, setKeyword] = useState('');
    const [users, setUsers] = useState(null);
    const search = useCallback((q) => {
        adminApi.searchUsers(q).then(setUsers).catch((error) => alert(getApiErrorMessage(error)));
    }, []);
    useEffect(() => search(''), [search]);

    const onChangeRole = async (user, role) => {
        if (!window.confirm(`${user.nickName} 님의 권한을 바꿀까요?`)) return;
        try {
            alert((await adminApi.changeUserRole(user.id, role)).message);
            search(keyword);
        } catch (error) {
            alert(getApiErrorMessage(error));
        }
    };

    return (
        <>
            <form className="admin-form admin-form--row" onSubmit={(e) => { e.preventDefault(); search(keyword); }}>
                <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="아이디 또는 닉네임 앞부분" />
                <button type="submit" className="admin-button is-primary">검색</button>
            </form>
            <p className="admin__hint">에디터는 여행지·장소·여행기·공개 일정을 관리할 수 있고, 관리자는 회원 권한 변경과 여행지 삭제까지 할 수 있어요.</p>
            {users === null ? <p>불러오는 중…</p> : (
                <table className="admin-table">
                    <thead><tr><th>아이디</th><th>닉네임</th><th>일정</th><th>가입일</th><th>권한</th></tr></thead>
                    <tbody>{users.map((user) => <UserRow key={user.id} user={user} isSelf={user.loginId === myLoginId} onChangeRole={onChangeRole} />)}</tbody>
                </table>
            )}
        </>
    );
};

// 관리자 전용: 회원 검색과 권한 변경 (아이디·닉네임만 저장하므로 개인정보는 표시하지 않음)
const AdminUsers = () => <AdminLayout title="회원 권한 관리" adminOnly><UserPanel /></AdminLayout>;

export default AdminUsers;
