import React, { useState } from 'react';
import api from '../api/api';
import config from '../config';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`${config.API_BASE_URL}/auth/app/login`, {
        inputData: {
          user_Email: email,
          user_Password: password
        }
      });
      console.log('res: ', res);

      if (res.data.status === 'success') {
        localStorage.setItem('token', res.data.data.token);
        toast.success("Login successfull");
        if (onLogin) onLogin();
        // navigate('/');
        if (res.data.page === null || res.data.page === "") {
          localStorage.removeItem('forceChangePwd');
          navigate('/');
        } else {
          localStorage.setItem('forceChangePwd', 'true');
          navigate('/change-password');
        }
      } else {
        toast.success(res.data.msg || 'Login failed');
      }
    } catch (err) {
      toast.success(err.response?.data?.msg || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md animate-fade-in">
        <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center tracking-wide">
          Staycation CRM Login
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-blue-700 text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div>
            <label className="block text-blue-700 text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-900 text-white py-2 rounded-lg hover:bg-blue-800 transition"
          >
            Login
          </button>
        </form>
        <p className="text-center text-xs text-gray-500 mt-6">
          © 2025 Staycation CRM. All rights reserved.
        </p>
      </div>
    </div>
  );
}
