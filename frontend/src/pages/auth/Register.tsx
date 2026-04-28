import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Thêm import này để chuyển trang
import apiClient from '../../services/api';
import toast from 'react-hot-toast';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/register', {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password
      });

      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      // Có thể thêm lệnh chuyển hướng người dùng về trang login ở đây:
      // window.location.href = '/login';
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Email hoặc số điện thoại đã tồn tại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // THÊM WRAPPER: Nền xám nhạt, căn giữa form, có padding
    <div className="min-h-[calc(100vh-100px)] bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      {/* Tiêu đề */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Tạo tài khoản TPHONE
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Đăng ký để nhận vô vàn ưu đãi và quản lý đơn hàng dễ dàng
        </p>
      </div>

      {/* Cái thẻ trắng (Card) chứa form */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Họ và Tên</label>
              <input
                type="text"
                name="fullName"
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                placeholder="Nguyễn Văn A"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                placeholder="email@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại</label>
              <input
                type="tel"
                name="phoneNumber"
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                placeholder="0987654321"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mật khẩu</label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Xác nhận MK</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 mt-4 font-bold text-lg rounded-xl text-white shadow-md shadow-red-500/30 bg-red-600 hover:bg-red-700 hover:-translate-y-0.5 active:translate-y-0 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ TÀI KHOẢN'}
            </button>
          </form>

          {/* Dòng điều hướng về trang Đăng nhập */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-bold text-red-600 hover:text-red-500 transition-colors">
              Đăng nhập ngay
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;