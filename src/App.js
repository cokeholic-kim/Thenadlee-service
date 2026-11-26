import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Main from './pages/Main';
import NotFound from './pages/NotFound';
import FeedbackHost from './ui/FeedbackHost';
import usePageTracking from './analytics/usePageTracking';

// 첫 화면(메인)만 바로 불러오고, 나머지 화면은 들어갈 때 불러옴 (첫 로딩 JS 크기를 줄여 검색엔진 속도 평가 개선)
const LogIn = lazy(() => import('./loginmodule/LogIn'));
const Map = lazy(() => import('./mappage/Map.js'));
const JoinPage = lazy(() => import('./loginmodule/JoinPage'));
const FindPass = lazy(() => import('./loginmodule/FindPass'));
const MyPage = lazy(() => import('./pages/MyPage'));
const MyItinerariesPage = lazy(() => import('./pages/MyItinerariesPage'));
const InquiryPage = lazy(() => import('./inquiry/InquiryPage'));
const AdminInquiries = lazy(() => import('./admin/AdminInquiries'));
const PrivacyPolicy = lazy(() => import('./pages/policy/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/policy/Terms'));
const ItineraryPage = lazy(() => import('./pages/ItineraryPage'));
const ExplorePage = lazy(() => import('./explore/ExplorePage'));
const SettleCalculatorPage = lazy(() => import('./settle/SettleCalculatorPage'));
const SpotCategoryPage = lazy(() => import('./spots/SpotCategoryPage'));
const GroupList = lazy(() => import('./group/GroupList'));
const GroupDetail = lazy(() => import('./group/GroupDetail'));
const InvitePage = lazy(() => import('./group/InvitePage'));
const AdminCityList = lazy(() => import('./admin/AdminCityList'));
const AdminCityEdit = lazy(() => import('./admin/AdminCityEdit'));
const AdminItineraries = lazy(() => import('./admin/AdminItineraries'));
const AdminUsers = lazy(() => import('./admin/AdminUsers'));
const AdminReports = lazy(() => import('./admin/AdminReports'));
const AdminTags = lazy(() => import('./admin/AdminTags'));
const AdminActivity = lazy(() => import('./admin/AdminActivity'));
const EditorListPage = lazy(() => import('./editor/EditorListPage'));
const CityGuidePage = lazy(() => import('./guide/CityGuidePage'));
const EditorProfilePage = lazy(() => import('./editor/EditorProfilePage'));
const AdminEditorProfile = lazy(() => import('./admin/AdminEditorProfile'));

function App() {
  usePageTracking();
  return (
    <div className="App">
      <FeedbackHost/>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Main/>}/>
          <Route path="/login" element={<LogIn/>}/>
          <Route path="/map/:places" element={<Map/>}/>
          <Route path="/join" element={<JoinPage/>}/>
          <Route path="/findPass" element={<FindPass/>}/>
          <Route path="/mypage" element={<MyPage/>}/>
          <Route path="/itineraries" element={<MyItinerariesPage/>}/>
          <Route path="/inquiries" element={<InquiryPage/>}/>
          <Route path="/privacy" element={<PrivacyPolicy/>}/>
          <Route path="/terms" element={<Terms/>}/>
          <Route path="/itinerary/:id" element={<ItineraryPage/>}/>
          <Route path="/explore" element={<ExplorePage/>}/>
          <Route path="/settle" element={<SettleCalculatorPage/>}/>
          <Route path="/spots/:city/:category" element={<SpotCategoryPage/>}/>
          <Route path="/groups" element={<GroupList/>}/>
          <Route path="/groups/:id" element={<GroupDetail/>}/>
          <Route path="/invite/:token" element={<InvitePage/>}/>
          <Route path="/admin" element={<Navigate to="/admin/cities" replace/>}/>
          <Route path="/admin/cities" element={<AdminCityList/>}/>
          <Route path="/admin/cities/:id" element={<AdminCityEdit/>}/>
          <Route path="/admin/itineraries" element={<AdminItineraries/>}/>
          <Route path="/admin/users" element={<AdminUsers/>}/>
          <Route path="/admin/reports" element={<AdminReports/>}/>
          <Route path="/admin/tags" element={<AdminTags/>}/>
          <Route path="/admin/activity" element={<AdminActivity/>}/>
          <Route path="/editors" element={<EditorListPage/>}/>
          <Route path="/guide/:city/:month" element={<CityGuidePage/>}/>
          <Route path="/editors/:id" element={<EditorProfilePage/>}/>
          <Route path="/admin/profile" element={<AdminEditorProfile/>}/>
          <Route path="/admin/inquiries" element={<AdminInquiries/>}/>
          <Route path="*" element={<NotFound/>}/>
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
