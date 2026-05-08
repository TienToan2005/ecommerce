import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, ImageIcon, Loader2, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/format';
import { deleteProduct } from '../../services/admin/product'; 
import AddProductModal from '../../components/admin/AddProductModal';
import EditProductModal from '../../components/admin/EditProductModal';
import { useCategoryStore } from '../../hooks/useCategoryStore';
import { useProducts } from '../../hooks/useProducts'; 

const AdminProduct: React.FC = () => {
  const [searchInput, setSearchInput] = useState<string>(''); 
  const [searchTerm, setSearchTerm] = useState<string>(''); 
  const [categoryId, setCategoryId] = useState<string>('');
  
  // --- Global Store ---
  const { categories, fetchCategories } = useCategoryStore();
  
  // --- Modals ---
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editProductId, setEditProductId] = useState<number | null>(null);

  const { data, loading: isLoading, refetch } = useProducts(
    { page: 0, size: 20, name: searchTerm || undefined },
    categoryId // Danh mục
  );

  const products = data?.content || [];

  useEffect(() => {
    fetchCategories(); 
  }, [fetchCategories]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchTerm(searchInput);
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (window.confirm('Sếp có chắc chắn muốn xóa sản phẩm này không? Thao tác này không thể hoàn tác!')) {
      try {
        await deleteProduct(id);
        toast.success(`Đã xóa sản phẩm #${id} thành công!`);
        refetch(); 
      } catch (error) {
        toast.error('Có lỗi xảy ra khi xóa sản phẩm!');
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* HEADER & FILTERS */}
      <div className="flex flex-col mb-6 gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Sản phẩm & Kho hàng</h1>
            <p className="text-sm text-gray-500 mt-1">Quản lý danh mục, thông tin và tồn kho</p>
          </div>
          
          <button 
             onClick={() => setIsAddModalOpen(true)}
             className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
             <Plus size={18} /> <span className="hidden sm:inline">Thêm Sản phẩm</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          {/* Lọc Tên */}
          <div className="relative">
            <input 
              type="text" 
              placeholder="Tìm tên sản phẩm (Enter để tìm)..." 
              value={searchInput} 
              onChange={e => setSearchInput(e.target.value)} 
              onKeyDown={handleSearchKeyDown} 
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500 transition-all" 
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>

          {/* Lọc Danh Mục */}
          <select 
            value={categoryId} 
            onChange={e => setCategoryId(e.target.value)} 
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500 cursor-pointer bg-white transition-all"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
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
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 text-sm border-b border-gray-100 uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold">Sản Phẩm</th>
                  <th className="py-4 px-6 font-semibold">Danh mục</th>
                  <th className="py-4 px-6 font-semibold">Giá Bán Từ</th>
                  <th className="py-4 px-6 font-semibold text-center">Tổng Tồn Kho</th>
                  <th className="py-4 px-6 font-semibold text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.map((item) => {
                  const totalStock = item.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
                  const minPrice = item.variants && item.variants.length > 0 
                    ? Math.min(...item.variants.map(v => Number(v.price))) 
                    : 0;

                  return (
                    <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/70 transition duration-150">
                      
                      <td className="py-4 px-6 flex items-center gap-4">
                        <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-gray-400 shrink-0 border border-gray-150 p-1 overflow-hidden shadow-sm">
                          {item.poster || (item.images && item.images.length > 0) ? (
                            <img 
                              src={(item.poster || item.images[0])?.replace('http://', 'https://')} 
                              alt={item.name} 
                              className="w-full h-full object-contain rounded-md"
                              onError={(e) => {
                                e.currentTarget.src = 'https://cdn2.cellphones.com.vn/insecure/rs:fill:50:0/q:70/plain/https://cellphones.com.vn/media/logo/logo-cps-vo-dich.png';
                                e.currentTarget.className = 'w-full h-full object-contain rounded-md opacity-30 grayscale';
                              }}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center">
                              <ImageIcon size={24} className="text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <p className="font-bold text-gray-800 text-sm line-clamp-2" title={item.name}>
                            {item.name}
                          </p>
                          <div className="mt-1">
                            <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                              {item.variants?.length || 0} phiên bản
                            </span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-6 text-sm text-gray-600 font-medium">
                        {item.category?.name || 'Chưa phân loại'}
                      </td>
                      <td className="py-4 px-6 text-sm font-bold text-red-600">
                        {formatCurrency(minPrice)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {totalStock > 10 ? (
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-full text-xs border border-emerald-100">{totalStock} sẵn hàng</span>
                        ) : totalStock > 0 ? (
                          <span className="text-orange-700 font-bold bg-orange-50 px-3 py-1.5 rounded-full text-xs border border-orange-100">Sắp hết ({totalStock})</span>
                        ) : (
                          <span className="text-red-700 font-bold bg-red-50 px-3 py-1.5 rounded-full text-xs border border-red-100">Hết hàng</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => setEditProductId(item.id)} className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors border border-transparent hover:border-blue-100" title="Sửa">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors border border-transparent hover:border-red-100" title="Xóa">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
                
                {!isLoading && products.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <Package size={56} className="mb-4 opacity-40 text-slate-300" />
                        <p className="text-lg font-bold text-gray-600">Không tìm thấy sản phẩm nào</p>
                        <p className="text-sm mt-1 text-gray-500">Thử thay đổi từ khóa tìm kiếm hoặc thêm sản phẩm mới vào hệ thống.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODALS */}
      {isAddModalOpen && (
        <AddProductModal 
          onClose={() => setIsAddModalOpen(false)} 
          onSuccess={() => {
            setIsAddModalOpen(false);
            refetch(); 
          }} 
        />
      )}
      {editProductId !== null && (
        <EditProductModal 
          productId={editProductId} 
          onClose={() => setEditProductId(null)} 
          onSuccess={() => {
            setEditProductId(null);
            refetch(); 
          }} 
        />
      )}
    </div>
  );
};

export default AdminProduct;