import axios from 'axios';
import { API_URL } from '../config/apiurl';

// 메인 화면 여행지 목록 (공개된 여행지만)
export const fetchCities = () =>
    axios.get(`${API_URL}/cities`).then((response) => response.data.body);
