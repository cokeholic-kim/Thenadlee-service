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
    // 해시태그 한 번에 달기·빼기 { spotIds, tag: 태그 key, action: ADD|REMOVE }
    changeSpotTags: (cityId, body) => post(`/cities/${cityId}/spots/tags`, body),
    // 해시태그 관리: 목록·수정({name, icon, pageTitle, official})·숨기기(status ACTIVE|HIDDEN), 바뀐 뒤 전체 목록을 돌려줌
    listTags: () => get('/tags'),
    updateTag: (tagId, form) => post(`/tags/${tagId}`, form),
    changeTagStatus: (tagId, status) => post(`/tags/${tagId}/status`, { status }),

    // 장소 영상·후기 큐레이션: 고정(pin)·숨김(hide)·해제(unpick)·다시 검색(refresh)
    listSpotMedia: (spotId) => get(`/spots/${spotId}/media`),
    pickSpotMedia: (spotId, action, item) => post(`/spots/${spotId}/media/${action}`, item),
    unpickSpotMedia: (spotId, url) => post(`/spots/${spotId}/media/unpick`, { url }),
    refreshSpotMedia: (spotId) => post(`/spots/${spotId}/media/refresh`),
    // 도시 영상 구역: { section: 'POPULAR' } 또는 { section: 'FESTIVAL', month }
    listCityMedia: (cityId, section) => get(`/cities/${cityId}/media`, section),
    pickCityMedia: (cityId, section, action, item) => post(`/cities/${cityId}/media/${action}`, { ...section, ...item }),
    unpickCityMedia: (cityId, section, url) => post(`/cities/${cityId}/media/unpick`, { ...section, url }),
    refreshCityMedia: (cityId, section) => post(`/cities/${cityId}/media/refresh`, section),

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
