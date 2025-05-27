import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import RegisterPage from './pages/usersRegisterPage';
import LoginPage from './pages/users/LoginPage';
// import DashboardPage from './pages/users/DashboardPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/register" element={<RegisterPage />} /> */}
        <Route path="/login" element={<LoginPage />} />
        {/* <Route path="/dashboard" element={<DashboardPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
