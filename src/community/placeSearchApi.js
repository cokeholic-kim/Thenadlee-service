import { MAP_PROVIDERS } from '../map/mapProvider';

// 장소 이름 검색: 국내(카카오맵)는 카카오 장소 검색, 해외(Google)는 Places API (New) 텍스트 검색
//   결과는 { id, name, address, position: { lat, lng } } 로 맞춤. 검색 버튼을 누를 때만 호출(글자마다 호출하지 않음)
const MAX_RESULTS = 5;
// Google 은 여행지 중심 반경 안을 먼저 보여 줌(그 밖도 나올 수 있음, 최대 50km)
const GOOGLE_BIAS_RADIUS_METERS = 50000;
const GOOGLE_FIELDS = ['id', 'displayName', 'location', 'formattedAddress'];
const SEARCH_LANGUAGE = 'ko';

// 카카오: 반경 제한(최대 20km)을 두면 제주처럼 넓은 여행지의 장소가 빠지므로 범위 없이 정확도순, 중심은 정렬 기준점으로만
const searchKakao = (keyword, center) => new Promise((resolve, reject) => {
    const { services, LatLng } = window.kakao.maps;
    new services.Places().keywordSearch(keyword, (data, status) => {
        if (status === services.Status.OK) return resolve(data.slice(0, MAX_RESULTS).map((place) => ({
            id: place.id, name: place.place_name, address: place.road_address_name || place.address_name,
            position: { lat: Number(place.y), lng: Number(place.x) },
        })));
        return status === services.Status.ZERO_RESULT ? resolve([]) : reject(new Error(status));
    }, { location: new LatLng(center.lat, center.lng) });
});

const searchGoogle = async (keyword, center) => {
    const { places } = await window.google.maps.places.Place.searchByText({
        textQuery: keyword, fields: GOOGLE_FIELDS, language: SEARCH_LANGUAGE, maxResultCount: MAX_RESULTS,
        locationBias: { center, radius: GOOGLE_BIAS_RADIUS_METERS },
    });
    return places.filter((place) => place.location).map((place) => ({
        id: place.id, name: place.displayName, address: place.formattedAddress,
        position: { lat: place.location.lat(), lng: place.location.lng() },
    }));
};

/** 검색 실패(키·API 설정 문제 등)는 예외로 넘김 → 화면에서 "지도를 눌러 정해 주세요" 안내 */
export const searchPlaces = (provider, keyword, center) => (provider === MAP_PROVIDERS.KAKAO ? searchKakao : searchGoogle)(keyword, center);
