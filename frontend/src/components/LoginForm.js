// src/components/LoginForm.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/api/users/login/', {
        email,
        password
      });
      const { access, refresh } = res.data;

      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);

      navigate('/dashboard');
    } catch (err) {
      setError('Email hoặc mật khẩu không đúng.');
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <input
        type="email"
        placeholder="Email"
        className="w-full border p-2 rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Mật khẩu"
        className="w-full border p-2 rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">
        Đăng nhập
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  );
};

export default LoginForm;
