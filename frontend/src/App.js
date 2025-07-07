import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/users/RegisterPage';
import LoginPage from './pages/users/LoginPage';
import DashboardPage from './pages/users/Dashboard';
import HomePage from './pages/home/HomePage';
import Navbar from 'components/Navbar';
import BridgeListPage from 'pages/home/BridgeList';

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() { 
  return (
    <div className='flex flex-col h-screen w-full'> 
    <ToastContainer position="top-center" autoClose={3000} />

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
