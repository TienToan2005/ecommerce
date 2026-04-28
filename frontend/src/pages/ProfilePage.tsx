import React from 'react';
import { useAuthStore } from '../hooks/useAuthStore';
import { User, Mail, Phone, MapPin, Calendar, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) return <div className="text-center py-20">Đang tải thông tin...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        {/* Banner trang trí */}
        <div className="h-32 bg-gradient-to-r from-red-600 to-red-400"></div>
        
        <div className="px-8 pb-10">
          {/* Avatar & Tên */}
          <div className="relative -top-12 flex flex-col items-center md:items-start md:flex-row md:gap-6">
            <div className="w-32 h-32 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-white">
              <div className="w-full h-full bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                <User size={64} />
              </div>
            </div>
            <div className="mt-14 md:mt-16 text-center md:text-left">
              <h1 className="text-3xl font-black text-gray-800">{user.fullName || 'Khách hàng Tmember'}</h1>
              <p className="text-gray-500 flex items-center justify-center md:justify-start gap-2 mt-1">
                <ShieldCheck size={16} className="text-green-500" /> Thành viên chính thức
              </p>
            </div>
          </div>

          {/* Chi tiết thông tin */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Thông tin liên hệ</h2>
              
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-red-500">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold">Email</p>
                  <p className="text-gray-800 font-medium">{user.email || 'Chưa cập nhật'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-red-500">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold">Số điện thoại</p>
                  <p className="text-gray-800 font-medium">{user.phoneNumber || 'Chưa cập nhật'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Địa chỉ & Bảo mật</h2>
              
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-red-500">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold">Địa chỉ mặc định</p>
                  <p className="text-gray-800 font-medium line-clamp-1">{user.address || 'Chưa thiết lập địa chỉ'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-red-500">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold">Ngày tham gia</p>
                  <p className="text-gray-800 font-medium">
                    {user.createdAt ? format(new Date(user.createdAt), 'dd/MM/yyyy') : 'Thành viên mới'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button className="w-full mt-10 py-4 bg-gray-800 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg">
            CẬP NHẬT THÔNG TIN
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;