// 지도 화면에서 편집 중인 일정의 기본 정보 (일차별 장소는 add 모듈)
import { DEFAULT_TRAVEL_MODE } from '../route/travelModes';
import { countTripDays } from '../itinerary/tripDates';
import { setDayCount } from './add';

// 1. 액션 타입
const SET_TRAVEL_MODE = 'itinerary/SET_TRAVEL_MODE';
const SET_TRIP_DATES = 'itinerary/SET_TRIP_DATES';
const SET_INFO = 'itinerary/SET_INFO';
const RESET = 'itinerary/RESET';

// 2. 액션 생성 함수
export const setTravelMode = (travelMode) => ({ type: SET_TRAVEL_MODE, travelMode });
export const setItineraryInfo = (info) => ({ type: SET_INFO, info });
export const resetItinerary = () => ({ type: RESET });
const setTripDates = (startDate, endDate) => ({ type: SET_TRIP_DATES, startDate, endDate });

// 여행 기간이 바뀌면 일차 수도 함께 맞춤
export const changeTripDates = (startDate, endDate) => (dispatch) => {
    dispatch(setTripDates(startDate, endDate));
    dispatch(setDayCount(countTripDays(startDate, endDate)));
};

// 3. 초기값 (id 가 없으면 아직 저장하지 않은 새 일정)
const initialState = {
    id: null,
    title: '',
    description: '',
    visibility: 'PRIVATE',
    isOwner: true,
    authorNickName: '',
    startDate: null,
    endDate: null,
    travelMode: DEFAULT_TRAVEL_MODE
};

// 4. 리듀서
export default function itinerary(state = initialState, action) {
    switch (action.type) {
        case SET_TRAVEL_MODE:
            return { ...state, travelMode: action.travelMode };
        case SET_TRIP_DATES:
            return { ...state, startDate: action.startDate, endDate: action.endDate };
        case SET_INFO:
            return { ...state, ...action.info };
        case RESET:
            return initialState;
        default:
            return state;
    }
}
