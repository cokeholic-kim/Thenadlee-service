import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { adminApi } from '../api/adminApi';
import { getApiErrorMessage } from '../util/apiError';
import AdminLayout from './AdminLayout';
import { ROLE_OPTIONS } from './roles';
import EditorCityPanel from './EditorCityPanel';
import { toast, toastError, confirmDialog } from '../ui/feedback';

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

const UserPanel = ({ onRoleChanged }) => {
    const myLoginId = useSelector((state) => state.logincheck.user?.loginId);
    const [keyword, setKeyword] = useState('');
    const [users, setUsers] = useState(null);
    const search = useCallback((q) => {
        adminApi.searchUsers(q).then(setUsers).catch((error) => toastError(getApiErrorMessage(error)));
    }, []);
    useEffect(() => search(''), [search]);

    const onChangeRole = async (user, role) => {
        if (!await confirmDialog(`${user.nickName} 님의 권한을 바꿀까요?`)) return;
        try {
            toast((await adminApi.changeUserRole(user.id, role)).message);
            search(keyword);
            onRoleChanged();
        } catch (error) {
            toastError(getApiErrorMessage(error));
        }
    };

    return (
        <>
            <form className="admin-form admin-form--row" onSubmit={(e) => { e.preventDefault(); search(keyword); }}>
                <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="아이디 또는 닉네임 앞부분" />
                <button type="submit" className="admin-button is-primary">검색</button>
            </form>
            <p className="admin__hint">에디터는 맡은 여행지의 장소·여행기·공개 일정을 관리할 수 있고, 관리자는 모든 여행지와 회원 권한·해시태그·여행지 추가·삭제까지 할 수 있어요.</p>
            {users === null ? <p>불러오는 중…</p> : (
                <table className="admin-table">
                    <thead><tr><th>아이디</th><th>닉네임</th><th>일정</th><th>가입일</th><th>권한</th></tr></thead>
                    <tbody>{users.map((user) => <UserRow key={user.id} user={user} isSelf={user.loginId === myLoginId} onChangeRole={onChangeRole} />)}</tbody>
                </table>
            )}
        </>
    );
};

// 권한을 바꾸면 에디터 목록도 다시 불러옴
const UsersPage = () => {
    const [reloadKey, setReloadKey] = useState(0);
    return (
        <>
            <UserPanel onRoleChanged={() => setReloadKey((key) => key + 1)} />
            <EditorCityPanel reloadKey={reloadKey} />
        </>
    );
};

// 관리자 전용: 회원 검색과 권한 변경, 에디터 담당 여행지 (아이디·닉네임만 저장하므로 개인정보는 표시하지 않음)
const AdminUsers = () => <AdminLayout title="회원 권한 관리" adminOnly><UsersPage /></AdminLayout>;

export default AdminUsers;
