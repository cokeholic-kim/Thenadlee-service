import axios from 'axios';
import { API_URL } from '../config/apiurl';

// 알림 API (로그인한 본인 알림만). 응답 공통 형식 { result, body } 에서 body 만 꺼내서 반환
const unwrap = (response) => response.data.body;

export const fetchNotifications = () => axios.get(`${API_URL}/notifications`).then(unwrap);

export const fetchNotificationSummary = () => axios.get(`${API_URL}/notifications/summary`).then(unwrap);

export const readAllNotifications = () => axios.post(`${API_URL}/notifications/read-all`).then(unwrap);
