import React, { useState } from 'react';
import { useAuthStore } from '../../hooks/useAuthStore';
import toast from 'react-hot-toast';

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { loginAction, loading, error } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginAction({ username, password });
      toast.success('Đăng nhập thành công!');
      if (onSuccess) onSuccess();
    } catch (err) {
      // Lỗi đã được xử lý trong useAuthStore, chỉ cần catch để không bị crash
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tài khoản đăng nhập</label>
        <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none" placeholder="Nhập số điện thoại/email" />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none" placeholder="••••••••" />
      </div>
      
      <button type="submit" disabled={loading} className={`w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors mt-4 shadow-lg shadow-red-600/30 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
        {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP'}
      </button>
    </form>
  );
};

export default LoginForm;