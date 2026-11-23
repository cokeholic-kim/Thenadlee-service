import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import { fetchEditors } from '../api/editorApi';
import usePageMeta from '../seo/usePageMeta';
import { PAGE_META } from '../seo/pageMeta';
import { editorPath } from './editorPaths';
import './Editor.scss';

const EditorCard = ({ editor }) => (
    <li className="editor-card">
        <Link to={editorPath(editor.id)}>
            <span className="editor-card__avatar" aria-hidden="true">{editor.nickName.slice(0, 1)}</span>
            <strong>에디터 {editor.nickName}</strong>
            {editor.cities.length > 0 && <span className="editor-card__cities">{editor.cities.map((city) => city.displayName).join(' · ')}</span>}
            {editor.intro && <p>{editor.intro}</p>}
            <span className="editor-card__count">소개한 장소 {editor.spotCount}곳</span>
        </Link>
    </li>
);

// 에디터 소개 (/editors): 프로필을 공개한 에디터만
const EditorListPage = () => {
    usePageMeta(PAGE_META.editors);
    const [editors, setEditors] = useState(null);
    useEffect(() => { fetchEditors().then(setEditors).catch(() => setEditors([])); }, []);
    return (
        <PageLayout>
            <div className="editor-page">
                <h1>더 나들이 에디터</h1>
                <p className="editor-page__intro">여행지를 잘 아는 에디터들이 장소를 고르고 소개를 다듬어요. 에디터가 소개한 장소에는 이름이 함께 보여요.</p>
                {editors === null && <p>불러오는 중…</p>}
                {editors?.length === 0 && <p className="editor-page__empty">아직 소개할 에디터가 없어요.</p>}
                {editors?.length > 0 && <ul className="editor-cards">{editors.map((editor) => <EditorCard key={editor.id} editor={editor} />)}</ul>}
                <p className="editor-page__recruit">여행지를 소개하고 싶다면 <Link to="/inquiries?topic=editor">에디터로 지원</Link>해 주세요.</p>
            </div>
        </PageLayout>
    );
};

export default EditorListPage;
