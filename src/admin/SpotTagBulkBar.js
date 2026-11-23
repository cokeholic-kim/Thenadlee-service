import React, { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../api/adminApi';
import { fetchTagSuggestions } from '../api/communityApi';
import { toast } from '../ui/feedback';

/** 목록에서 고른 장소 (지금 보이는 장소만 남김: 거르기를 바꾸거나 태그를 달아 목록에서 빠지면 선택도 풀림) */
export const useSpotSelection = (visibleSpots) => {
    const [picked, setPicked] = useState(() => new Set());
    const selectedIds = useMemo(() => visibleSpots.map((spot) => spot.id).filter((id) => picked.has(id)), [visibleSpots, picked]);
    const toggle = (id) => setPicked((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
    const allSelected = visibleSpots.length > 0 && selectedIds.length === visibleSpots.length;
    const toggleAll = () => setPicked(allSelected ? new Set() : new Set(visibleSpots.map((spot) => spot.id)));
    const clear = () => setPicked(new Set());
    return { selectedIds, isSelected: (id) => picked.has(id), toggle, allSelected, toggleAll, clear };
};

// 고를 수 있는 태그: 공식·많이 쓴 태그 (새 태그는 장소 하나에 먼저 달면 목록에 나옴)
const useTagOptions = () => {
    const [options, setOptions] = useState([]);
    useEffect(() => { fetchTagSuggestions('').then(setOptions).catch(() => setOptions([])); }, []);
    return options;
};

const useBulkTag = (cityId, selection, run, options) => {
    const [picked, setTag] = useState('');
    const tag = picked || options[0]?.key || '';
    const tagLabel = (key) => options.find((option) => option.key === key)?.name || key;
    const apply = async (action) => {
        const count = selection.selectedIds.length;
        const result = await run(() => adminApi.changeSpotTags(cityId, { spotIds: selection.selectedIds, tag, action }));
        if (!result) return;
        selection.clear();
        toast(`${count}곳에서 "${tagLabel(tag)}" 태그를 ${action === 'ADD' ? '달았어요' : '뺐어요'}.`);
    };
    return { tag, setTag, apply, options };
};

// 고른 장소에 해시태그를 한 번에 달기·빼기 (에디터 이상, 서버가 그 여행지 장소인지 다시 확인)
const SpotTagBulkBar = ({ cityId, selection, run, visibleCount }) => {
    const bulk = useBulkTag(cityId, selection, run, useTagOptions());
    const none = selection.selectedIds.length === 0 || !bulk.tag;
    return (
        <div className="admin-bulk" role="group" aria-label="해시태그 한 번에 바꾸기">
            <label className="admin-check"><input type="checkbox" checked={selection.allSelected} disabled={visibleCount === 0} onChange={selection.toggleAll} /> 보이는 장소 모두 고르기</label>
            <span className="admin-bulk__count">{selection.selectedIds.length}곳 고름</span>
            <select value={bulk.tag} aria-label="바꿀 해시태그" onChange={(e) => bulk.setTag(e.target.value)}>
                {bulk.options.map((option) => <option key={option.key} value={option.key}>{option.icon ? `${option.icon} ` : ''}#{option.name}</option>)}
            </select>
            <button type="button" className="admin-button is-primary" disabled={none} onClick={() => bulk.apply('ADD')}>태그 달기</button>
            <button type="button" className="admin-button" disabled={none} onClick={() => bulk.apply('REMOVE')}>태그 빼기</button>
        </div>
    );
};

export default SpotTagBulkBar;
