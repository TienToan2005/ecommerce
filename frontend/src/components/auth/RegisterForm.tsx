import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import apiClient from '../../services/api';
import toast from 'react-hot-toast';
import OtpModal from '../OtpModal';

const RegisterForm: React.FC = () => {
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

  const [showOTP, setShowOTP] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

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

  return (
    <>
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

      {showOTP && (
        <OtpModal 
          email={registeredEmail}
          onClose={() => {
            setShowOTP(false);
            navigate('/login'); 
          }}
          onSuccess={() => {
            setShowOTP(false);
            navigate('/login');
          }}
        />
      )}
    </>
  );
};

export default RegisterForm;