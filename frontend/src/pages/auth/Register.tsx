import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import apiClient from '../../services/api';
import toast from 'react-hot-toast';

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    birthday: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // --- STATE CHO POPUP OTP ---
  const [showOTP, setShowOTP] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (!formData.birthday) {
      toast.error('Vui lòng chọn ngày sinh!');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/register', {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        birthday: formData.birthday,
        password: formData.password
      });

      setRegisteredEmail(formData.email);
      setShowOTP(true);
      toast.success('Đăng ký thành công! Kiểm tra email để lấy mã OTP.');
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Email hoặc số điện thoại đã tồn tại!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      toast.error('Vui lòng nhập đủ 6 số OTP');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/verify-otp', {
        email: registeredEmail,
        otp: otpCode
      });

      toast.success('Xác thực thành công! Vui lòng đăng nhập.');
      setShowOTP(false);
      navigate('/login');
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-100px)] bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-900">Tạo tài khoản TPHONE</h2>
        <p className="mt-2 text-sm text-gray-600">Đăng ký để nhận vô vàn ưu đãi và quản lý đơn hàng dễ dàng</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Họ và Tên</label>
              <input type="text" name="fullName" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all" placeholder="Nguyễn Văn A" value={formData.fullName} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input type="email" name="email" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all" placeholder="email@example.com" value={formData.email} onChange={handleChange} />
            </div>

            {/* 👇 Gộp Số điện thoại và Ngày sinh thành 1 hàng cho đẹp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại</label>
                <input type="tel" name="phoneNumber" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all" placeholder="0987654321" value={formData.phoneNumber} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày sinh</label>
                <input type="date" name="birthday" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-gray-700 uppercase" value={formData.birthday} onChange={handleChange} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mật khẩu</label>
                <input type="password" name="password" required minLength={6} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all" placeholder="••••••••" value={formData.password} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Xác nhận MK</label>
                <input type="password" name="confirmPassword" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} />
              </div>
            </div>

            <button type="submit" disabled={isLoading || showOTP} className={`w-full py-3 px-4 mt-4 font-bold text-lg rounded-xl text-white shadow-md shadow-red-500/30 bg-red-600 hover:bg-red-700 hover:-translate-y-0.5 active:translate-y-0 transition-all ${(isLoading || showOTP) ? 'opacity-70 cursor-not-allowed' : ''}`}>
              {isLoading && !showOTP ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ TÀI KHOẢN'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Đã có tài khoản? <Link to="/login" className="font-bold text-red-600 hover:text-red-500 transition-colors">Đăng nhập ngay</Link>
          </div>
        </div>
      </div>

      {/* POPUP OTP */}
      {showOTP && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center transform transition-all animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Xác thực tài khoản</h2>
            <p className="text-gray-500 mb-6 text-sm">
              Mã xác thực (OTP) 6 số đã được gửi đến email <br />
              <span className="font-bold text-blue-600">{registeredEmail}</span>
            </p>
            
            <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))} placeholder="Nhập mã OTP..." className="w-full text-center tracking-[0.5em] text-2xl font-bold p-4 border border-gray-300 rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all mb-6" maxLength={6} />
            
            <button onClick={handleVerifyOTP} disabled={isLoading} className={`w-full bg-red-600 text-white font-bold py-3.5 rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
              {isLoading ? 'ĐANG XÁC THỰC...' : 'XÁC NHẬN NGAY'}
            </button>
            
            <button onClick={() => { setShowOTP(false); navigate('/login'); }} className="mt-5 text-sm text-gray-500 hover:text-gray-800 hover:underline transition-all">
              Đóng và xác thực sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;