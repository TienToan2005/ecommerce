import React, { useState } from 'react';
import { Search, UserCircle, Shield, ShieldAlert, Lock, Unlock } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminCustomer: React.FC = () => {
  //const [customers, setCustomers] = useState([]);
  const [customers] = useState([
    { id: 1, name: 'Hoàng Tiến Toàn', email: 'toan0102@gmail.com', phone: '0375903391', role: 'ADMIN', status: 'ACTIVE', date: '2024-01-15' },
    { id: 2, name: 'Nguyễn Văn Client', email: 'client@gmail.com', phone: '0987654321', role: 'USER', status: 'ACTIVE', date: '2024-03-20' },
    { id: 3, name: 'Kẻ Bom Hàng', email: 'scammer@fake.com', phone: '0123456789', role: 'USER', status: 'LOCKED', date: '2024-04-01' },
  ]);
  {/*useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get('/admin/customers'); 
        
        setCustomers(res.data.data); 
      } catch (error) {
        console.log("Lỗi lấy khách hàng", error);
      }
    }
    fetchCustomers();
  }, []);*/}
  const handleToggleLock = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    
    if (newStatus === 'LOCKED') toast.error('Đã khóa tài khoản này!');
    else toast.success('Đã mở khóa tài khoản!');
  };
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
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
                  <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                    <UserCircle size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Tham gia: {new Date(user.date).toLocaleDateString('vi-VN')}</p>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <p className="text-sm font-medium text-gray-800">{user.email}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{user.phone}</p>
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
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default AdminCustomer;