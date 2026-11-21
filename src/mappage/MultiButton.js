import html2canvas from 'html2canvas';
import React from 'react';
import { FaBookOpen, FaImage, FaRegSave, FaRoute } from 'react-icons/fa';
import { toast, toastError } from '../ui/feedback';
import { trackEvent } from '../analytics/analytics';
import './MultiButton.scss';

const IMAGE_FILE_NAME = 'thenadlee-plan.png';

const downloadDataUrl = (uri, filename) => {
    const link = document.createElement('a');
    link.href = uri;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// 지도 화면 전체를 그림 파일로 저장
const saveScreenImage = async () => {
    try {
        const canvas = await html2canvas(document.getElementsByClassName('App')[0], { useCORS: true });
        downloadDataUrl(canvas.toDataURL('image/png'), IMAGE_FILE_NAME);
        toast('일정 화면을 그림 파일로 저장했어요.');
    } catch (error) {
        toastError('그림 파일로 저장하지 못했어요. 다시 시도해 주세요.');
    }
};

const SubButton = ({ icon, label, onClick }) => (
    <button type="button" className="map-toolbar__sub" onClick={onClick} aria-label={label} title={label}>{icon}<span>{label}</span></button>
);

// 지도 위 도구: "일정 저장"이 주 버튼, 나머지는 작은 보조 버튼 (휴대폰은 저장 버튼이 화면 아래 오른쪽에 떠 있음)
const MultiButton = ({ setBlog, setRecommend, setSaving }) => (
    <div className="map-toolbar">
        <button type="button" className="map-toolbar__save" onClick={() => { trackEvent('open_save'); setSaving(true); }}>
            <FaRegSave aria-hidden="true" /><span>일정 저장</span>
        </button>
        <div className="map-toolbar__subs">
            <SubButton icon={<FaRoute aria-hidden="true" />} label="추천 일정" onClick={() => setRecommend(true)} />
            <SubButton icon={<FaBookOpen aria-hidden="true" />} label="여행기" onClick={() => setBlog(true)} />
            <SubButton icon={<FaImage aria-hidden="true" />} label="그림으로 저장" onClick={saveScreenImage} />
        </div>
    </div>
);

export default MultiButton;
