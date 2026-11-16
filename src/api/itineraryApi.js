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
