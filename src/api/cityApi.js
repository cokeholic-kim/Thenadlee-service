import axios from 'axios';
import { API_URL } from '../config/apiurl';

// 메인 화면 여행지 목록 (공개된 여행지만)
export const fetchCities = () =>
    axios.get(`${API_URL}/cities`).then((response) => response.data.body);

// 여행지 월별 여행 정보 [{ month, description }] (관리자가 입력한 달만)
export const fetchMonthInfo = (cityName) =>
    axios.get(`${API_URL}/place/month/${encodeURIComponent(cityName)}`).then((response) => response.data.body);
