// root 리듀서 만들기
// rootReducer를 store안으로

import { combineReducers} from "redux";
import add from "./add";
import logincheck from "./logincheck";
import  Marker  from "./hover";


const rooterReducer = combineReducers({ add ,logincheck,Marker }) ;

export default rooterReducer ;
