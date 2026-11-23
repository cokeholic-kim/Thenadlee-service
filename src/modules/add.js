// 지도 화면의 장소 담기 상태 (날짜별 일정)
//   data  : 도시의 추천 장소 전체
//   days  : 일차별로 담은 장소 목록 [[1일차 장소...], [2일차 장소...]]
//   left  : 현재 선택한 일차의 장소 목록 (기존 컴포넌트 호환용 파생 값)
//   right : 아직 어느 일차에도 담지 않은 추천 장소 (파생 값)
// 장소 객체: { id, spotName, lat, lon, imageUrl }

// 1. 액션 타입
const SET_REDO = 'SET_REDO';
const SET_LEFT = 'SET_LEFT';
const SET_RIGHT = 'SET_RIGHT';
const SET_LEFTALL = 'SET_LEFTALL';
const CLEAR_DAY = 'CLEAR_DAY';
const RESTORE_DAY = 'RESTORE_DAY';
const MOVE_SPOT = 'MOVE_SPOT';
const REORDER_SPOT = 'REORDER_SPOT';
const REORDER_DAY = 'REORDER_DAY';
const SET_DAY_COUNT = 'SET_DAY_COUNT';
const SET_ACTIVE_DAY = 'SET_ACTIVE_DAY';
const LOAD_DAYS = 'LOAD_DAYS';
const REPLACE_SPOTS = 'REPLACE_SPOTS';
const REPLACE_DAYS = 'REPLACE_DAYS';
const UPDATE_SPOT_TAGS = 'UPDATE_SPOT_TAGS';

const MAX_DAYS = 30;

// 2. 액션 생성 함수
export const setRedo = (data) => ({ type: SET_REDO, data });            // 도시 장소 불러오기(초기화)
export const setLeft = (spot) => ({ type: SET_LEFT, spot });            // 현재 일차에 장소 담기
export const setRight = (spot) => ({ type: SET_RIGHT, spot });          // 현재 일차에서 장소 빼기
export const setLeftAll = (spots) => ({ type: SET_LEFTALL, spots });    // 추천 장소 모두 담기
export const clearDay = () => ({ type: CLEAR_DAY });                    // 현재 일차 비우기
export const restoreDay = (dayIndex, spots) => ({ type: RESTORE_DAY, dayIndex, spots }); // 비우기 되돌리기
export const moveSpot = (index, offset) => ({ type: MOVE_SPOT, index, offset });
export const reorderSpot = (from, to) => ({ type: REORDER_SPOT, from, to });   // 끌어서 순서 바꾸기
export const reorderDay = (dayIndex, ids) => ({ type: REORDER_DAY, dayIndex, ids }); // 동선 정렬·되돌리기 (장소 번호 순서대로)
export const setDayCount = (dayCount) => ({ type: SET_DAY_COUNT, dayCount });
export const setActiveDay = (dayIndex) => ({ type: SET_ACTIVE_DAY, dayIndex });
export const loadDays = (days) => ({ type: LOAD_DAYS, days });          // 저장된 일정 불러오기
export const replaceDays = (days) => ({ type: REPLACE_DAYS, days });    // 일차 재배분·되돌리기 (보던 일차 유지)
export const updateSpotTags = (spotId, tags) => ({ type: UPDATE_SPOT_TAGS, spotId, tags }); // 해시태그 달기·빼기 후 그 장소만 바꿈

export const replaceSpots = (data) => ({ type: REPLACE_SPOTS, data }); // 장소 등록·수정·삭제 후 목록 갱신 (담은 일정 유지)

export const toSpot = (item) => ({
    id: item.id ?? item.spotId,
    spotName: item.spotName,
    lat: item.lat,
    lon: item.lon,
    imageUrl: item.imageUrl,
    description: item.description,
    source: item.source,
    authorNickName: item.authorNickName,
    images: item.images || [],
    isMine: Boolean(item.isMine),
    credit: item.credit || null,
    imageCredit: item.imageCredit || null,
    category: item.category || null,
    tags: item.tags || [],
    links: item.links || [],
    // 소개한 에디터 { id: 공개 프로필 번호, nickName } (프로필을 공개한 에디터 장소만)
    editor: item.editor || null
});

// 3. 초기값
export const initialState = { data: [], days: [[]], activeDay: 0, left: [], right: [] };

// 추천 목록·담은 일정 모두에서 그 장소의 태그만 바꿈
const withSpotTags = (state, spotId, tags) => {
    const apply = (spot) => (spot.id === spotId ? { ...spot, tags } : spot);
    return { ...state, data: state.data.map(apply), days: state.days.map((spots) => spots.map(apply)) };
};

// 4. 파생 값 계산: 같은 장소는 한 일정에 한 번만 담을 수 있으므로 모든 일차에 담긴 장소를 추천 목록에서 제외
const withDerived = (state) => {
    const usedIds = new Set(state.days.flat().map((spot) => spot.id));
    return {
        ...state,
        left: state.days[state.activeDay] || [],
        right: state.data.filter((spot) => !usedIds.has(spot.id))
    };
};

