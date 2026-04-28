import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminProduct: React.FC = () => {
  //const [products, setProducts] = useState([]);
  const [products] = useState([
    { id: 1, name: 'Samsung Galaxy S24 Ultra', sku: 'S24U-256-GREY', price: 33990000, stock: 50, category: 'Điện thoại' },
    { id: 2, name: 'Apple Watch Series 9', sku: 'AW9-41MM-MIDNIGHT', price: 10490000, stock: 5, category: 'Phụ kiện' },
    { id: 3, name: 'Sạc dự phòng Anker Prime', sku: 'ANKER-200W', price: 3500000, stock: 0, category: 'Phụ kiện' },
  ]);
  {/*useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/admin/products'); 
        
        setProducts(res.data.data); 
      } catch (error) {
        console.log("Lỗi lấy sản phẩm", error);
      }
    }
    fetchProducts();
  }, []);*/}
  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Đã xóa sản phẩm khỏi danh sách!');
    }
  };
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sản phẩm & Kho hàng</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý danh mục, giá bán và tồn kho</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <input type="text" placeholder="Tìm sản phẩm..." className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <button className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition shadow-sm">
            <Plus size={18} /> Thêm Mới
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 text-gray-500 text-sm border-b border-gray-100">
              <th className="py-4 px-6 font-medium">Sản Phẩm</th>
              <th className="py-4 px-6 font-medium">Danh mục</th>
              <th className="py-4 px-6 font-medium">Giá Bán</th>
              <th className="py-4 px-6 font-medium text-center">Tồn Kho</th>
              <th className="py-4 px-6 font-medium text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((item) => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                <td className="py-4 px-6 flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 shrink-0">
                    <ImageIcon size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">SKU: {item.sku}</p>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">{item.category}</td>
                <td className="py-4 px-6 text-sm font-bold text-gray-800">{formatCurrency(item.price)}</td>
                <td className="py-4 px-6 text-center">
                  {item.stock > 10 ? (
                    <span className="text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full">{item.stock}</span>
                  ) : item.stock > 0 ? (
                    <span className="text-orange-600 font-bold bg-orange-50 px-3 py-1 rounded-full">{item.stock}</span>
                  ) : (
                    <span className="text-red-600 font-bold bg-red-50 px-3 py-1 rounded-full">Hết hàng</span>
                  )}
                </td>
                <td className="py-4 px-6 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition" title="Sửa"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition" title="Xóa"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default AdminProduct;