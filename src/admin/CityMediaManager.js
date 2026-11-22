import React, { useEffect, useState } from 'react';
import { adminApi } from '../api/adminApi';
import { getApiErrorMessage } from '../util/apiError';
import { toastError } from '../ui/feedback';
import { AddForm, MediaItemList } from './SpotMediaManager';

const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);
const POPULAR = { section: 'POPULAR' };

// 화면에 실제로 보이는 영상 표시: 숨기지 않은 것 중 앞에서부터 limit 개 (고정한 것이 맨 앞)
const markShown = (items, limit) => {
    let shown = 0;
    return items.map((item) => {
        const visible = !item.hidden && shown < limit;
        if (visible) shown += 1;
        return { ...item, shown: visible };
    });
};

const SectionPicker = ({ section, onChange }) => (
    <div className="admin-form__row">
        <label>구역
            <select value={section.section === 'POPULAR' ? 'POPULAR' : String(section.month)}
                onChange={(e) => onChange(e.target.value === 'POPULAR' ? POPULAR : { section: 'FESTIVAL', month: Number(e.target.value) })}>
                <option value="POPULAR">인기 여행 영상</option>
                {MONTHS.map((month) => <option key={month} value={month}>{month}월 축제·행사 영상</option>)}
            </select>
        </label>
    </div>
);

const useCityMedia = (cityId, section) => {
    const [media, setMedia] = useState(null);
    const run = async (action) => {
        try { setMedia(await action()); return true; } catch (error) { toastError(getApiErrorMessage(error)); return false; }
    };
    useEffect(() => { setMedia(null); run(() => adminApi.listCityMedia(cityId, section)); }, [cityId, section]); // eslint-disable-line react-hooks/exhaustive-deps
    const handlers = {
        onPick: (action, item) => run(() => adminApi.pickCityMedia(cityId, section, action, { ...item, kind: 'VIDEO' })),
        onUnpick: (url) => run(() => adminApi.unpickCityMedia(cityId, section, url)),
    };
    return { media, handlers, refresh: () => run(() => adminApi.refreshCityMedia(cityId, section)) };
};

// 지도 화면 "여행 tip"의 도시 영상 큐레이션: 구역(인기 / 월별 축제)마다 엉뚱한 영상은 숨기고 좋은 영상은 고정 (에디터 이상)
const CityMediaManager = ({ cityId }) => {
    const [section, setSection] = useState(POPULAR);
    const { media, handlers, refresh } = useCityMedia(cityId, section);
    return (
        <section className="admin-section">
            <h2>도시 영상</h2>
            <p className="admin__hint">지도 화면 "여행 tip"의 영상 버튼에서 보이는 영상이에요. 검색 결과라 엉뚱한 영상이 섞이면 숨기고, 좋은 영상은 고정해 맨 앞에 보여 주세요. 구역마다 따로 적용돼요.</p>
            <SectionPicker section={section} onChange={setSection} />
            {!media && <p className="admin-media__empty">영상을 불러오는 중…</p>}
            {media && (
                <div className="admin-media">
                    <div className="admin-media__head">
                        <span>{media.available ? `검색: ${media.source}` : '지금은 검색할 수 없어요 (키·하루 상한 확인)'}</span>
                        <button type="button" className="admin-button" onClick={refresh}>다시 검색</button>
                    </div>
                    <MediaItemList title={section.section === 'POPULAR' ? '인기 여행 영상' : `${section.month}월 축제·행사 영상`} items={markShown(media.items, media.limit)} {...handlers} />
                    <AddForm onPick={handlers.onPick} kinds={['VIDEO']} />
                </div>
            )}
        </section>
    );
};

export default CityMediaManager;
