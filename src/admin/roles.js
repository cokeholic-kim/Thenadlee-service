// 회원 권한 (서버 user.role 과 같은 값)
export const ROLE_OPTIONS = [
    { value: 'USER', label: '일반' },
    { value: 'EDITOR', label: '에디터' },
    { value: 'ADMIN', label: '관리자' },
];

export const roleLabel = (role) => ROLE_OPTIONS.find((option) => option.value === role)?.label || role;

// 에디터 이상: 여행지·장소·여행기·일정 관리
export const canEdit = (role) => role === 'EDITOR' || role === 'ADMIN';

// 관리자: 회원 권한 변경, 여행지 삭제
export const isAdmin = (role) => role === 'ADMIN';
