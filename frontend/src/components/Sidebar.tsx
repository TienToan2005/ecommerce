import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Smartphone, 
  Laptop, 
  Headphones, 
  Watch, 
  Home, 
  Monitor, 
  Mouse,
  ChevronRight
} from 'lucide-react';

// Dữ liệu mock tạo UI trước. Sau này ta có thể fetch từ API GET /api/categories
const categories = [
  { id: 1, name: 'Điện thoại, Tablet', icon: <Smartphone size={18} />, slug: 'dien-thoai' },
  { id: 2, name: 'Laptop', icon: <Laptop size={18} />, slug: 'laptop' },
  { id: 3, name: 'Âm thanh', icon: <Headphones size={18} />, slug: 'am-thanh' },
  { id: 4, name: 'Đồng hồ thông minh', icon: <Watch size={18} />, slug: 'dong-ho' },
  { id: 5, name: 'Nhà thông minh', icon: <Home size={18} />, slug: 'smarthome' },
  { id: 6, name: 'Phụ kiện máy tính', icon: <Mouse size={18} />, slug: 'phu-kien' },
  { id: 7, name: 'Màn hình', icon: <Monitor size={18} />, slug: 'man-hinh' },
];

const Sidebar: React.FC = () => {
  return (
    <aside className="w-full bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col py-2">
      <nav className="flex-1">
        {categories.map((category) => (
          <Link 
            key={category.id} 
            to={`/category/${category.id}`} 
            className="flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-red-600 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="text-gray-500 group-hover:text-red-600 transition-colors">
                {category.icon}
              </span>
              <span className="text-sm font-medium">{category.name}</span>
            </div>
            {/* Icon mũi tên nhỏ bên phải, sẽ đậm lên khi hover */}
            <ChevronRight size={14} className="text-gray-300 group-hover:text-red-600 transition-colors" />
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;