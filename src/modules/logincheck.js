import { fetchMe } from '../api/userApi';

// 1. 액션 타입
const SET_LOGIN = 'SET_LOGIN';
const SET_LOGOUT = 'SET_LOGOUT';

// 2. 액션 생성 함수
export const setLogin = (user) => ({
    type: SET_LOGIN,
    user
});
export const setLogout = () => ({
    type: SET_LOGOUT
});

// 서버 세션 기준으로 로그인 상태 확인 (새로고침해도 유지)
export const loadLoginUser = () => async (dispatch) => {
    try {
        dispatch(setLogin(await fetchMe()));
    } catch (error) {
        dispatch(setLogout());
    }
};

// 3. 초기값
const initialState = {
    isLogin: false,
    checked: false,
    user: null
};

// 4. 리듀서
export default function logincheck(state = initialState, action) {
    switch (action.type) {
        case SET_LOGIN:
            return { isLogin: true, checked: true, user: action.user };
        case SET_LOGOUT:
            return { isLogin: false, checked: true, user: null };
        default:
            return state;
    }
}
