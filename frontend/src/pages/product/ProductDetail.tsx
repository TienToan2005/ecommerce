import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ShieldCheck, Truck, X, ChevronLeft, ChevronRight, Maximize2, User, Star } from 'lucide-react';
import * as productApi from '../../services/product';
import * as reviewApi from '../../services/review';
import type { ProductResponse, ProductVariantResponse } from '../../types/product';
import { useCartStore } from '../../hooks/useCartStore';
import { formatCurrency } from '../../utils/format';
import toast from 'react-hot-toast'; 
import { useAuthStore } from '../../hooks/useAuthStore';
import { useUIStore } from '../../hooks/useUIStore';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addToCart);
  const { isAuthenticated } = useAuthStore();

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // --- STATE ẢNH & LIGHTBOX ---
  const [mainImage, setMainImage] = useState<string>('');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // --- STATE TABS ---
  const [activeTab, setActiveTab] = useState<'description' | 'specs'>('description');
  
  // --- STATE CHO MODAL ĐÁNH GIÁ ---
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const { openAuthModal } = useUIStore();
  // --- HÀM TẢI DỮ LIỆU SẢN PHẨM ---
  const fetchProduct = async () => {
    if (!id) return;
    try {
      const data = await productApi.getProductById(Number(id));
      setProduct(data);
      
      if (data.variants && data.variants.length > 0 && !selectedVariant) {
        setSelectedVariant(data.variants[0]);
      }
      
      if (!mainImage) {
        if (data.images && data.images.length > 0) {
          setMainImage(data.images[0]);
        } else if (data.poster) {
          setMainImage(data.poster);
        }
      }
    } catch (error) {
      console.error("Lỗi khi tải chi tiết sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProduct();
  }, [id]);

  // --- LOGIC LIGHTBOX ---
  const openLightbox = () => {
    const index = product?.images?.findIndex(img => img === mainImage) || 0;
    setCurrentImageIndex(index !== -1 ? index : 0);
    setIsLightboxOpen(true);
  };
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product?.images) return;
    setCurrentImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product?.images) return;
    setCurrentImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  // --- LOGIC ĐÁNH GIÁ (REVIEW) ---
  const handleWriteReviewClick = () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để viết đánh giá!");
      navigate('/login'); 
      return;
    }
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (reviewComment.trim().length < 5) {
      toast.error("Vui lòng nhập ít nhất 5 ký tự!");
      return;
    }
    if (!id) return;

    try {
      setIsSubmittingReview(true);
      await reviewApi.createReview({
        productId: Number(id),
        rating: rating,
        content: reviewComment
      });
      
      toast.success("Cảm ơn bạn đã đánh giá!");
      setIsReviewModalOpen(false);
      setReviewComment('');
      setRating(5);
      
      await fetchProduct(); 
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi gửi đánh giá");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // --- TÍNH TOÁN THỐNG KÊ ĐÁNH GIÁ ---
  const reviews = product?.reviews || [];
  // 🚨 Sử dụng dữ liệu @Formula trực tiếp từ Backend cho chính xác tuyệt đối
  const totalReviews = product?.totalReviews || 0;
  const avgRating = (product?.averageRating || 0).toFixed(1);
  
  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) {
      starCounts[r.rating as keyof typeof starCounts]++;
    }
  });

  if (loading) return <div className="text-center py-20 animate-pulse">Đang tải dữ liệu...</div>;
  if (!product) return <div className="text-center py-20 text-red-600 font-bold text-xl">Không tìm thấy sản phẩm!</div>;

  const displayPrice = selectedVariant ? Number(selectedVariant.price) : 0;

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error("Bạn ơi, vui lòng đăng nhập để mua hàng nhé!");
      openAuthModal();
      return;
    }
    
    if (!selectedVariant) {
       return toast.error("Vui lòng chọn phiên bản sản phẩm!");
    }

    const buyNowItem = [{
      product: product,
      variant: selectedVariant,
      quantity: 1
    }];

    navigate('/checkout', { 
      state: { 
        isBuyNow: true, 
        itemsToCheckout: buyNowItem 
      } 
    });
  };

  const handleAddToCart = async () => { 
    if (!isAuthenticated) {
      toast.error("Bạn ơi, vui lòng đăng nhập để mua hàng nhé!");
      openAuthModal();
      return; 
    }

    if (!selectedVariant) return toast.error("Vui lòng chọn phiên bản sản phẩm!");

    addToCart(product, selectedVariant, 1);
    toast.success('Đã thêm vào giỏ hàng!');
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 mb-8 relative">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">
          {product.name}
        </h1>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* KHỐI 1: ẢNH SẢN PHẨM */}
          <div className="flex flex-col gap-4">
            <div 
              className="relative aspect-square border rounded-xl overflow-hidden bg-white flex items-center justify-center p-4 cursor-zoom-in group"
              onClick={openLightbox}
            >
              <img src={mainImage} alt={product.name} className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute bottom-4 right-4 bg-white/80 p-2 rounded-full shadow-md text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 size={20} />
              </div>
            </div>

            {product.images && product.images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((imgUrl, index) => (
                  <button 
                    key={index} onClick={() => setMainImage(imgUrl)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 border-2 rounded-lg overflow-hidden transition-all ${mainImage === imgUrl ? 'border-red-600' : 'border-gray-200 hover:border-red-400'}`}
                  >
                    <img src={imgUrl} alt={`${product.name} ${index}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* KHỐI 2: THÔNG TIN & ĐẶT HÀNG */}
          <div className="flex-1 flex flex-col">
            <div className="mb-6 bg-red-50 p-4 rounded-xl">
              <p className="text-3xl font-bold text-red-600 mb-1">{formatCurrency(displayPrice)}</p>
              <p className="text-sm text-gray-500 line-through">{formatCurrency(displayPrice * 1.2)}</p>
            </div>

            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <p className="font-semibold text-gray-800 mb-3">Chọn phiên bản:</p>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id} onClick={() => setSelectedVariant(variant)}
                      className={`border-2 px-4 py-2 rounded-lg font-medium transition-all ${selectedVariant?.id === variant.id ? 'border-red-600 text-red-600 bg-red-50' : 'border-gray-200 text-gray-600 hover:border-red-300'}`}
                    >
                      {variant.sku}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 mt-auto">
              <button 
                onClick={handleBuyNow} disabled={!selectedVariant || selectedVariant.stock === 0}
                className={`w-full text-white font-bold py-4 rounded-xl transition-colors uppercase flex flex-col items-center justify-center ${selectedVariant && selectedVariant.stock > 0 ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30' : 'bg-gray-400 cursor-not-allowed'}`}
              >
                <span>{selectedVariant && selectedVariant.stock > 0 ? 'Mua Ngay' : 'Hết Hàng'}</span>
                <span className="text-xs font-normal text-gray-100">Giao hàng tận nơi hoặc nhận tại cửa hàng</span>
              </button>
              
              <div className="flex gap-3">
                <button 
                  onClick={handleAddToCart} disabled={!selectedVariant || selectedVariant.stock === 0}
                  className={`flex-1 border-2 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 ${selectedVariant && selectedVariant.stock > 0 ? 'border-red-600 text-red-600 hover:bg-red-50' : 'border-gray-300 text-gray-400 cursor-not-allowed'}`}
                >
                  <ShoppingCart size={20} />
                  <span>Thêm vào giỏ</span>
                </button>
              </div>
            </div>
          </div>

          {/* KHỐI 3: CHÍNH SÁCH */}
          <div className="w-full md:w-[300px] border border-gray-200 rounded-xl p-4 h-fit">
            <h3 className="font-bold text-gray-800 mb-4">Thông tin máy</h3>
            <ul className="space-y-4 text-sm text-gray-700">
              <li className="flex gap-3"><ShieldCheck className="text-red-600 flex-shrink-0" size={20} /><span>Bảo hành chính hãng 12 tháng tại trung tâm bảo hành uỷ quyền.</span></li>
              <li className="flex gap-3"><Truck className="text-red-600 flex-shrink-0" size={20} /><span>Giao hàng nhanh toàn quốc. Kiểm tra hàng trước khi thanh toán.</span></li>
            </ul>
          </div>
        </div>
      </div>

      {/* ======================================================= */}
      {/* 🚨 PHẦN NÂNG CẤP: TABS THÔNG TIN & REVIEW ĐỘNG 🚨 */}
      {/* ======================================================= */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CỘT TRÁI: TABS & ĐÁNH GIÁ (Chiếm 2 phần) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* KHU VỰC TABS */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex border-b overflow-x-auto scrollbar-hide">
              <button 
                onClick={() => setActiveTab('description')}
                className={`px-6 py-4 whitespace-nowrap font-bold transition-colors ${activeTab === 'description' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-800'}`}
              >
                Thông tin nổi bật
              </button>
              <button 
                onClick={() => setActiveTab('specs')}
                className={`px-6 py-4 whitespace-nowrap font-bold transition-colors ${activeTab === 'specs' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-800'}`}
              >
                Thông số kỹ thuật
              </button>
            </div>
            
            {/* NỘI DUNG TABS */}
            <div className="p-6">
              {activeTab === 'description' ? (
                <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {product.description || 'Chưa có thông tin mô tả cho sản phẩm này.'}
                </div>
              ) : (
                <table className="w-full text-sm border-collapse">
                  <tbody>
                    {product.specifications && Object.keys(product.specifications).length > 0 ? (
                      Object.entries(product.specifications).map(([key, value], index) => (
                        <tr key={key} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="py-3 px-4 border text-gray-500 font-medium w-1/3">{key}</td>
                          <td className="py-3 px-4 border text-gray-800">{value}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td className="py-4 text-center text-gray-500">Đang cập nhật thông số...</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* KHU VỰC ĐÁNH GIÁ (LẤY TỪ DB) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold mb-6">Đánh giá & nhận xét {product.name}</h2>
            
            {/* Tóm tắt điểm số */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-b pb-8 mb-8">
              <div className="text-center flex flex-col justify-center sm:border-r">
                <p className="text-4xl font-black text-gray-800">{avgRating}/5</p>
                <div className="flex justify-center text-yellow-400 my-2">
                  {[...Array(5)].map((_, i) => <span key={i} className={i < Math.round(Number(avgRating)) ? '' : 'text-gray-300'}>★</span>)}
                </div>
                <p className="text-sm text-gray-500">{totalReviews} lượt đánh giá</p>
              </div>
              
              <div className="sm:col-span-2 space-y-2">
                 {[5, 4, 3, 2, 1].map(star => {
                   const count = starCounts[star as keyof typeof starCounts];
                   const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                   return (
                     <div key={star} className="flex items-center gap-4 text-sm">
                       <span className="w-4 font-medium">{star}★</span>
                       <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                         <div className="h-full bg-red-600 rounded-full" style={{ width: `${percent}%` }}></div>
                       </div>
                       <span className="w-16 text-right text-gray-500">{count} đánh giá</span>
                     </div>
                   );
                 })}
              </div>
            </div>

            <div className="text-center mb-8">
              <p className="font-medium mb-3 text-gray-700">Bạn đã trải nghiệm sản phẩm này?</p>
              <button 
                onClick={handleWriteReviewClick}
                className="bg-red-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-red-700 transition-colors shadow-md shadow-red-600/20"
              >
                Viết đánh giá
              </button>
            </div>

            {/* DANH SÁCH COMMENT TỪ DB */}
            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="border-t pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-bold">
                        <User size={18} />
                      </div>
                      <div>
                        {/* 🚨 Chú ý: Dùng review.username để khớp với Interface của sếp */}
                        <p className="font-bold text-sm">{review.username}</p>
                        <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="flex text-yellow-400 text-sm mb-2">
                        {[...Array(5)].map((_, i) => <span key={i} className={i < review.rating ? '' : 'text-gray-300'}>★</span>)}
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{review.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 border-t">
                  Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: BẢNG THÔNG SỐ (STICKY) */}
        <div className="hidden lg:block space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-lg font-bold mb-4">Thông số kỹ thuật</h2>
            <table className="w-full text-sm">
              <tbody>
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  Object.entries(product.specifications).slice(0, 8).map(([key, value], index) => (
                    <tr key={key} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="py-2.5 px-3 text-gray-500 w-2/5">{key}</td>
                      <td className="py-2.5 px-3 text-gray-800 font-medium">{value}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td className="py-4 text-center text-gray-500">Đang cập nhật...</td></tr>
                )}
              </tbody>
            </table>
            <button 
              onClick={() => setActiveTab('specs')}
              className="w-full mt-4 py-2.5 border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors"
            >
              Xem cấu hình chi tiết
            </button>
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* 🚨 MODAL VIẾT ĐÁNH GIÁ (Gắn liền với State) 🚨 */}
      {/* ========================================= */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/60 flex flex-col items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
            
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-lg text-gray-800">Đánh giá sản phẩm</h3>
              <button onClick={() => setIsReviewModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center">
              <img src={mainImage} alt="Product" className="w-24 h-24 object-contain mb-4" />
              <p className="font-semibold text-center mb-6">{product?.name}</p>

              <div className="flex gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    onClick={() => setRating(star)}
                    className={`transition-transform hover:scale-110 focus:outline-none`}
                  >
                    <Star 
                      size={36} 
                      className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
                    />
                  </button>
                ))}
              </div>

              <textarea
                rows={4}
                placeholder="Sếp thấy sản phẩm này thế nào? (Ít nhất 5 ký tự)"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all resize-none"
              ></textarea>
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsReviewModalOpen(false)}
                className="px-6 py-2.5 rounded-lg font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                disabled={isSubmittingReview}
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleSubmitReview}
                disabled={isSubmittingReview}
                className={`px-6 py-2.5 rounded-lg font-bold text-white transition-colors ${
                  isSubmittingReview ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* LIGHTBOX HÌNH ẢNH TOÀN MÀN HÌNH */}
      {isLightboxOpen && product?.images && (
        <div className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center p-4 animate-fade-in">
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
            <div className="text-white font-medium text-lg px-4 tracking-widest opacity-80">
              {currentImageIndex + 1} / {product.images.length}
            </div>
            <button onClick={() => setIsLightboxOpen(false)} className="text-white hover:text-red-500 p-2 transition-colors cursor-pointer">
              <X size={32} />
            </button>
          </div>
          <div className="relative flex items-center justify-center h-full w-full">
            <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white/70 hover:text-white hover:bg-black/80 transition-colors z-10">
              <ChevronLeft size={32} />
            </button>
            <img src={product.images[currentImageIndex]} alt={`full-${currentImageIndex}`} className="max-h-[90vh] max-w-[95vw] object-contain transition-opacity duration-300" />
            <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white/70 hover:text-white hover:bg-black/80 transition-colors z-10">
              <ChevronRight size={32} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductDetail;