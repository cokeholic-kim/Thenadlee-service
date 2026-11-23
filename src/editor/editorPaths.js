// 에디터 소개 주소 (프로필 번호는 회원 번호와 다른 공개용 번호)
export const EDITORS_PATH = '/editors';

export const editorPath = (profileId) => `${EDITORS_PATH}/${profileId}`;

// "에디터 ○○" 크레딧 문구
export const editorCreditText = (editor) => `에디터 ${editor.nickName}`;
