//1.액션타입
const SET_LOGIN = "SET_LOGIN";
const SET_LOGOUT = "SET_LOGOUT";
const SET_ID ="SET_ID";
const SET_PASS="SET_PASS";
//2. 액션생성함수
export const setLogin= () =>({
    type:SET_LOGIN
})
export const setLogout= ()=>({
    type:SET_LOGOUT
})
export const setId= ()=>({
    type:SET_ID
})
export const setPass= ()=>({
    type:SET_PASS
})
//초기값 설정
const initialState = {
    isLogin:false,
    updateId:""
}
//홈으로 이동함수
export const goToHome = (navigate) => ()=>{
    navigate('/')
}
//리듀서 생성
export default function logincheck(state=initialState,action){
    switch(action.type){
        case SET_LOGIN:
            return {
                isLogin:true
            };
        case SET_LOGOUT:
            return {
                isLogin:false
            };
        case SET_ID:
            return {
                ...state,
                updateId:action.id
            };
        case SET_PASS:
            return {
                ...state,
                updatePw:action.pw
            };
        default:
            return state;
    }
}
