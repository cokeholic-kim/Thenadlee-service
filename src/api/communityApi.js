import axios from 'axios';
import { API_URL } from '../config/apiurl';

// 여행자 공유 API (추천장소 등록, 공개 일정 좋아요, 신고, 사진 업로드). 응답 공통 형식에서 body 만 반환
const unwrap = (response) => response.data.body;

export const fetchSpots = (cityName) =>
    axios.get(`${API_URL}/place/spot/${cityName}`).then(unwrap);

export const createSpot = (cityName, form) =>
    axios.post(`${API_URL}/cities/${cityName}/spots`, form).then(unwrap);

export const updateSpot = (spotId, form) =>
    axios.post(`${API_URL}/spots/${spotId}`, form).then(unwrap);

export const deleteSpot = (spotId) =>
    axios.post(`${API_URL}/spots/${spotId}/delete`).then(unwrap);

export const fetchMySpots = () =>
    axios.get(`${API_URL}/spots/mine`).then(unwrap);

// 장소 상세의 영상·블로그 후기·인스타그램 해시태그 링크 (서버가 카카오 검색 결과를 캐시해서 돌려줌)
export const fetchSpotMedia = (spotId) =>
    axios.get(`${API_URL}/spots/${spotId}/media`).then(unwrap);

export const fetchCityItineraries = (cityName) =>
    axios.get(`${API_URL}/cities/${cityName}/itineraries`).then(unwrap);

export const changeItineraryLike = (itineraryId, liked) =>
    axios.post(`${API_URL}/itineraries/${itineraryId}/like`, { liked }).then(unwrap);

export const sendReport = (report) =>
    axios.post(`${API_URL}/reports`, report).then(unwrap);

export const uploadPhoto = (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return axios.post(`${API_URL}/uploads`, formData).then(unwrap);
};
