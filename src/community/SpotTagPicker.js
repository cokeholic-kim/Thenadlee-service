import React from 'react';
import { SPOT_TAGS } from './spotTags';
import './SpotTagPicker.scss';

/** 상황 태그 고르기 (여러 개, 선택 사항): 장소 등록·관리자 편집 공용 */
const SpotTagPicker = ({ value = [], onChange }) => {
    const toggle = (tag) => onChange(value.includes(tag) ? value.filter((item) => item !== tag) : [...value, tag]);
    return (
        <div className="spot-tag-picker" role="group" aria-label="상황 태그">
            {SPOT_TAGS.map((tag) => (
                <label key={tag.value} className={value.includes(tag.value) ? 'is-checked' : ''}>
                    <input type="checkbox" checked={value.includes(tag.value)} onChange={() => toggle(tag.value)} />
                    {tag.icon} {tag.label}
                </label>
            ))}
        </div>
    );
};

export default SpotTagPicker;
