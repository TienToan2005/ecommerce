import React, { useState, useEffect } from 'react';
import { Search, UserCircle, Shield, ShieldAlert, Lock, Unlock, Loader2, Users, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllCustomers, toggleUserStatusAdmin } from '../../services/admin/user';
import type { UserResponse } from '../../types/user';

const AdminCustomer: React.FC = () => {
  const [customers, setCustomers] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const pageData = await getAllCustomers({ 
        page: 0, 
        size: 20,
        search: search || undefined,
        status: status || undefined 
      });
      setCustomers(pageData.content);
    } catch (error) {
       console.error("Lỗi lấy danh sách khách hàng:", error);
       toast.error("Không thể tải danh sách khách hàng!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchCustomers(); 
  }, [status]); 

  const handleToggleLock = async (id: number, currentStatus: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn ${currentStatus === 'ACTIVE' ? 'KHÓA' : 'MỞ KHÓA'} tài khoản này?`)) {
      return;
    }

    try {
      const newStatus = await toggleUserStatusAdmin(id);
      
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      
      if (newStatus === 'LOCKED') {
        toast.error('Đã khóa tài khoản thành công!');
      } else {
        toast.success('Đã mở khóa tài khoản thành công!');
      }
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái", error);
      toast.error('Có lỗi xảy ra, không thể thay đổi trạng thái!');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Khách hàng</h1>
          <p className="text-sm text-gray-500 mt-1">Xem danh sách và phân quyền tài khoản hệ thống</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Trạng thái tài khoản */}
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
            className="p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
          >
            <option value="">Tất cả tài khoản</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="LOCKED">Khóa</option> 
          </select>

          {/* Tìm kiếm đa năng */}
          <div className="relative flex-1 sm:w-80">
            <input 
              type="text" 
              placeholder="Tìm theo Tên, Email, SĐT (Enter để tìm)..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchCustomers()}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" 
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>

          <button onClick={fetchCustomers} className="p-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"><RefreshCw size={18} /></button>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex justify-center items-center py-20 text-red-500">
            <Loader2 className="animate-spin" size={40} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 text-sm border-b border-gray-100 uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold">Tài khoản</th>
                  <th className="py-4 px-6 font-semibold">Liên hệ</th>
                  <th className="py-4 px-6 font-semibold">Vai trò</th>
                  <th className="py-4 px-6 font-semibold">Trạng thái</th>
                  <th className="py-4 px-6 font-semibold text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/70 transition duration-150">
                    
                    <td className="py-4 px-6 flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center shrink-0 border border-slate-200">
                        <UserCircle size={28} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm line-clamp-1">{user.fullName || 'Chưa cập nhật'}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Tham gia: <span className="font-medium text-gray-700">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
                        </p>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <p className="text-sm font-semibold text-gray-800">{user.email}</p>
                      <p className="text-xs text-gray-500 mt-1">{user.phoneNumber || 'Chưa có SĐT'}</p>
                    </td>
                    
                    <td className="py-4 px-6">
                      {user.role === 'ADMIN' ? (
                        <span className="inline-flex items-center gap-1.5 text-red-700 bg-red-50 border border-red-100 px-2.5 py-1 rounded-md text-xs font-bold shadow-sm">
                          <ShieldAlert size={14}/> ADMIN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md text-xs font-bold shadow-sm">
                          <Shield size={14}/> USER
                        </span>
                      )}
                    </td>
                    
                    <td className="py-4 px-6">
                      {user.status === 'ACTIVE' 
                        ? <span className="flex items-center gap-2 text-emerald-600 font-bold text-sm"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Hoạt động</span>
                        : <span className="flex items-center gap-2 text-red-600 font-bold text-sm"><span className="w-2 h-2 rounded-full bg-red-500"></span> Bị khóa</span>
                      }
                    </td>
                    
                    <td className="py-4 px-6 text-center">
                      {user.role !== 'ADMIN' ? (
                        <button 
                          onClick={() => handleToggleLock(user.id, user.status)}
                          className={`p-2.5 rounded-lg transition-colors border shadow-sm ${
                            user.status === 'ACTIVE' 
                              ? 'text-red-600 bg-white border-red-100 hover:bg-red-50' 
                              : 'text-emerald-600 bg-white border-emerald-100 hover:bg-emerald-50'
                          }`}
                          title={user.status === 'ACTIVE' ? 'Khóa tài khoản này' : 'Mở khóa tài khoản này'}
                        >
                          {user.status === 'ACTIVE' ? <Lock size={18} /> : <Unlock size={18} />}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Không thể khóa Admin</span>
                      )}
                    </td>

                  </tr>
                ))}
                
                {/* Trạng thái trống */}
                {!isLoading && customers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <Users size={56} className="mb-4 opacity-40 text-slate-300" />
                        <p className="text-lg font-bold text-gray-600">Không tìm thấy khách hàng nào</p>
                        <p className="text-sm mt-1 text-gray-500">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomer;