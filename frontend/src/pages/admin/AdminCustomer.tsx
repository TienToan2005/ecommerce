import React, { useState, useEffect } from 'react';
import { Search, UserCircle, Shield, ShieldAlert, Lock, Unlock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllCustomers, toggleUserStatusAdmin } from '../../services/admin/user';
import type { UserResponse } from '../../types/user';

const AdminCustomer: React.FC = () => {
  const [customers, setCustomers] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. Hàm gọi API lấy dữ liệu
  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const pageData = await getAllCustomers(0, 20);
      setCustomers(pageData.content);
    } catch (error) {
      console.error("Lỗi lấy danh sách khách hàng", error);
      toast.error('Không thể tải danh sách khách hàng!');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleLock = async (id: number, currentStatus: string) => {
    try {
      // Gọi API xuống Backend Spring Boot
      const newStatus = await toggleUserStatusAdmin(id);
      
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      
      if (newStatus === 'LOCKED') {
        toast.error('Đã khóa tài khoản này!');
      } else {
        toast.success('Đã mở khóa tài khoản!');
      }
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái", error);
      toast.error('Có lỗi xảy ra, không thể thay đổi trạng thái!');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Khách hàng</h1>
          <p className="text-sm text-gray-500 mt-1">Xem danh sách và phân quyền tài khoản</p>
        </div>
        <div className="relative">
          <input type="text" placeholder="Tìm email hoặc SĐT..." className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500" />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-gray-400">
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-sm border-b border-gray-100">
                <th className="py-4 px-6 font-medium">Tài khoản</th>
                <th className="py-4 px-6 font-medium">Liên hệ</th>
                <th className="py-4 px-6 font-medium">Vai trò</th>
                <th className="py-4 px-6 font-medium">Trạng thái</th>
                <th className="py-4 px-6 font-medium text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((user) => (
                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                  <td className="py-4 px-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center shrink-0">
                      <UserCircle size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm line-clamp-1">{user.fullName || 'Chưa cập nhật'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Tham gia: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm font-medium text-gray-800">{user.email}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{user.phoneNumber || 'Chưa có SĐT'}</p>
                  </td>
                  <td className="py-4 px-6">
                    {user.role === 'ADMIN' ? (
                      <span className="flex items-center gap-1 w-max text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold"><ShieldAlert size={14}/> ADMIN</span>
                    ) : (
                      <span className="flex items-center gap-1 w-max text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-bold"><Shield size={14}/> USER</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    {user.status === 'ACTIVE' 
                      ? <span className="text-emerald-600 font-medium text-sm">Hoạt động</span>
                      : <span className="text-red-600 font-medium text-sm">Bị khóa</span>
                    }
                  </td>
                  <td className="py-4 px-6 text-center">
                    {user.role !== 'ADMIN' && (
                      <button 
                        onClick={() => handleToggleLock(user.id, user.status)}
                        className={`p-2 rounded-lg transition ${user.status === 'ACTIVE' ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                        title={user.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa'}
                      >
                        {user.status === 'ACTIVE' ? <Lock size={18} /> : <Unlock size={18} />}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-500">
                    Không có dữ liệu khách hàng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
export default AdminCustomer;