const updateActiveDay = (state, updater) => {
    const days = state.days.map((spots, index) => (index === state.activeDay ? updater(spots) : spots));
    return withDerived({ ...state, days });
};

const moveInList = (spots, index, offset) => {
    const target = index + offset;
    if (target < 0 || target >= spots.length) return spots;
    const moved = [...spots];
    [moved[index], moved[target]] = [moved[target], moved[index]];
    return moved;
};

const reorderInList = (spots, from, to) => {
    if (from === to || from < 0 || to < 0 || from >= spots.length || to >= spots.length) return spots;
    const moved = [...spots];
    const [spot] = moved.splice(from, 1);
    moved.splice(to, 0, spot);
    return moved;
};

// 일수를 줄이면 뒤쪽 일차의 장소는 일정에서 빠짐
const resizeDays = (state, dayCount) => {
    const count = Math.min(Math.max(dayCount, 1), MAX_DAYS);
    const days = Array.from({ length: count }, (_, index) => state.days[index] || []);
    return withDerived({ ...state, days, activeDay: Math.min(state.activeDay, count - 1) });
};

const addSpots = (state, spots) => {
    const usedIds = new Set(state.days.flat().map((spot) => spot.id));
    const newSpots = spots.map(toSpot).filter((spot) => !usedIds.has(spot.id));
    return updateActiveDay(state, (current) => current.concat(newSpots));
};

// 목록에서 사라진(삭제·숨김) 장소는 담은 일정에서도 빼고, 남은 장소는 최신 정보로 바꿈
const replaceData = (state, list) => {
    const data = list.map(toSpot);
    const byId = new Map(data.map((spot) => [spot.id, spot]));
    const days = state.days.map((spots) => spots.filter((spot) => byId.has(spot.id)).map((spot) => byId.get(spot.id)));
    return withDerived({ ...state, data, days });
};

// 비운 뒤 새로 담은 장소가 있으면 되돌린 장소 뒤에 이어 붙임 (같은 장소는 한 번만)
const restoreDayInState = (state, dayIndex, spots) => {
    if (dayIndex >= state.days.length) return state;
    const restoredIds = new Set(spots.map((spot) => spot.id));
    const days = state.days.map((current, index) => (index === dayIndex
        ? [...spots, ...current.filter((spot) => !restoredIds.has(spot.id))] : current));
    return withDerived({ ...state, days });
};

// 받은 번호 순서대로 다시 배열 (그사이 빠진 장소는 무시, 새로 담은 장소는 뒤에 그대로)
const reorderDayInState = (state, dayIndex, ids) => {
    if (dayIndex >= state.days.length) return state;
    const rank = new Map(ids.map((id, index) => [id, index]));
    const sortKey = (spot, index) => (rank.has(spot.id) ? rank.get(spot.id) : ids.length + index);
    const days = state.days.map((spots, index) => (index === dayIndex
        ? spots.map((spot, order) => ({ spot, key: sortKey(spot, order) })).sort((a, b) => a.key - b.key).map((item) => item.spot)
        : spots));
    return withDerived({ ...state, days });
};

// 5. 리듀서
export default function adds(state = initialState, action) {
    switch (action.type) {
        case SET_REDO:
            return withDerived({ ...initialState, data: action.data.map(toSpot) });
        case SET_LEFT:
            return addSpots(state, [action.spot]);
        case SET_LEFTALL:
            return addSpots(state, action.spots);
        case SET_RIGHT:
            return updateActiveDay(state, (spots) => spots.filter((spot) => spot.id !== toSpot(action.spot).id));
        case CLEAR_DAY:
            return updateActiveDay(state, () => []);
        case RESTORE_DAY:
            return restoreDayInState(state, action.dayIndex, action.spots);
        case MOVE_SPOT:
            return updateActiveDay(state, (spots) => moveInList(spots, action.index, action.offset));
        case REORDER_SPOT:
            return updateActiveDay(state, (spots) => reorderInList(spots, action.from, action.to));
        case REORDER_DAY:
            return reorderDayInState(state, action.dayIndex, action.ids);
        case SET_DAY_COUNT:
            return resizeDays(state, action.dayCount);
        case SET_ACTIVE_DAY:
            return withDerived({ ...state, activeDay: action.dayIndex });
        case REPLACE_SPOTS:
            return replaceData(state, action.data);
        case UPDATE_SPOT_TAGS:
            return withDerived(withSpotTags(state, action.spotId, action.tags));
        case REPLACE_DAYS:
            return withDerived({ ...state, days: action.days, activeDay: Math.min(state.activeDay, action.days.length - 1) });
        case LOAD_DAYS:
            return withDerived({ ...state, days: action.days.map((spots) => spots.map(toSpot)), activeDay: 0 });
        default:
            return state;
    }
}
