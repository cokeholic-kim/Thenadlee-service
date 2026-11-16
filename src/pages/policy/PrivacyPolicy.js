import React from 'react';
import PolicyLayout from './PolicyLayout';
import { CONTACT_EMAIL, SITE_NAME } from '../../config/site';
import usePageMeta from '../../seo/usePageMeta';
import { PAGE_META } from '../../seo/pageMeta';

export const POLICY_EFFECTIVE_DATE = '2026년 11월 17일';

const PrivacyPolicy = () => {
    usePageMeta(PAGE_META.privacy);
    return (
        <PolicyLayout title="개인정보처리방침" effectiveDate={POLICY_EFFECTIVE_DATE}>
            <p>{SITE_NAME}(이하 "서비스")는 회원 가입과 로그인에 꼭 필요한 최소한의 정보만 처리하며, 실명·이메일·연락처 등 개인을 직접 식별할 수 있는 정보는 수집하지 않습니다.</p>
            <h2>1. 처리하는 정보와 목적</h2>
            <div className="policy-table-wrap">
                <table>
                    <thead><tr><th>항목</th><th>목적</th><th>보유 기간</th></tr></thead>
                    <tbody>
                        <tr><td>아이디, 닉네임</td><td>회원 식별, 로그인, 화면 표시 (닉네임은 공개한 게시물에 함께 표시)</td><td rowSpan="4">회원 탈퇴 시 즉시 파기 (게시물은 작성자가 삭제할 때도 즉시 파기)</td></tr>
                        <tr><td>비밀번호, 복구 코드</td><td>로그인, 비밀번호 재설정 (일방향 암호화하여 원문 미보관)</td></tr>
                        <tr><td>게시물: 저장한 일정, 등록한 장소(이름·소개·위치·사진)</td><td>일정 저장, 여행자 추천 장소·추천 일정 공유</td></tr>
                        <tr><td>좋아요, 신고 기록(사유·내용)</td><td>추천 일정 정렬, 부적절한 게시물 처리 (신고한 회원은 작성자에게 공개하지 않음)</td></tr>
                    </tbody>
                </table>
            </div>
            <p>회원이 올린 사진은 서버에서 다시 저장하면서 촬영 위치·기기 정보(EXIF)를 지웁니다. 장소의 위치는 회원이 지도에서 직접 지정한 좌표만 저장하며, 이용자의 현재 위치는 수집하지 않습니다.</p>
            <p>로그인 상태 유지를 위해 세션 쿠키(THENADLEESESSID)를 사용하며, 로그인 후 1시간이 지나거나 로그아웃하면 만료됩니다. 회원가입 없이 이용하는 여행지 조회·일정 만들기 기능은 어떤 정보도 저장하지 않습니다.</p>
            <h2>2. 제3자 제공 및 처리 위탁</h2>
            <p>회원 정보를 제3자에게 제공하거나 처리를 위탁하지 않습니다. 지도(Google Maps)와 날씨(OpenWeatherMap) 기능은 이용자의 브라우저가 해당 서비스에 직접 요청하며, 서비스는 회원 정보를 전달하지 않습니다.</p>
            <h2>3. 파기 절차 및 방법</h2>
            <p>마이페이지에서 회원 탈퇴를 하면 회원 정보와 게시물, 좋아요·신고 기록이 데이터베이스에서 즉시 삭제되고, 올린 사진 파일도 서버에서 삭제되며 복구할 수 없습니다.</p>
            <h2>4. 이용자의 권리</h2>
            <p>이용자는 언제든지 마이페이지에서 자신의 정보를 확인하고 회원 탈퇴로 정보 삭제를 요청할 수 있습니다.</p>
            <h2>5. 안전성 확보 조치</h2>
            <p>비밀번호와 복구 코드는 일방향 암호화(해시)하여 저장하고, 모든 통신은 HTTPS 로 암호화합니다.</p>
            <h2>6. 문의처</h2>
            <p>개인정보 관련 문의: {CONTACT_EMAIL || '서비스 운영자'}</p>
        </PolicyLayout>
    );
};

export default PrivacyPolicy;
