// 1.액션 타입
const SET_ENTERED = "SET_ENTERED" ;
const SET_LEAVED = "SET_LEAVED" ;

//2.액션 생성함수
export const setENTER = (lat,lng)=>({
    type:SET_ENTERED,
    lat,
    lng
})

export const setLEAVE = () =>({
    type:SET_LEAVED
})


//3.초기값 생성
export const initialState = {
    lat:"",
    lng:"",
}

// 4.리듀서 생성

export default function Marker(state=initialState,action){
    switch(action.type){
        case SET_ENTERED:
            return{
                lat:action.lat,
                lng:action.lng
            }
        case SET_LEAVED:
            return{
                lat:"",
                lng:"",
            }
        default:
            return state;
    }
}

