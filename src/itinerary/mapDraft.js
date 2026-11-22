// 지도 화면에서 담던 일정(일차별 장소·기간·이동수단)을 이 탭 안에서만 임시로 보관
// 로그인하러 갔다 오거나 로그인 시간이 지나 다시 들어와도 담아 둔 장소가 사라지지 않게 함
// (sessionStorage: 탭을 닫으면 지워지고 서버로 보내지 않음)
const STORAGE_KEY = 'thenadlee.mapDraft';
// 너무 오래된 임시 일정은 버림
const MAX_AGE_MS = 6 * 60 * 60 * 1000;

const read = () => {
    try {
        return JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || 'null');
    } catch (error) {
        return null;
    }
};

const write = (value) => {
    try {
        if (value) window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
        else window.sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        // 저장소를 쓸 수 없는 브라우저(사생활 보호 모드 등)는 임시 보관 없이 동작
    }
};

const hasSpots = (draft) => draft.days.some((spots) => spots.length > 0);

// 추천 목록 종류 필터(?category=)는 같은 일정으로 봄 (?itinerary·?group 만 구분)
const IGNORED_PARAMS = ['category'];
const draftScope = (search) => {
    const params = new URLSearchParams(search);
    IGNORED_PARAMS.forEach((name) => params.delete(name));
    params.sort();
    return params.toString();
};

/** 같은 화면 주소(도시 + ?itinerary·?group)일 때만 담아 둔 일정을 돌려줌 */
export const readMapDraft = (cityName, search) => {
    const draft = read();
    if (!draft || draft.cityName !== cityName || draft.search !== draftScope(search)) return null;
    if (Date.now() - draft.savedAt > MAX_AGE_MS || !hasSpots(draft)) return null;
    return draft;
};

export const saveMapDraft = ({ cityName, search: rawSearch, days, itinerary }) => {
    const search = draftScope(rawSearch);
    const previous = read();
    const resumeSave = previous?.cityName === cityName && previous?.search === search && Boolean(previous?.resumeSave);
    write({ cityName, search, days, itinerary, resumeSave, savedAt: Date.now() });
};

/** 저장하려다 로그인하러 가는 경우: 돌아오면 저장 창을 다시 열도록 표시 */
export const markResumeSave = () => {
    const draft = read();
    if (draft) write({ ...draft, resumeSave: true });
};

/** 돌아와서 저장 창을 열었으면 표시를 지움 (한 번만 열림) */
export const consumeResumeSave = () => {
    const draft = read();
    if (!draft?.resumeSave) return false;
    write({ ...draft, resumeSave: false });
    return true;
};

export const clearMapDraft = () => write(null);
