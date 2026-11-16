import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Main from './pages/Main';
import LogIn from './loginmodule/LogIn';
import Map from './mappage/Map.js';
import JoinPage from './loginmodule/JoinPage';
import FindPass from './loginmodule/FindPass';
import MyPage from './pages/MyPage';
import PrivacyPolicy from './pages/policy/PrivacyPolicy';
import Terms from './pages/policy/Terms';
import NotFound from './pages/NotFound';
import AdminCityList from './admin/AdminCityList';
import AdminCityEdit from './admin/AdminCityEdit';
import AdminItineraries from './admin/AdminItineraries';
import AdminUsers from './admin/AdminUsers';
import AdminReports from './admin/AdminReports';


function App() {
  return (
    <div className="App">
        <Routes>
          <Route path="/" element={<Main/>}/>
          <Route path="/login" element={<LogIn/>}/>
          <Route path="/map/:places" element={<Map/>}/>
          <Route path="/join" element={<JoinPage/>}/>
          <Route path="/findPass" element={<FindPass/>}/>
          <Route path="/mypage" element={<MyPage/>}/>
          <Route path="/privacy" element={<PrivacyPolicy/>}/>
          <Route path="/terms" element={<Terms/>}/>
          <Route path="/admin" element={<Navigate to="/admin/cities" replace/>}/>
          <Route path="/admin/cities" element={<AdminCityList/>}/>
          <Route path="/admin/cities/:id" element={<AdminCityEdit/>}/>
          <Route path="/admin/itineraries" element={<AdminItineraries/>}/>
          <Route path="/admin/users" element={<AdminUsers/>}/>
          <Route path="/admin/reports" element={<AdminReports/>}/>
          <Route path="*" element={<NotFound/>}/>
        </Routes>
    </div>
  );
}

export default App;
