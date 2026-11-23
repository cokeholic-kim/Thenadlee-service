import React from 'react';
import './Editor.scss';

// 에디터 활동 합계 (서버 EditorStatsResponse): 누가 담았는지는 없고 수만
const STAT_ITEMS = [
    { key: 'spotCount', label: '소개한 장소', unit: '곳' },
    { key: 'savedCount', label: '그 장소가 담긴 일정', unit: '개' },
    { key: 'publicItineraryCount', label: '공개 일정', unit: '개' },
    { key: 'likeCount', label: '받은 좋아요', unit: '개' },
    { key: 'copyCount', label: '내 일정으로 시작', unit: '번' },
];

const EditorStats = ({ stats }) => (
    <dl className="editor-stats">
        {STAT_ITEMS.map((item) => (
            <div key={item.key} className="editor-stats__item">
                <dt>{item.label}</dt>
                <dd><strong>{(stats?.[item.key] ?? 0).toLocaleString('ko-KR')}</strong>{item.unit}</dd>
            </div>
        ))}
    </dl>
);

export default EditorStats;
