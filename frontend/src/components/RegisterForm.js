import React, { useState } from 'react';
import { registerUser } from '../api/auth';

const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await registerUser({ email, password });
      setMessage('Đăng ký thành công!');
    } catch (err) {
      setMessage('Lỗi: ' + err.response?.data?.error_message || 'Lỗi không xác định');
    }
  };

  return (
    <form onSubmit={handleRegister} className="p-4 max-w-md mx-auto space-y-4">
      <input type="email" className="w-full border p-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
      <input type="password" className="w-full border p-2" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2">Đăng ký</button>
      <p>{message}</p>
    </form>
  );
};

export default RegisterForm;
