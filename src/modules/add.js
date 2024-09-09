import { act } from "react-dom/test-utils";

// 1.액션 타입
const SET_REDO = "SET_REDO" ;
const SET_RIGHT = "SET_RIGHT" ;
const SET_LEFT = "SET_LEFT" ;
const SET_RESET = "SET_RESET" ;
const SET_TOP = "SET_TOP";
const SET_DOWN = "SET_DOWN";
const SET_LEFTALL = "SET_LEFTALL"

// 2.액션 생성함수
export const setRedo = (data) => ({
    type: SET_REDO,
    data    
})
export const setRight = (spotName,lat,lon,imageUrl) => ({
    type: SET_RIGHT,
    add:{
        // spot_name : spotName,
        // Nation: nation,
        // spot_lat : lat,
        // spot_lng : lon,
        // img_url : img,
        // time : time
        spotName,
        lat,
        lon,
        imageUrl
    }
})

export const setLeft = (spotName,lat,lon,imageUrl)=>({
    type:SET_LEFT,    
    add:{
        spotName,
        lat,
        lon,
        imageUrl
        // nation,
        // time
    }
})

export const setLeftAll = (leftall) =>({
    type:SET_LEFTALL,
    add:leftall
})

export const setReset = ()=>({
    type:SET_RESET
})

export const setTop = (newarr)=>({
    type:SET_TOP,
    arr:newarr
})

export const setDown = (newarr)=>({
    type:SET_DOWN,
    arr:newarr
})

// 3.초기값 생성
export const initialState = {
    data:[],
    left:[],
    right:[]
  };


//  4. 리듀서 생성
export function adds(state=initialState,action){
    switch(action.type){
        case SET_RIGHT:
            // x 버튼 클릭 ,,왼쪽
            const leftadds = state.left.filter(left=> left.spotName !== action.add.spotName)
            return{
                ...state,
                left: leftadds,
                right: state.right.concat(action.add)
            }
        case SET_LEFT:
            //플러스버튼클릭 ,,오른쪽... 밥먹는손
            
            // 파라미터로 들어온 spotName과 오른쪽상태값이 가지고있던 spot을 비교해서 같은값은 제거.
            const rightadds = state.right.filter(right=> right.spotName !== action.add.spotName)
            return{
                ...state,
                left: state.left.concat(action.add),
                right: rightadds
            } ;
        case SET_LEFTALL:
            //추천장소 모두추가
            // 오른쪽배열에서 왼쪽값들을 제외시킨값
            // 조건으로줄 새로운 배열값만들기
            let spotname = action.add.map(left=>left.spotname)
            //right에 필터를 주고 spotname과  right의spot_name 이 일치하지않는값을 반환 
            let newarr=state.right.filter(list=> spotname.indexOf(list.spot_name)===-1)
            return{
                ...state,
                right:newarr,
                left:action.add
            };
        case SET_RESET:
            // 전체 삭제
            return{
                ...state,
                left:[],
                right:[...state.left]
            }
        case SET_TOP:
            return{
                ...state,
                left:action.arr
            }
        case SET_DOWN:
            return{
                ...state,
                left:action.arr
            }

        case SET_REDO:{
            // 마운트 시 데이터 재업로드
            return{
                data:action.data,
                left:[],
                right:action.data
            }
        }

        // useEffect(()=>{
        //     dispatch(setRedo(data))
        // },[])
        default:
            return state;
    }
}


export default adds;