import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react'; // Đổi sang dùng icon Star
import type { ProductResponse } from '../types/product';
import { formatCurrency } from '../utils/format';

interface Props {
  product: ProductResponse;
}

const ProductCard: React.FC<Props> = ({ product }) => {
  const defaultVariant = product.variants?.[0] || null;
  const displayPrice = defaultVariant?.price || 0;

  const avgRating = product.averageRating || 0;
  const totalReviews = product.totalReviews || 0;

  const thumbnail = product.poster 
    ? product.poster 
    : (product.images && product.images.length > 0 ? product.images[0] : 'https://dummyimage.com/300x300/f3f4f6/9ca3af.png&text=No+Image');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-shadow duration-300 flex flex-col h-full group relative">
      
      {/* Ảnh sản phẩm */}
      <Link to={`/product/${product.id}`} className="block relative pt-[100%] mb-4 overflow-hidden rounded-lg bg-gray-50">
        <img 
          src={thumbnail} 
          alt={product.name} 
          className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { e.currentTarget.src = 'https://dummyimage.com/300x300/f3f4f6/9ca3af.png&text=No+Image'}}
        />
      </Link>

      {/* Thông tin sản phẩm */}
      <div className="flex flex-col flex-1">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-gray-800 text-sm md:text-base line-clamp-2 hover:text-red-600 transition-colors mb-2">
            {product.name}
          </h3>
        </Link>
        
        {/* Phần Giá và Đánh giá đẩy xuống đáy */}
        <div className="mt-auto">
          <p className="text-red-600 font-bold text-lg mb-2">
            {formatCurrency(Number(displayPrice))}
          </p>
          
          <div className="flex items-center text-sm">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={14} 
                  className={i < Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"} 
                />
              ))}
            </div>
            {totalReviews > 0 ? (
               <span className="ml-2 text-gray-500 text-xs">
                 {totalReviews} đánh giá
               </span>
            ) : (
               <span className="ml-2 text-gray-400 text-xs italic">
                 Chưa có đánh giá
               </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;