import React, { useEffect, useState } from 'react';
import { fetchTagSuggestions } from '../api/communityApi';
import './Hashtag.scss';

const SUGGEST_DELAY_MS = 250;
const NAME_MAX_LENGTH = 20;

// 입력 중인 글자에 맞는 기존 태그 (잠깐 멈췄을 때 한 번만 서버에 물어봄, 비면 공식·인기 태그)
const useSuggestions = (text, exclude) => {
    const [items, setItems] = useState([]);
    useEffect(() => {
        let alive = true;
        const timer = setTimeout(() => {
            fetchTagSuggestions(text.replace(/^#/, '')).then((list) => alive && setItems(list)).catch(() => alive && setItems([]));
        }, SUGGEST_DELAY_MS);
        return () => { alive = false; clearTimeout(timer); };
    }, [text]);
    return items.filter((item) => !exclude.includes(item.name));
};

/**
 * 해시태그 입력 (인스타그램처럼): 기존 태그를 고르거나 새 태그를 쳐서 Enter
 *   onAdd(name) 이 true 를 돌려주면 입력칸을 비움
 */
const HashtagInput = ({ onAdd, exclude = [], disabled = false, autoFocus = false }) => {
    const [text, setText] = useState('');
    const suggestions = useSuggestions(text, exclude);
    const submit = async (name) => {
        if (!name.replace(/[#\s]/g, '') || disabled) return;
        if (await onAdd(name)) setText('');
    };
    return (
        <div className="hashtag-input">
            <input value={text} maxLength={NAME_MAX_LENGTH + 1} placeholder="#태그 입력 후 Enter" aria-label="해시태그 입력" autoFocus={autoFocus} disabled={disabled}
                onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit(text); } }} />
            {suggestions.length > 0 && (
                <ul className="hashtag-input__suggestions" aria-label="추천 태그">
                    {suggestions.map((item) => (
                        <li key={item.key}><button type="button" disabled={disabled} onClick={() => submit(item.name)}>{item.icon ? `${item.icon} ` : ''}#{item.name}{item.usageCount > 0 && <span>{item.usageCount}</span>}</button></li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default HashtagInput;
