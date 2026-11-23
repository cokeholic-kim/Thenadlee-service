import axios from 'axios';
import { API_URL } from '../config/apiurl';

// 에디터 소개 (누구나): 공개 프로필을 켠 에디터만
const unwrap = (response) => response.data.body;

export const fetchEditors = () => axios.get(`${API_URL}/editors`).then(unwrap);

export const fetchEditor = (profileId) => axios.get(`${API_URL}/editors/${encodeURIComponent(profileId)}`).then(unwrap);
