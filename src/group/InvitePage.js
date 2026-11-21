import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { groupApi } from '../api/groupApi';
import PageLayout from '../components/PageLayout';
import usePageMeta from '../seo/usePageMeta';
import { getApiErrorMessage } from '../util/apiError';
import './Group.scss';
import { toastError } from '../ui/feedback';

const JoinBox = ({ preview, token }) => {
    const navigate = useNavigate();
    const isLogin = useSelector((state) => state.logincheck.isLogin);
    const join = async () => {
        try {
            navigate(`/groups/${(await groupApi.join(token)).groupId}`, { replace: true });
        } catch (error) {
            toastError(getApiErrorMessage(error));
        }
    };
    if (preview.isMember) return <Link className="group-button is-primary" to={`/groups/${preview.groupId}`}>모임으로 가기</Link>;
    if (!isLogin) return <Link className="group-button is-primary" to={`/login?next=/invite/${token}`}>로그인하고 참여하기</Link>;
    return <button type="button" className="group-button is-primary" onClick={join}>모임 참여하기</button>;
};

// 초대 링크로 들어온 화면: 모임 확인 → 로그인 → 참여 (모임 안에서는 닉네임만 공개됨)
const InvitePage = () => {
    const { token } = useParams();
    usePageMeta({ title: '모임 초대', path: '/invite', noindex: true });
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState(null);
    useEffect(() => { groupApi.previewInvite(token).then(setPreview).catch((err) => setError(getApiErrorMessage(err))); }, [token]);
    return (
        <PageLayout>
            <div className="group-page group-page--narrow">
                <h1>모임 초대</h1>
                {error && <p className="group-empty">{error}</p>}
                {preview && (
                    <section className="group-section">
                        <h2>{preview.groupName}</h2>
                        <p className="group-hint">{preview.ownerNickName}님이 만든 모임 · 멤버 {preview.memberCount}명</p>
                        <p className="group-hint">참여하면 모임 멤버에게 내 닉네임이 보이고, 함께 여행지·날짜·장소를 정할 수 있어요.</p>
                        <JoinBox preview={preview} token={token} />
                    </section>
                )}
            </div>
        </PageLayout>
    );
};

export default InvitePage;
