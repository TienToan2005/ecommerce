import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, ShieldCheck, Truck, X, ChevronLeft, ChevronRight, Maximize2, User, Star, Home, CheckCircle2, RefreshCw, Camera, XCircle } from 'lucide-react';
import * as productApi from '../../services/product';
import * as reviewApi from '../../services/review';
import type { ProductResponse, ProductVariantResponse } from '../../types/product';
import { useCartStore } from '../../hooks/useCartStore';
import { formatCurrency } from '../../utils/format';
import toast from 'react-hot-toast'; 
import { useAuthStore } from '../../hooks/useAuthStore';
import { useUIStore } from '../../hooks/useUIStore';

const FALLBACK_IMAGE = 'https://placehold.co/400x400/f3f4f6/a1a1aa?text=TPHONE';
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  if (e.currentTarget.src !== FALLBACK_IMAGE) {
    e.currentTarget.src = FALLBACK_IMAGE;
  }
};

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addToCart);
  const { isAuthenticated } = useAuthStore();

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // --- STATE ẢNH & LIGHTBOX SẢN PHẨM ---
  const [mainImage, setMainImage] = useState<string>('');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // --- STATE TABS ---
  const [activeTab, setActiveTab] = useState<'description' | 'specs'>('description');
  
  // --- STATE FORM ĐÁNH GIÁ ---
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const { openAuthModal } = useUIStore();

  // THÊM STATE ĐỂ LỌC ĐÁNH GIÁ
  const [reviewFilter, setReviewFilter] = useState<string>('ALL');
  const [reviewsList, setReviewsList] = useState<any[]>([]);

  const fetchProduct = async () => {
    if (!id) return;
    try {
      const data = await productApi.getProductById(Number(id));
      setProduct(data);
      
      if (data.variants && data.variants.length > 0 && !selectedVariant) {
        const firstAvailableVariant = data.variants.find((v: ProductVariantResponse) => v.stock > 0) || data.variants[0];
        setSelectedVariant(firstAvailableVariant);
      }
      
      if (!mainImage) {
        if (data.images && data.images.length > 0) {
          setMainImage(data.images[0].replace('http://', 'https://'));
        } else if (data.poster) {
          setMainImage(data.poster.replace('http://', 'https://'));
        }
      }
    } catch (error) {
      console.error("Lỗi khi tải chi tiết sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchReviews = async () => {
    if (!id) return;
    try {
      const res: any = await reviewApi.getReviewsByProduct(Number(id)); 
      
      const data = res.data || res.content || res || [];
      setReviewsList(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách đánh giá:", error);
    }
  };
  useEffect(() => {
    setLoading(true);
    fetchProduct();
    fetchReviews();
  }, [id]);

  const openLightbox = () => {
    const index = product?.images?.findIndex(img => img === mainImage) || 0;
    setCurrentImageIndex(index !== -1 ? index : 0);
    setIsLightboxOpen(true);
  };

  // --- LOGIC ẢNH ĐÁNH GIÁ (XỬ LÝ CHỌN/XÓA ẢNH) ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setReviewImages((prev) => [...prev, ...filesArray]);
      
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeReviewImage = (indexToRemove: number) => {
    setReviewImages((prev) => prev.filter((_, index) => index !== indexToRemove));
    setPreviewUrls((prev) => {
      const newUrls = [...prev];
      URL.revokeObjectURL(newUrls[indexToRemove]); 
      newUrls.splice(indexToRemove, 1);
      return newUrls;
    });
  };

  const handleWriteReviewClick = () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để viết đánh giá!");
      openAuthModal(); 
      return;
    }
    setShowReviewForm(true);
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
      }, reviewImages); 
      
      toast.success("Cảm ơn bạn đã đánh giá!");
      
      setShowReviewForm(false);
      setReviewComment('');
      setRating(5);
      setReviewImages([]);
      setPreviewUrls([]);
      
      await fetchProduct(); 
      await fetchReviews();
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi gửi đánh giá");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const rawReviews: any[] = reviewsList;  
  const totalReviews = product?.totalReviews || rawReviews.length;
  const avgRating = (product?.averageRating || 0).toFixed(1);
  
  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  rawReviews.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) {
      starCounts[r.rating as keyof typeof starCounts]++;
    }
  });

  const filteredReviews = rawReviews.filter(review => {
    if (reviewFilter === 'ALL') return true;
    if (reviewFilter === 'HAS_IMAGE') return review.images && review.images.length > 0;
    if (reviewFilter === 'BOUGHT') return true;
    if (reviewFilter === '5_STAR') return review.rating === 5;
    if (reviewFilter === '4_STAR') return review.rating === 4;
    return true;
  });

  if (loading) return (
    <div className="min-h-[60vh] flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
    </div>
  );
  
  if (!product) return <div className="text-center py-20 text-red-600 font-bold text-xl">Không tìm thấy sản phẩm!</div>;

  const displayPrice = selectedVariant ? Number(selectedVariant.price) : 0;
  const originalPrice = selectedVariant?.originalPrice ? Number(selectedVariant.originalPrice) : displayPrice;
  const discountPercent = originalPrice > displayPrice ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0;

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error("Bạn ơi, vui lòng đăng nhập để mua hàng nhé!");
      openAuthModal();
      return;
    }
    if (!selectedVariant) return toast.error("Vui lòng chọn phiên bản sản phẩm!");

    const buyNowItem = [{
      product: product,
      variant: selectedVariant,
      quantity: 1
    }];

    navigate('/checkout', { state: { isBuyNow: true, itemsToCheckout: buyNowItem } });
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
  const formatReviewDate = (dateVal: any) => {
    if (!dateVal) return 'Gần đây';
    
    if (Array.isArray(dateVal) && dateVal.length >= 3) {
      return new Date(dateVal[0], dateVal[1] - 1, dateVal[2]).toLocaleDateString('vi-VN');
    }
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? 'Gần đây' : d.toLocaleDateString('vi-VN');
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <Link to="/" className="flex items-center hover:text-red-600"><Home size={14} className="mr-1"/> Trang chủ</Link>
          <ChevronRight size={14} />
          <Link to={`/products?category=${product.category?.id}`} className="hover:text-red-600">{product.category?.name || 'Sản phẩm'}</Link>
          <ChevronRight size={14} />
          <span className="text-gray-800 font-medium truncate">{product.name}</span>
        </div>

        {/* KHỐI 1: MAIN INFO */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="mb-6 pb-4 border-b border-gray-100 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{product.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <div className="flex items-center text-yellow-500">
                  <Star size={16} className="fill-yellow-500 mr-1" />
                  <span className="font-bold mr-1">{avgRating}</span>
                  <span className="text-gray-400">({totalReviews} đánh giá)</span>
                </div>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500">Đã bán: 1.2k+</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* CỘT 1: ẢNH SẢN PHẨM */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div 
                className="relative aspect-square border border-gray-100 rounded-2xl overflow-hidden bg-white flex items-center justify-center p-6 cursor-zoom-in group hover:border-red-200 transition-colors"
                onClick={openLightbox}
              >
                <img src={mainImage || FALLBACK_IMAGE} alt={product.name} className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" onError={handleImageError} />
                <div className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-lg text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 size={20} />
                </div>
              </div>

              {product.images && product.images.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {product.images.map((imgUrl, index) => {
                    const formattedUrl = imgUrl.replace('http://', 'https://');
                    return (
                      <button 
                        key={index} onClick={() => setMainImage(formattedUrl)}
                        className={`w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl overflow-hidden transition-all bg-white p-1 ${mainImage === formattedUrl ? 'ring-2 ring-red-600 border-transparent shadow-md' : 'border border-gray-200 hover:border-red-300'}`}
                      >
                        <img src={formattedUrl} alt={`thumb-${index}`} className="w-full h-full object-contain rounded-lg" onError={handleImageError} />
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* CỘT 2: THÔNG TIN MUA HÀNG */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="mb-6 bg-gradient-to-r from-red-50 to-orange-50 p-5 rounded-2xl border border-red-100">
                <div className="flex items-end gap-3 mb-1">
                  <span className="text-3xl md:text-4xl font-black text-red-600">{formatCurrency(displayPrice)}</span>
                  {discountPercent > 0 && (
                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg mb-1">-{discountPercent}%</span>
                  )}
                </div>
                {discountPercent > 0 && (
                  <div className="text-gray-500 line-through text-sm">Giá gốc: {formatCurrency(originalPrice)}</div>
                )}
              </div>

              {product.variants && product.variants.length > 0 && (
                <div className="mb-8">
                  <p className="font-bold text-gray-800 mb-3 flex items-center justify-between">
                    <span>Chọn phiên bản:</span>
                    {selectedVariant && <span className="text-red-600 font-medium text-sm">{selectedVariant.sku}</span>}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {product.variants.map((variant) => {
                      const isActive = selectedVariant?.id === variant.id;
                      const isOutOfStock = variant.stock <= 0;
                      return (
                        <button
                          key={variant.id} 
                          onClick={() => !isOutOfStock && setSelectedVariant(variant)}
                          disabled={isOutOfStock}
                          className={`relative border-2 rounded-xl py-3 px-2 flex flex-col items-center justify-center gap-1 transition-all
                            ${isActive ? 'border-red-600 bg-red-50' : 'border-gray-200 bg-white hover:border-red-300'}
                            ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer'}
                          `}
                        >
                          {isActive && <CheckCircle2 size={16} className="absolute top-2 right-2 text-red-600" />}
                          <span className={`font-bold text-sm ${isActive ? 'text-red-700' : 'text-gray-700'}`}>{variant.sku}</span>
                          <span className={`text-xs ${isActive ? 'text-red-600' : 'text-gray-500'}`}>{formatCurrency(Number(variant.price))}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 mt-auto">
                <button 
                  onClick={handleBuyNow} disabled={!selectedVariant || selectedVariant.stock === 0}
                  className={`w-full text-white font-bold py-4 rounded-xl transition-all uppercase flex flex-col items-center justify-center relative overflow-hidden
                    ${selectedVariant && selectedVariant.stock > 0 ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-lg shadow-red-500/30 transform hover:-translate-y-1' : 'bg-gray-400 cursor-not-allowed'}
                  `}
                >
                  <span className="text-lg">{selectedVariant && selectedVariant.stock > 0 ? 'Mua Ngay' : 'Hết Hàng'}</span>
                  <span className="text-xs font-normal opacity-90 mt-0.5">Giao tận nơi hoặc nhận tại cửa hàng</span>
                </button>
                
                <div className="flex gap-3">
                  <button 
                    onClick={handleAddToCart} disabled={!selectedVariant || selectedVariant.stock === 0}
                    className={`flex-1 border-2 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 
                      ${selectedVariant && selectedVariant.stock > 0 ? 'border-red-600 text-red-600 hover:bg-red-50' : 'border-gray-300 text-gray-400 cursor-not-allowed'}
                    `}
                  >
                    <ShoppingCart size={20} />
                    <span>Thêm vào giỏ</span>
                  </button>
                </div>
              </div>
            </div>

            {/* CỘT 3: CHÍNH SÁCH BẢO HÀNH */}
            <div className="lg:col-span-3">
              <div className="border border-gray-200 rounded-2xl p-5 bg-white h-full">
                <h3 className="font-bold text-gray-800 mb-5 text-lg">Thông tin máy</h3>
                <ul className="space-y-5 text-sm text-gray-700">
                  <li className="flex gap-3 items-start">
                    <ShieldCheck className="text-red-600 flex-shrink-0 mt-0.5" size={22} />
                    <span>Bảo hành chính hãng 12 tháng tại trung tâm bảo hành uỷ quyền TPHONE.</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <RefreshCw className="text-red-600 flex-shrink-0 mt-0.5" size={22} />
                    <span>1 ĐỔI 1 trong 30 ngày nếu có lỗi phần cứng từ nhà sản xuất.</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <Truck className="text-red-600 flex-shrink-0 mt-0.5" size={22} />
                    <span>Giao hàng nhanh toàn quốc. Kiểm tra hàng trước khi thanh toán.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* KHỐI 2: TABS THÔNG TIN & REVIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            
            {/* TABS NỘI DUNG */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex border-b overflow-x-auto scrollbar-hide bg-gray-50/50">
                <button 
                  onClick={() => setActiveTab('description')}
                  className={`px-8 py-4 whitespace-nowrap font-bold transition-all ${activeTab === 'description' ? 'text-red-600 border-b-2 border-red-600 bg-white' : 'text-gray-500 hover:text-gray-800 hover:bg-white'}`}
                >
                  Đặc điểm nổi bật
                </button>
                <button 
                  onClick={() => setActiveTab('specs')}
                  className={`px-8 py-4 whitespace-nowrap font-bold transition-all ${activeTab === 'specs' ? 'text-red-600 border-b-2 border-red-600 bg-white' : 'text-gray-500 hover:text-gray-800 hover:bg-white'}`}
                >
                  Thông số kỹ thuật
                </button>
              </div>
              
              <div className="p-6 md:p-8">
                {activeTab === 'description' ? (
                  <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {product.description || 'Chưa có thông tin mô tả chi tiết cho sản phẩm này.'}
                  </div>
                ) : (
                  <div className="rounded-xl overflow-hidden border border-gray-100">
                    <table className="w-full text-sm border-collapse">
                      <tbody>
                        {product.specifications && Object.keys(product.specifications).length > 0 ? (
                          Object.entries(product.specifications).map(([key, value], index) => (
                            <tr key={key} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                              <td className="py-4 px-6 border-b border-gray-100 text-gray-600 font-medium w-1/3">{key}</td>
                              <td className="py-4 px-6 border-b border-gray-100 text-gray-900">{value}</td>
                            </tr>
                          ))
                        ) : (
                          <tr><td className="py-8 text-center text-gray-500 bg-gray-50">Đang cập nhật thông số...</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* REVIEW BOX */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold mb-6 text-gray-800">Đánh giá & nhận xét {product.name}</h2>
              
              <div className="flex flex-wrap items-center gap-2 mb-8 text-sm">
                <span className="font-bold text-gray-800 mr-2">Lọc theo:</span>
                <button 
                  onClick={() => setReviewFilter('ALL')}
                  className={`px-4 py-1.5 rounded-full font-medium transition-colors ${reviewFilter === 'ALL' ? 'border border-red-600 bg-red-50 text-red-600' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  Tất cả
                </button>
                <button 
                  onClick={() => setReviewFilter('HAS_IMAGE')}
                  className={`px-4 py-1.5 rounded-full font-medium transition-colors ${reviewFilter === 'HAS_IMAGE' ? 'border border-red-600 bg-red-50 text-red-600' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  Có hình ảnh
                </button>
                <button 
                  onClick={() => setReviewFilter('BOUGHT')}
                  className={`px-4 py-1.5 rounded-full font-medium transition-colors ${reviewFilter === 'BOUGHT' ? 'border border-red-600 bg-red-50 text-red-600' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  Đã mua hàng
                </button>
                <button 
                  onClick={() => setReviewFilter('5_STAR')}
                  className={`px-4 py-1.5 rounded-full font-medium transition-colors ${reviewFilter === '5_STAR' ? 'border border-red-600 bg-red-50 text-red-600' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  5 sao
                </button>
                <button 
                  onClick={() => setReviewFilter('4_STAR')}
                  className={`px-4 py-1.5 rounded-full font-medium transition-colors ${reviewFilter === '4_STAR' ? 'border border-red-600 bg-red-50 text-red-600' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  4 sao
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-gray-100 pb-8 mb-8">
                <div className="text-center flex flex-col justify-center md:border-r md:border-gray-100 pr-0 md:pr-8">
                  <p className="text-5xl font-black text-red-600">{avgRating}<span className="text-2xl text-gray-400">/5</span></p>
                  <div className="flex justify-center text-yellow-400 my-3">
                    {[...Array(5)].map((_, i) => <Star key={i} size={20} className={i < Math.round(Number(avgRating)) ? 'fill-yellow-400' : 'text-gray-200'} />)}
                  </div>
                  <p className="text-sm text-gray-500 font-medium">{totalReviews} đánh giá</p>
                </div>
                
                <div className="md:col-span-2 flex flex-col justify-center space-y-3">
                   {[5, 4, 3, 2, 1].map(star => {
                     const count = starCounts[star as keyof typeof starCounts];
                     const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                     return (
                       <div key={star} className="flex items-center gap-3 text-sm">
                         <span className="w-6 font-bold text-gray-700 flex items-center">{star} <Star size={12} className="ml-0.5 fill-gray-700"/></span>
                         <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                           <div className="h-full bg-red-500 rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                         </div>
                         <span className="w-16 text-right text-gray-500 font-medium">{count} đánh giá</span>
                       </div>
                     );
                   })}
                </div>
              </div>

              {/* FORM ĐÁNH GIÁ NHÚNG */}
              {showReviewForm ? (
                <div className="bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-200 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
                  <h3 className="font-bold text-lg text-gray-800 mb-4 text-center">Gửi đánh giá của bạn</h3>
                  
                  {/* Chọn sao */}
                  <div className="flex justify-center gap-3 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star} onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star size={36} className={star <= rating ? "fill-yellow-400 text-yellow-400 drop-shadow-sm" : "text-gray-300"} />
                      </button>
                    ))}
                  </div>
                  <p className="text-center text-sm font-bold text-red-600 mb-6">{rating === 5 ? 'Tuyệt vời' : rating >= 3 ? 'Bình thường' : 'Tệ'}</p>

                  {/* Nhập text */}
                  <textarea
                    rows={4}
                    placeholder="Mời bạn chia sẻ thêm cảm nhận về sản phẩm..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-4 mb-4 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none text-sm shadow-sm"
                  ></textarea>

                  {/* CHỌN ẢNH PREVIEW */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    {previewUrls.map((url, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <img src={url} alt="preview" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => removeReviewImage(idx)} 
                          className="absolute top-1 right-1 bg-white/90 rounded-full text-red-500 hover:text-red-700 transition-colors"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    ))}
                    
                    <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-red-300 bg-red-50 rounded-xl cursor-pointer hover:bg-red-100 transition-colors text-red-600">
                      <Camera size={24} className="mb-1" />
                      <span className="text-[10px] font-bold">Thêm ảnh</span>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/png, image/jpeg, image/jpg" 
                        className="hidden" 
                        onChange={handleImageChange} 
                      />
                    </label>
                  </div>

                  {/* Nút chức năng */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button 
                      onClick={() => setShowReviewForm(false)}
                      className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                      disabled={isSubmittingReview}
                    >
                      Hủy bỏ
                    </button>
                    <button 
                      onClick={handleSubmitReview}
                      disabled={isSubmittingReview}
                      className={`px-8 py-2.5 rounded-xl font-bold text-white transition-all shadow-md ${
                        isSubmittingReview ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 shadow-red-600/30'
                      }`}
                    >
                      {isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </button>
                  </div>
                </div>
              ) : (
                rawReviews.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 mb-8">
                    <img src="https://cdn2.cellphones.com.vn/insecure/rs:fill:0:0/q:90/plain/https://cellphones.com.vn/media/wysiwyg/cps-ant.png" alt="No review" className="w-24 md:w-32 mx-auto mb-4 opacity-80" />
                    <p className="text-gray-600 mb-1 font-medium">Hiện chưa có đánh giá nào.</p>
                    <p className="text-gray-500 mb-6 text-sm">Bạn sẽ là người đầu tiên đánh giá sản phẩm này chứ?</p>
                    <button 
                      onClick={handleWriteReviewClick}
                      className="bg-red-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-red-700 transition-colors shadow-md shadow-red-600/20"
                    >
                      Đánh giá ngay
                    </button>
                  </div>
                ) : (
                  <div className="text-center mb-10">
                    <button 
                      onClick={handleWriteReviewClick}
                      className="bg-white text-red-600 border border-red-600 px-8 py-2.5 rounded-xl font-bold hover:bg-red-50 transition-colors"
                    >
                      Viết đánh giá của bạn
                    </button>
                  </div>
                )
              )}

              {/* DANH SÁCH COMMENT */}
              <div className="space-y-6">
                {filteredReviews.length === 0 && rawReviews.length > 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Không có đánh giá nào phù hợp với bộ lọc này.
                  </div>
                ) : (
                  filteredReviews.map((review: any) => (
                    <div key={review.id} className="border-t border-gray-100 pt-6 animate-in fade-in">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-50 text-red-600 rounded-full flex items-center justify-center font-bold border border-red-100">
                          {(review.user?.fullName || review.username || review.user?.email || 'K').charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-800">
                            {review.user?.fullName || review.username || review.user?.email || 'Khách hàng'}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                            {formatReviewDate(review.createdAt || review.createdDate || review.date)}
                            <span className="text-emerald-500 flex items-center"><CheckCircle2 size={12} className="mr-0.5"/> Đã mua hàng</span>
                          </p>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-5 rounded-2xl">
                        <div className="flex text-yellow-400 mb-3">
                          {[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < review.rating ? 'fill-yellow-400' : 'text-gray-300'} />)}
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed mb-4">{review.content}</p>
                        
                        {review.images && review.images.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {review.images.map((img: string, idx: number) => (
                              <img key={idx} src={img} alt={`review-img-${idx}`} className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>

          {/* CỘT PHẢI: BẢNG THÔNG SỐ (STICKY) */}
          <div className="hidden lg:block space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold mb-5 text-gray-800 border-b border-gray-100 pb-3">Cấu hình {product.name}</h2>
              <table className="w-full text-sm">
                <tbody>
                  {product.specifications && Object.keys(product.specifications).length > 0 ? (
                    Object.entries(product.specifications).slice(0, 8).map(([key, value], index) => (
                      <tr key={key} className={index % 2 === 0 ? 'bg-gray-50/80 rounded-lg' : ''}>
                        <td className="py-3 px-3 text-gray-500 w-2/5 rounded-l-lg">{key}</td>
                        <td className="py-3 px-3 text-gray-900 font-medium rounded-r-lg">{value}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td className="py-4 text-center text-gray-500">Đang cập nhật...</td></tr>
                  )}
                </tbody>
              </table>
              <button 
                onClick={() => {
                  setActiveTab('specs');
                  window.scrollTo({ top: 600, behavior: 'smooth' });
                }}
                className="w-full mt-5 py-3 border border-red-600 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                Xem chi tiết cấu hình
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;