// 지도 화면에서 편집 중인 일정의 기본 정보 (일차별 장소는 add 모듈)
import { DEFAULT_TRAVEL_MODE } from '../route/travelModes';
import { countTripDays } from '../itinerary/tripDates';
import { setDayCount } from './add';

// 1. 액션 타입
const SET_TRAVEL_MODE = 'itinerary/SET_TRAVEL_MODE';
const SET_TRIP_DATES = 'itinerary/SET_TRIP_DATES';
const SET_INFO = 'itinerary/SET_INFO';
const RESET = 'itinerary/RESET';
const SET_DAY_START_TIME = 'itinerary/SET_DAY_START_TIME';
const SET_STAY_MINUTES = 'itinerary/SET_STAY_MINUTES';

// 2. 액션 생성 함수
export const setTravelMode = (travelMode) => ({ type: SET_TRAVEL_MODE, travelMode });
export const setItineraryInfo = (info) => ({ type: SET_INFO, info });
export const resetItinerary = () => ({ type: RESET });
export const setDayStartTime = (dayIndex, time) => ({ type: SET_DAY_START_TIME, dayIndex, time }); // 시간표: 일차별 출발 시각
export const setStayMinutes = (spotId, minutes) => ({ type: SET_STAY_MINUTES, spotId, minutes }); // 시간표: 장소별 머무는 시간
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
    travelMode: DEFAULT_TRAVEL_MODE,
    // 시간표 (비어 있으면 기본 출발 10:00·머무는 시간 1시간). 머무는 시간은 장소 번호별 (한 일정에 같은 장소는 한 번만)
    dayStartTimes: [],
    stayMinutes: {}
};

const withDayStartTime = (state, dayIndex, time) => {
    const dayStartTimes = [...state.dayStartTimes];
    dayStartTimes[dayIndex] = time || null;
    return { ...state, dayStartTimes };
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
        case SET_DAY_START_TIME:
            return withDayStartTime(state, action.dayIndex, action.time);
        case SET_STAY_MINUTES:
            return { ...state, stayMinutes: { ...state.stayMinutes, [action.spotId]: action.minutes } };
        case RESET:
            return initialState;
        default:
            return state;
    }
}
