import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/users/RegisterPage';
import LoginPage from './pages/users/LoginPage';
import DashboardPage from './pages/users/Dashboard';
import HomePage from './pages/home/HomePage';

function App() { 
  return (
    <div className='font-mons'> 
    <Router>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />}/>
        <Route path="/home" element={<HomePage />}/>
      </Routes>
    </Router>

    </div>
  );
}

export default App;
