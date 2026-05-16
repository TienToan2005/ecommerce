import React from 'react';
import RegisterForm from '../../components/auth/RegisterForm'; // 🚨 Gọi Component Form từ thư mục components

const Register: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-100px)] bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-900">Tạo tài khoản TPHONE</h2>
        <p className="mt-2 text-sm text-gray-600">Đăng ký để nhận vô vàn ưu đãi và quản lý đơn hàng dễ dàng</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <RegisterForm />
      </div>

    </div>
  );
};

export default Register;