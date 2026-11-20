import axios from 'axios';
import { API_URL } from '../config/apiurl';

// 일정 API. 응답 공통 형식 { result, body } 에서 body 만 꺼내서 반환
const unwrap = (response) => response.data.body;

export const createItinerary = (payload) =>
    axios.post(`${API_URL}/itineraries`, payload).then(unwrap);

export const updateItinerary = (id, payload) =>
    axios.post(`${API_URL}/itineraries/${id}`, payload).then(unwrap);

export const deleteItinerary = (id) =>
    axios.post(`${API_URL}/itineraries/${id}/delete`).then(unwrap);

export const fetchMyItineraries = () =>
    axios.get(`${API_URL}/itineraries/mine`).then(unwrap);

export const fetchItinerary = (id) =>
    axios.get(`${API_URL}/itineraries/${id}`).then(unwrap);

// 내 일정에 내 SNS 게시물 링크 붙이기·지우기 (작성자 본인만, 최신 링크 목록을 돌려줌)
export const addItineraryLink = (id, url) =>
    axios.post(`${API_URL}/itineraries/${id}/links`, { url }).then(unwrap);

export const removeItineraryLink = (id, linkId) =>
    axios.post(`${API_URL}/itineraries/${id}/links/${linkId}/delete`).then(unwrap);
