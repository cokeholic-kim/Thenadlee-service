import axios from 'axios';
import { API_URL } from '../config/apiurl';

// 고객 문의 API. 응답 공통 형식 { result, body } 에서 body 만 꺼내서 반환
const unwrap = (response) => response.data.body;

export const createInquiry = (form) => axios.post(`${API_URL}/inquiries`, form).then(unwrap);

export const fetchMyInquiries = () => axios.get(`${API_URL}/inquiries/mine`).then(unwrap);

export const fetchInquirySummary = () => axios.get(`${API_URL}/inquiries/summary`).then(unwrap);

export const deleteInquiry = (id) => axios.post(`${API_URL}/inquiries/${id}/delete`).then(unwrap);

// 관리자 (ADMIN)
export const fetchAdminInquiries = (status) => axios.get(`${API_URL}/admin/inquiries`, { params: { status } }).then(unwrap);

export const answerInquiry = (id, answer) => axios.post(`${API_URL}/admin/inquiries/${id}/answer`, { answer }).then(unwrap);

export const deleteAdminInquiry = (id) => axios.post(`${API_URL}/admin/inquiries/${id}/delete`).then(unwrap);
