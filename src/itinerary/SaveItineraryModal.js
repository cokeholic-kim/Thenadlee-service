import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { createItinerary, updateItinerary } from '../api/itineraryApi';
import { setItineraryInfo } from '../modules/itinerary';
import { getApiErrorMessage } from '../util/apiError';
import { VISIBILITY_OPTIONS, buildItineraryPayload, countSpots, defaultTitle } from './itineraryPayload';
import './SaveItineraryModal.scss';

const ModalFrame = ({ title, onClose, children }) => (
    <div className="save-itinerary" role="dialog" aria-modal="true" aria-label={title}>
        <div className="save-itinerary__box">
            <div className="save-itinerary__head">
                <h2>{title}</h2>
                <button type="button" className="save-itinerary__close" onClick={onClose} aria-label="닫기">×</button>
            </div>
            {children}
        </div>
    </div>
);

const SaveForm = ({ form, setForm, canUpdate, onSave }) => {
    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(canUpdate); }}>
            <label htmlFor="itineraryTitle">제목</label>
            <input id="itineraryTitle" name="title" value={form.title} onChange={onChange} maxLength="50" required />
            <label htmlFor="itineraryDescription">소개 (선택)</label>
            <textarea id="itineraryDescription" name="description" value={form.description} onChange={onChange} maxLength="500" rows="3" />
            <fieldset>
                <legend>공개 여부</legend>
                {VISIBILITY_OPTIONS.map((option) => (
                    <label key={option.value} className="save-itinerary__radio">
                        <input type="radio" name="visibility" value={option.value}
                            checked={form.visibility === option.value} onChange={onChange} />
                        {option.label}
                    </label>
                ))}
            </fieldset>
            <button type="submit" className="save-itinerary__primary">{canUpdate ? '수정 내용 저장' : '저장'}</button>
            {canUpdate && <button type="button" className="save-itinerary__secondary" onClick={() => onSave(false)}>새 일정으로 저장</button>}
        </form>
    );
};

// 작성자는 기존 일정을 수정, 다른 사람의 공개 일정을 열었으면 내 일정으로 새로 저장
const useSaveItinerary = (cityName, onClose) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const days = useSelector((state) => state.add.days);
    const itinerary = useSelector((state) => state.itinerary);
    return async (form, asUpdate) => {
        const payload = buildItineraryPayload({ cityName, days, itinerary, form });
        try {
            const saved = asUpdate ? await updateItinerary(itinerary.id, payload) : await createItinerary(payload);
            dispatch(setItineraryInfo({ id: saved.id, title: payload.title, description: payload.description, visibility: payload.visibility, isOwner: true }));
            navigate(`/map/${cityName}?itinerary=${saved.id}`, { replace: true });
            alert(saved.message);
            onClose();
        } catch (error) {
            alert(getApiErrorMessage(error));
        }
    };
};

const SaveItineraryModal = ({ cityName, onClose }) => {
    const { isLogin } = useSelector((state) => state.logincheck);
    const days = useSelector((state) => state.add.days);
    const itinerary = useSelector((state) => state.itinerary);
    const save = useSaveItinerary(cityName, onClose);
    const [form, setForm] = useState({
        title: itinerary.title || defaultTitle(cityName, days.length),
        description: itinerary.description || '',
        visibility: itinerary.visibility || 'PRIVATE',
    });

    if (!isLogin) {
        return (
            <ModalFrame title="일정 저장" onClose={onClose}>
                <p className="save-itinerary__message">일정을 저장하려면 로그인이 필요해요.</p>
                <Link to="/login" className="save-itinerary__primary">로그인하기</Link>
            </ModalFrame>
        );
    }
    if (countSpots(days) === 0) {
        return (
            <ModalFrame title="일정 저장" onClose={onClose}>
                <p className="save-itinerary__message">저장할 장소가 없어요. 장소를 1곳 이상 담아 주세요.</p>
            </ModalFrame>
        );
    }
    return (
        <ModalFrame title={itinerary.id && !itinerary.isOwner ? '내 일정으로 저장' : '일정 저장'} onClose={onClose}>
            <p className="save-itinerary__message">{days.length}일 · 장소 {countSpots(days)}곳</p>
            <SaveForm form={form} setForm={setForm} canUpdate={Boolean(itinerary.id && itinerary.isOwner)}
                onSave={(asUpdate) => save(form, asUpdate)} />
        </ModalFrame>
    );
};

export default SaveItineraryModal;
