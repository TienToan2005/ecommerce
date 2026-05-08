import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';
import toast from 'react-hot-toast';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form Data
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // =====================================
  // BƯỚC 1: GỬI YÊU CẦU LẤY OTP
  // =====================================
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', null, {
        params: { email }
      });
      
      toast.success('Mã khôi phục đã được gửi! Vui lòng kiểm tra email.');
      setStep(2);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không tìm thấy tài khoản với email này!');
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================
  // BƯỚC 2: XÁC NHẬN ĐỔI MẬT KHẨU
  // =====================================
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otpCode.length !== 6) {
      toast.error('Mã OTP phải gồm 6 chữ số!');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/reset-password', {
        email: email, // Lấy email từ bước 1
        otp: otpCode,
        newPassword: newPassword
      });

      toast.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
      navigate('/login'); // Đá về trang đăng nhập
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-100px)] bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      {/* Tiêu đề */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Khôi phục mật khẩu
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          {step === 1 
            ? "Nhập email của bạn, chúng tôi sẽ gửi mã OTP để lấy lại mật khẩu."
            : "Nhập mã OTP và thiết lập mật khẩu mới cho tài khoản của bạn."}
        </p>
      </div>

      {/* Card Form */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          
          {/* GIAO DIỆN BƯỚC 1 */}
          {step === 1 && (
            <form className="space-y-5" onSubmit={handleRequestOTP}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email đã đăng ký</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 mt-4 font-bold text-lg rounded-xl text-white shadow-md shadow-red-500/30 bg-red-600 hover:bg-red-700 hover:-translate-y-0.5 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'ĐANG GỬI MÃ...' : 'GỬI MÃ KHÔI PHỤC'}
              </button>
            </form>
          )}

          {/* GIAO DIỆN BƯỚC 2 */}
          {step === 2 && (
            <form className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300" onSubmit={handleResetPassword}>
              {/* Box hiện Email cho người dùng nhớ */}
              <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm text-center border border-blue-100">
                Đang khôi phục cho: <span className="font-bold">{email}</span>
                <button type="button" onClick={() => setStep(1)} className="block w-full text-xs underline mt-1 hover:text-blue-800">Đổi email khác</button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mã OTP (6 số)</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  className="w-full px-4 py-2.5 tracking-[0.3em] text-center font-bold bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  placeholder="------"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mật khẩu mới</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 mt-4 font-bold text-lg rounded-xl text-white shadow-md shadow-red-500/30 bg-red-600 hover:bg-red-700 hover:-translate-y-0.5 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'ĐANG XỬ LÝ...' : 'ĐẶT LẠI MẬT KHẨU'}
              </button>
            </form>
          )}

          {/* Nút quay lại Login */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Nhớ ra mật khẩu rồi?{' '}
            <Link to="/login" className="font-bold text-red-600 hover:text-red-500 transition-colors">
              Đăng nhập ngay
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;