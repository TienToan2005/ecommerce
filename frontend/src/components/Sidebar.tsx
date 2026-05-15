import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCategoryStore } from '../hooks/useCategoryStore';
import { Smartphone, Laptop, Headphones, Watch, ChevronRight, List } from 'lucide-react';

const getLucideIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes('điện thoại') || name.includes('phone')) return <Smartphone size={18} />;
  if (name.includes('laptop') || name.includes('máy tính')) return <Laptop size={18} />;
  if (name.includes('tai nghe') || name.includes('âm thanh') || name.includes('phụ kiện')) return <Headphones size={18} />;
  if (name.includes('đồng hồ') || name.includes('watch')) return <Watch size={18} />;
  return <List size={18} />;
};

const Sidebar: React.FC = () => {
  const { categories, fetchCategories } = useCategoryStore();
  const [searchParams] = useSearchParams();
  const currentCategoryId = searchParams.get('category');

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-red-600 text-white font-bold p-4 flex items-center gap-2 uppercase">
        <List size={20} /> Danh mục sản phẩm
      </div>
      <div className="flex flex-col py-2">
        
        <Link 
          to="/products"
          className={`flex items-center justify-between px-4 py-3 text-sm font-semibold transition-colors ${!currentCategoryId ? 'text-red-600 bg-red-50' : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'}`}
        >
          <div className="flex items-center gap-3">
            <List size={18} className={!currentCategoryId ? "text-red-600" : "text-gray-400"} />
            <span>Tất cả sản phẩm</span>
          </div>
          <ChevronRight size={16} className={!currentCategoryId ? 'text-red-600' : 'text-gray-400'} />
        </Link>
        
        {categories.map((cat) => {
          const isActive = currentCategoryId === String(cat.id);
          return (
            <Link 
              key={cat.id} 
              to={`/products?category=${cat.id}`}
              className={`flex items-center justify-between px-4 py-3 text-sm font-semibold transition-colors border-t border-gray-50 ${isActive ? 'text-red-600 bg-red-50' : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-3">
                <div className={isActive ? "text-red-600" : "text-gray-400"}>
                  {getLucideIcon(cat.name)}
                </div>
                <span>{cat.name}</span>
              </div>
              <ChevronRight size={16} className={isActive ? 'text-red-600' : 'text-gray-400'} />
            </Link>
          );
        })}

      </div>
    </div>
  );
};

export default Sidebar;