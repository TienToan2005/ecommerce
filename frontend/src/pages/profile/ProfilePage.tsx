import React, { useState, useEffect } from 'react';
import { Loader2, User as UserIcon, Mail, Phone, Calendar } from 'lucide-react';
import { getProfile } from '../../services/auth';
import type { UserResponse } from '../../types/user';
import toast from 'react-hot-toast';
import EditProfileModal from './EditProfileModal';

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setUser(data);
      } catch (error) {
        toast.error('Không thể tải thông tin người dùng');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <Loader2 className="animate-spin text-red-500" size={40} />
      </div>
    );
  }

  if (!user) return <div className="text-center mt-20 text-gray-500">Chưa đăng nhập</div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
        
        {/* Header Profile */}
        <div className="bg-red-600 px-8 py-10 text-white flex items-center gap-6">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-black text-red-600">{user.fullName.charAt(0)}</span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{user.fullName}</h1>
            <p className="opacity-90 mt-1 flex items-center gap-2 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">{user.role === 'ADMIN' ? 'Quản trị viên' : 'Thành viên TPHONE'}</span>
            </p>
          </div>
        </div>

        {/* Thông tin chi tiết */}
        <div className="p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Thông tin cá nhân</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-xl"><UserIcon size={24} /></div>
              <div>
                <p className="text-sm font-semibold text-gray-500">Họ và Tên</p>
                <p className="text-lg font-medium text-gray-900">{user.fullName}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Mail size={24} /></div>
              <div>
                <p className="text-sm font-semibold text-gray-500">Email</p>
                <p className="text-lg font-medium text-gray-900">{user.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Phone size={24} /></div>
              <div>
                <p className="text-sm font-semibold text-gray-500">Số điện thoại</p>
                <p className="text-lg font-medium text-gray-900">{user.phoneNumber || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Calendar size={24} /></div>
              <div>
                <p className="text-sm font-semibold text-gray-500">Ngày sinh</p>
                <p className="text-lg font-medium text-gray-900">
                  {user.birthday ? new Date(user.birthday).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-10 flex justify-end">
             <button 
                onClick={() => setIsEditModalOpen(true)}
                className="bg-gray-100 text-gray-700 font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-200 transition-colors"
             >
               Chỉnh sửa thông tin
             </button>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <EditProfileModal 
          user={user} 
          onClose={() => setIsEditModalOpen(false)} 
          onUpdateSuccess={(updatedUser) => setUser(updatedUser)} 
        />
      )}
    </div>
  );
};

export default Profile;