import axios from 'axios';
import { API_URL } from '../config/apiurl';

// 모임 API. 변경 요청은 바뀐 모임 상세를 돌려줌. 응답 공통 형식에서 body 만 반환
const unwrap = (response) => response.data.body;
const get = (path) => axios.get(`${API_URL}${path}`).then(unwrap);
const post = (path, body) => axios.post(`${API_URL}${path}`, body).then(unwrap);

export const groupApi = {
    mine: () => get('/groups/mine'),
    create: (name) => post('/groups', { name }),
    detail: (id) => get(`/groups/${id}`),
    rename: (id, name) => post(`/groups/${id}`, { name }),
    remove: (id) => post(`/groups/${id}/delete`),

    createInvite: (id) => post(`/groups/${id}/invite`),
    disableInvite: (id) => post(`/groups/${id}/invite/delete`),
    previewInvite: (token) => get(`/invites/${token}`),
    join: (token) => post(`/invites/${token}/join`),
    leave: (id) => post(`/groups/${id}/leave`),
    kick: (id, memberId) => post(`/groups/${id}/members/${memberId}/delete`),
    transferOwner: (id, memberId) => post(`/groups/${id}/members/${memberId}/owner`),

    addCandidate: (id, cityId) => post(`/groups/${id}/cities`, { cityId }),
    voteCandidate: (id, candidateId) => post(`/groups/${id}/cities/${candidateId}/vote`),
    removeCandidate: (id, candidateId) => post(`/groups/${id}/cities/${candidateId}/delete`),
    confirm: (id, plan) => post(`/groups/${id}/confirm`, plan),
    setAvailability: (id, dates) => post(`/groups/${id}/availability`, { dates }),

    addWish: (id, spotId, memo) => post(`/groups/${id}/wishes`, { spotId, memo }),
    voteWish: (id, wishId, voted) => post(`/groups/${id}/wishes/${wishId}/vote`, { voted }),
    removeWish: (id, wishId) => post(`/groups/${id}/wishes/${wishId}/delete`),
    linkPlan: (id, itineraryId) => post(`/groups/${id}/plan`, { itineraryId }),
    unlinkPlan: (id) => post(`/groups/${id}/plan/delete`),

    // 확정 동선 장소별 댓글: 모두 장소별 댓글 전체를 돌려줌
    planComments: (id) => get(`/groups/${id}/plan/comments`),
    addPlanComment: (id, spotId, content) => post(`/groups/${id}/plan/comments`, { spotId, content }),
    deletePlanComment: (id, commentId) => post(`/groups/${id}/plan/comments/${commentId}/delete`),

    // 추억: 사진 API 는 앨범 전체를 돌려줌. 사진은 비공개 저장이라 imageUrl 도 멤버 확인 API 주소
    album: (id) => get(`/groups/${id}/photos`),
    addPhoto: (id, file, photo) => {
        const formData = new FormData();
        formData.append('image', file);
        Object.entries(photo).forEach(([key, value]) => value !== null && value !== '' && formData.append(key, value));
        return post(`/groups/${id}/photos`, formData);
    },
    updatePhoto: (id, photoId, photo) => post(`/groups/${id}/photos/${photoId}`, photo),
    deletePhoto: (id, photoId) => post(`/groups/${id}/photos/${photoId}/delete`),
    featurePhoto: (id, photoId, featured) => post(`/groups/${id}/photos/${photoId}/featured`, { featured }),
    summary: (id) => get(`/groups/${id}/summary`),

    // 정산: 지출·송금 API 는 정산 탭 전체, 참여자 API 는 모임 상세를 돌려줌
    expenses: (id) => get(`/groups/${id}/expenses`),
    createExpense: (id, expense) => post(`/groups/${id}/expenses`, expense),
    updateExpense: (id, expenseId, expense) => post(`/groups/${id}/expenses/${expenseId}`, expense),
    deleteExpense: (id, expenseId) => post(`/groups/${id}/expenses/${expenseId}/delete`),
    settle: (id, fromMemberId, toMemberId, amountKrw) => post(`/groups/${id}/settlements`, { fromMemberId, toMemberId, amountKrw }),
    unsettle: (id, settlementId) => post(`/groups/${id}/settlements/${settlementId}/delete`),
    addGuest: (id, name) => post(`/groups/${id}/guests`, { name }),
    deleteGuest: (id, guestId) => post(`/groups/${id}/guests/${guestId}/delete`),
    claimGuest: (id, guestId) => post(`/groups/${id}/guests/${guestId}/claim`),
};
