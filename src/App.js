import { Route, Routes } from 'react-router-dom';
import './App.css';
import Main from './pages/Main';
import LogIn from './loginmodule/LogIn';
import Map from './mappage/Map.js';
import JoinPage from './loginmodule/JoinPage';
import FindPass from './loginmodule/FindPass';
import Guide from './pages/Guide';
import UpdatePass from './loginmodule/UpdatePass';


function App() {
  return (
    <div className="App">
        <Routes>
          <Route path="/" element={<Main/>}/>
          <Route path ="/login" element={<LogIn/>}/>
          <Route path="/map/:places" element={<Map/>}/>
          <Route path="/join" element={<JoinPage/>}/>
          <Route path="/findPass" element={<FindPass/>}/>
          <Route path="/guide" element={<Guide/>}/>
          <Route path="/updatePass" element={<UpdatePass/>}/>
        </Routes>
    </div>
  );
}

export default App;
