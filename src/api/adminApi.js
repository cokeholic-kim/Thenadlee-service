import axios from 'axios';
import { API_URL } from '../config/apiurl';

// 관리자 화면 API (에디터 이상, 회원 관리는 관리자만). 응답 공통 형식에서 body 만 반환
const unwrap = (response) => response.data.body;
const get = (path, params) => axios.get(`${API_URL}/admin${path}`, { params }).then(unwrap);
const post = (path, body) => axios.post(`${API_URL}/admin${path}`, body).then(unwrap);

export const adminApi = {
    listCities: () => get('/cities'),
    getCity: (id) => get(`/cities/${id}`),
    createCity: (form) => post('/cities', form),
    updateCity: (id, form) => post(`/cities/${id}`, form),
    deleteCity: (id) => post(`/cities/${id}/delete`),

    addSpot: (cityId, form) => post(`/cities/${cityId}/spots`, form),
    updateSpot: (spotId, form) => post(`/spots/${spotId}`, form),
    deleteSpot: (spotId) => post(`/spots/${spotId}/delete`),
    changeSpotStatus: (spotId, status) => post(`/spots/${spotId}/status`, { status }),

    searchTour: (cityId, params) => get(`/cities/${cityId}/tour`, params),
    importTour: (cityId, contentId) => post(`/cities/${cityId}/tour/import`, { contentId }),

    listReports: () => get('/reports'),
    resolveReport: (targetType, targetId, action) => post('/reports/resolve', { targetType, targetId, action }),

    addPost: (cityId, postUrl) => post(`/cities/${cityId}/posts`, { postUrl }),
    deletePost: (postId) => post(`/posts/${postId}/delete`),

    listItineraries: (status) => get('/itineraries', { status }),
    changeItineraryStatus: (id, status) => post(`/itineraries/${id}/status`, { status }),
    changeItineraryFeatured: (id, featured) => post(`/itineraries/${id}/featured`, { featured }),

    searchUsers: (q) => get('/users', { q }),
    changeUserRole: (id, role) => post(`/users/${id}/role`, { role }),

    uploadImage: (file) => {
        const formData = new FormData();
        formData.append('image', file);
        return post('/uploads', formData);
    },
};
