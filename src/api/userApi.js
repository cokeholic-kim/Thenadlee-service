import axios from 'axios';
import { API_URL } from '../config/apiurl';

// 회원 API. 응답 공통 형식 { result, body } 에서 body 만 꺼내서 반환
const unwrap = (response) => response.data.body;

export const checkLoginId = (loginId) =>
    axios.get(`${API_URL}/checkLoginId`, { params: { loginId } }).then(unwrap);

export const join = (form) =>
    axios.post(`${API_URL}/join`, form).then(unwrap);

export const login = (form) =>
    axios.post(`${API_URL}/login`, form).then(unwrap);

export const logout = () =>
    axios.post(`${API_URL}/logout`).then(unwrap);

export const fetchMe = () =>
    axios.get(`${API_URL}/me`).then(unwrap);

export const resetPassword = (form) =>
    axios.post(`${API_URL}/resetPassword`, form).then(unwrap);

export const withdraw = (password) =>
    axios.post(`${API_URL}/withdraw`, { password }).then(unwrap);
