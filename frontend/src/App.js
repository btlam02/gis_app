import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/users/RegisterPage';
import LoginPage from './pages/users/LoginPage';
import DashboardPage from './pages/users/AdminDashboard';
import HomePage from './pages/home/HomePage';
import Navbar from 'components/Navbar';
import BridgeListPage from 'pages/home/BridgeList';

function App() { 
  return (
    <div className='flex flex-col h-screen w-full'> 
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/list_bridges" element={<BridgeListPage/>}/>
        <Route path="/dashboard" element={<DashboardPage />}/>
        <Route path="/" element={<HomePage />}/>
      </Routes>
    </Router>
    </div>
  );
}

export default App;
