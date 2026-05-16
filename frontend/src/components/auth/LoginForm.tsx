import React, { useState } from 'react';
import { useAuthStore } from '../../hooks/useAuthStore';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { loginAction, setGoogleAuth, loading, error } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginAction({ username, password });
      toast.success('Đăng nhập thành công!');
      if (onSuccess) onSuccess();
    } catch (err) {
      // Lỗi đã được xử lý trong useAuthStore
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const tokenData = await GoogleLogin(credentialResponse.credential);
      
      await setGoogleAuth(tokenData.accessToken);
      
      toast.success('Đăng nhập Google thành công!');
      
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error('Lỗi khi xác thực với máy chủ!');
      console.error(err);
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
        
        <div className="flex justify-end mt-2">
          <Link to="/forgot-password" className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline transition-all">
            Quên mật khẩu?
          </Link>
        </div>
      </div>
      
      <button type="submit" disabled={loading} className={`w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors mt-4 shadow-lg shadow-red-600/30 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
        {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP'}
      </button>

      <div className="relative mt-8 mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500 font-medium">Hoặc đăng nhập bằng</span>
        </div>
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => toast.error('Đăng nhập Google thất bại!')}
          shape="rectangular"
          size="large"
          theme="outline"
          text="continue_with"
        />
      </div>
      
    </form>
  );
};

export default LoginForm;