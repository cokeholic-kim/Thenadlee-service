import axios from 'axios';
import { setLogout } from '../modules/logincheck';

// 서버 공통 오류 "로그인이 필요합니다" 의 결과 코드 (로그인 실패·비밀번호 확인 실패와 구분)
const LOGIN_REQUIRED_CODE = 401;
export const SESSION_EXPIRED_EVENT = 'thenadlee:session-expired';

const isLoginRequired = (error) => error.response?.status === LOGIN_REQUIRED_CODE
    && error.response?.data?.result?.resultCode === LOGIN_REQUIRED_CODE;

/**
 * 로그인한 상태에서 API 가 "로그인이 필요합니다"를 돌려주면 (세션 만료) 로그아웃 처리하고 화면에 안내를 띄움
 * 처음부터 로그인하지 않은 방문자의 401 은 그대로 둠
 */
export const installSessionExpiryHandler = (store) => {
    axios.interceptors.response.use(undefined, (error) => {
        if (isLoginRequired(error) && store.getState().logincheck.isLogin) {
            store.dispatch(setLogout());
            window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
        }
        return Promise.reject(error);
    });
};
