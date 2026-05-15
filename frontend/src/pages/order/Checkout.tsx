import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../hooks/useAuthStore';
import { useCartStore } from '../../hooks/useCartStore';
import * as orderApi from '../../services/order';
import * as addressApi from '../../services/address'; 
import * as voucherApi from '../../services/voucher';
import type { OrderRequest } from '../../types/order';
import type { AddressResponse } from '../../types/address';
import { formatCurrency } from '../../utils/format';
import toast from 'react-hot-toast';
import type { CartItemResponse } from '../../types/cart';
import { MapPin, Plus, X, CreditCard, Banknote, CheckCircle2, Ticket, ChevronRight } from 'lucide-react';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const { items: cartItems, clearCartUI } = useCartStore();

  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPAY'>('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- STATE CHO ĐỊA CHỈ ---
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  
  const [newAddress, setNewAddress] = useState({ 
    receiverName: '', receiverPhone: '', city: '', district: '', ward: '', street: '' 
  });

  // ---  STATE QUẢN LÝ VOUCHER  ---
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [appliedVoucherCode, setAppliedVoucherCode] = useState<string | null>(null); 
  const [discountAmount, setDiscountAmount] = useState<number>(0); 
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [availableVouchers, setAvailableVouchers] = useState<any[]>([]);
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false);

  // --- LOGIC XÁC ĐỊNH NGUỒN HÀNG ---
  const isBuyNow = location.state?.isBuyNow;
  const displayItems = isBuyNow ? location.state.itemsToCheckout : cartItems;

  const calculateTotal = () => {
    return displayItems.reduce((total: number, item: CartItemResponse) => {
      return total + (Number(item.variant.price) * item.quantity);
    }, 0);
  };
  
  const finalPrice = calculateTotal(); // Tổng tiền hàng chưa giảm
  const finalTotal = finalPrice - discountAmount; // Tổng thanh toán

  // Khởi tạo Data
  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/?depth=3')
      .then(res => res.json())
      .then(data => setProvinces(data)).catch(err => console.error(err));
  }, []);
  
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thanh toán!');
      navigate('/login');
    } else if (!displayItems || displayItems.length === 0) {
      toast.error('Chưa có sản phẩm nào để thanh toán!');
      navigate('/');
    } else {
      addressApi.getMyAddresses().then((data) => {
        setAddresses(data);
        if (data.length > 0 && !selectedAddressId) setSelectedAddressId(data[0].id);
      }).catch(err => console.log(err));
    }
  }, [isAuthenticated, displayItems, navigate, selectedAddressId]);

  // --- HANDLER ĐỊA CHỈ ---
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pCode = e.target.value;
    const selectedP = provinces.find((p: any) => p.code == pCode);
    if (selectedP) {
      setDistricts(selectedP.districts); setWards([]);
      setNewAddress({ ...newAddress, city: selectedP.name, district: '', ward: '' });
    } else {
      setDistricts([]); setWards([]);
      setNewAddress({ ...newAddress, city: '', district: '', ward: '' });
    }
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dCode = e.target.value;
    const selectedD = districts.find((d: any) => d.code == dCode);
    if (selectedD) {
      setWards(selectedD.wards); setNewAddress({ ...newAddress, district: selectedD.name, ward: '' });
    } else {
      setWards([]); setNewAddress({ ...newAddress, district: '', ward: '' });
    }
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const wCode = e.target.value;
    const selectedW = wards.find((w: any) => w.code == wCode);
    if (selectedW) setNewAddress({ ...newAddress, ward: selectedW.name });
    else setNewAddress({ ...newAddress, ward: '' });
  };

  const handleSaveNewAddress = async () => {
    if (!newAddress.receiverName || !newAddress.receiverPhone || !newAddress.street || !newAddress.city || !newAddress.district || !newAddress.ward) {
      return toast.error("Vui lòng điền đầy đủ thông tin!");
    }
    try {
      await addressApi.createAddress(newAddress);
      toast.success("Thêm địa chỉ thành công!");
      setIsAddressModalOpen(false);
      const updatedAddresses = await addressApi.getMyAddresses();
      setAddresses(updatedAddresses);
      setSelectedAddressId(updatedAddresses[updatedAddresses.length - 1].id);
      setNewAddress({ receiverName: '', receiverPhone: '', street: '', ward: '', district: '', city: '' });
      setDistricts([]); setWards([]);
    } catch (error) { toast.error("Thêm địa chỉ thất bại!"); }
  };

  // ---  LOGIC VOUCHER  ---
  const handleOpenVoucherModal = async () => {
    setIsVoucherModalOpen(true);
    if (availableVouchers.length === 0) {
      try {
        setIsLoadingVouchers(true);
        const res = await voucherApi.getAllVouchers(0, 50);
        setAvailableVouchers(res.content || res.data?.content || res || []);
      } catch (error) {
        toast.error("Không thể tải danh sách Voucher");
      } finally {
        setIsLoadingVouchers(false);
      }
    }
  };

  const handleApplyVoucher = async (codeToApply?: string) => {
    const code = codeToApply || voucherCodeInput;
    if (!code.trim()) {
      toast.error("Vui lòng nhập mã giảm giá!");
      return;
    }

    try {
      setIsApplyingVoucher(true);
      const res = await voucherApi.checkVoucher(code.trim().toUpperCase(), finalPrice);
      
      setDiscountAmount(res.calculatedDiscount);
      setAppliedVoucherCode(code.trim().toUpperCase());
      setVoucherCodeInput(code.trim().toUpperCase());
      setIsVoucherModalOpen(false); 
      
      toast.success("Áp dụng mã giảm giá thành công!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Mã giảm giá không hợp lệ hoặc không đủ điều kiện!");
      setDiscountAmount(0);
      setAppliedVoucherCode(null);
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  // --- XỬ LÝ ĐẶT HÀNG ---
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddressId) return toast.error('Vui lòng chọn địa chỉ giao hàng!');

    setIsSubmitting(true);
    try {
      const orderPayload: OrderRequest = {
        userId: user?.id || 0,
        addressId: selectedAddressId,
        paymentMethod: paymentMethod,
        voucherCode: appliedVoucherCode || undefined, 
        orderItemList: displayItems.map((item: CartItemResponse) => ({
          variantId: item.variant.id,
          quantity: item.quantity,
          discount_amount: "0",
          price: Number(item.variant.price)
        }))
      };

      const response = await orderApi.placeOrder(orderPayload);
      if (!isBuyNow) clearCartUI();

      const paymentUrl = response.paymentInfo?.paymentUrl;
      if (paymentMethod === 'VNPAY' && paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        toast.success('🎉 Đặt hàng thành công!');
        navigate('/order-history');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng!');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || displayItems.length === 0) return null;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6 bg-white p-4 rounded-xl shadow-sm">
          <h1 className="text-2xl font-bold text-red-600 border-l-4 border-red-600 pl-3">Thanh Toán Đơn Hàng</h1>
        </div>

        <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6">
            
            {/* KHỐI ĐỊA CHỈ */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden relative">
              <div className="h-1 w-full bg-[repeating-linear-gradient(45deg,#6fa6d6,#6fa6d6_33px,transparent_0,transparent_41px,#f18d9b_0,#f18d9b_74px,transparent_0,transparent_82px)]"></div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4 text-red-600">
                  <MapPin size={20} />
                  <h2 className="text-lg font-bold">Địa Chỉ Nhận Hàng</h2>
                </div>
                <div className="space-y-3">
                  {addresses.length > 0 ? (
                    addresses.map((addr) => (
                      <label key={addr.id} className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-red-500 bg-red-50/50 shadow-sm' : 'border-gray-200 hover:border-red-200'}`}>
                        <div className="pt-1 mr-3">
                           {selectedAddressId === addr.id ? <CheckCircle2 className="text-red-600" size={20}/> : <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-800">{addr.receiverName || user?.fullName || 'Khách hàng'}</span>
                            <span className="text-gray-400">|</span>
                            <span className="font-bold text-gray-800">{addr.receiverPhone || user?.phoneNumber}</span>
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed">{addr.street}, {addr.ward}, {addr.district}, {addr.city}</p>
                        </div>
                      </label>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-dashed">Chưa có địa chỉ giao hàng nào.</div>
                  )}
                </div>
                <button type="button" onClick={() => setIsAddressModalOpen(true)} className="mt-4 flex items-center gap-2 text-blue-600 font-medium text-sm hover:text-blue-700 transition px-2 py-1 rounded hover:bg-blue-50">
                  <Plus size={18} /> Thêm địa chỉ mới
                </button>
              </div>
            </div>

            {/* KHỐI THANH TOÁN */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-lg font-bold mb-4">Phương Thức Thanh Toán</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div onClick={() => setPaymentMethod('COD')} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all select-none ${paymentMethod === 'COD' ? 'border-red-500 bg-red-50/50' : 'border-gray-200 hover:border-red-200'}`}>
                  <div className="mr-3 text-emerald-600 bg-emerald-100 p-2 rounded-full"><Banknote size={24} /></div>
                  <div className="flex-1"><span className="font-bold text-gray-800 block">Thanh toán khi nhận hàng</span><span className="text-xs text-gray-500">Phí thu hộ: 0đ</span></div>
                  {paymentMethod === 'COD' ? <CheckCircle2 className="text-red-600" size={20}/> : <div className="w-5 h-5 rounded-full border-2 border-gray-200"></div>}
                </div>
                <div onClick={() => setPaymentMethod('VNPAY')} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all select-none ${paymentMethod === 'VNPAY' ? 'border-red-500 bg-red-50/50' : 'border-gray-200 hover:border-red-200'}`}>
                  <div className="mr-3 text-blue-600 bg-blue-100 p-2 rounded-full"><CreditCard size={24} /></div>
                  <div className="flex-1"><span className="font-bold text-gray-800 block">Thanh toán VNPAY</span><span className="text-xs text-gray-500">Quét mã QR / Thẻ ATM</span></div>
                  {paymentMethod === 'VNPAY' ? <CheckCircle2 className="text-red-600" size={20}/> : <div className="w-5 h-5 rounded-full border-2 border-gray-200"></div>}
                </div>
              </div>
            </div>
          </div>

          {/* TÓM TẮT ĐƠN HÀNG VÀ VOUCHER */}
          <div className="w-full lg:w-[400px] flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24 border border-gray-100">
              <h2 className="text-lg font-bold mb-4 border-b pb-4">Đơn Hàng Của Bạn</h2>
              
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                {displayItems.map((item: CartItemResponse) => (
                  <div key={item.variant.id} className="flex gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="w-20 h-20 bg-gray-50 rounded-lg border border-gray-100 p-1 flex-shrink-0">
                      <img src={item.product.poster || item.product.images?.[0]} alt={item.product.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 text-sm flex flex-col justify-between">
                      <div>
                        <p className="font-semibold text-gray-800 line-clamp-2 leading-snug">{item.product.name}</p>
                        <p className="text-xs text-gray-500 mt-1">Phân loại: {item.variant.sku}</p>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-600 font-medium">x{item.quantity}</span>
                        <span className="font-bold text-gray-800">{formatCurrency(Number(item.variant.price))}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 🚨 KHU VỰC VOUCHER 🚨 */}
              <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <Ticket size={16} className="text-red-500" /> Mã giảm giá
                  </h3>
                  <button type="button" onClick={handleOpenVoucherModal} className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center">
                    Chọn mã <ChevronRight size={16} />
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập mã..."
                    value={voucherCodeInput}
                    onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                    disabled={appliedVoucherCode !== null}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 uppercase text-sm font-medium disabled:bg-gray-100"
                  />
                  {appliedVoucherCode ? (
                    <button type="button" onClick={() => { setAppliedVoucherCode(null); setDiscountAmount(0); setVoucherCodeInput(''); }} className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-colors text-sm">
                      Hủy
                    </button>
                  ) : (
                    <button type="button" onClick={() => handleApplyVoucher()} disabled={isApplyingVoucher || !voucherCodeInput} className={`px-4 py-2 font-bold rounded-lg text-white transition-colors text-sm ${isApplyingVoucher || !voucherCodeInput ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}>
                      {isApplyingVoucher ? '...' : 'Áp dụng'}
                    </button>
                  )}
                </div>
                
                {appliedVoucherCode && (
                  <p className="mt-2 text-xs text-emerald-600 font-medium animate-in fade-in flex items-center gap-1">
                    <CheckCircle2 size={14} /> Đã áp dụng mã {appliedVoucherCode}
                  </p>
                )}
              </div>

              {/* TỔNG KẾT TIỀN */}
              <div className="border-t border-dashed border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tổng tiền hàng:</span>
                  <span className="font-medium">{formatCurrency(Number(finalPrice))}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600 font-medium">
                    <span>Giảm giá Voucher:</span>
                    <span>-{formatCurrency(Number(discountAmount))}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-600"><span>Phí vận chuyển:</span><span>0 ₫</span></div>
                <div className="flex justify-between items-end pt-3 border-t mt-3">
                  <span className="font-bold text-gray-800">Tổng thanh toán:</span>
                  <span className="text-2xl font-black text-red-600">{formatCurrency(Number(finalTotal))}</span>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className={`w-full bg-red-600 text-white font-bold py-4 rounded-xl mt-6 shadow-md shadow-red-500/30 uppercase tracking-wide hover:bg-red-700 hover:shadow-lg transition-all ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}>
                {isSubmitting ? 'Đang xử lý...' : 'ĐẶT HÀNG NGAY'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 🚨 MODAL KHO VOUCHER (SHOPEE STYLE) 🚨 */}
      {isVoucherModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-gray-50 rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col h-[70vh] sm:h-auto sm:max-h-[80vh] animate-in slide-in-from-bottom-10 sm:zoom-in-95">
            
            {/* Header Modal */}
            <div className="bg-white p-4 border-b flex justify-between items-center sticky top-0 z-10">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <Ticket className="text-red-500" /> Chọn Shop Voucher
              </h3>
              <button onClick={() => setIsVoucherModalOpen(false)} className="text-gray-400 hover:text-red-500 bg-gray-100 p-1 rounded-full"><X size={20}/></button>
            </div>

            {/* List Voucher */}
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {isLoadingVouchers ? (
                <div className="text-center py-10 text-gray-500">Đang tải mã giảm giá...</div>
              ) : availableVouchers.length === 0 ? (
                <div className="text-center py-10 text-gray-500">Shop chưa có mã giảm giá nào.</div>
              ) : (
                availableVouchers.map((v) => {
                  const isMinValid = finalPrice >= (v.minOrderValue || 0);
                  const isStockValid = v.usedCount < v.usageLimit;
                  const isDateValid = new Date(v.expiryDate).getTime() > new Date().getTime();
                  const isAvailable = isMinValid && isStockValid && isDateValid;

                  return (
                    <div key={v.id} className={`flex bg-white rounded-xl overflow-hidden border shadow-sm transition-all ${isAvailable ? 'border-red-200' : 'border-gray-200 opacity-60 grayscale-[30%]'}`}>
                      
                      <div className="w-24 bg-gradient-to-br from-red-500 to-orange-500 text-white flex flex-col justify-center items-center p-2 border-r border-dashed border-red-300 relative">
                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-50 rounded-full"></div>
                        <Ticket size={28} className="mb-1 opacity-80" />
                        <span className="text-[10px] font-black tracking-wider uppercase text-center leading-tight">TPHONE<br/>SALE</span>
                      </div>

                      {/* Cột phải (Chi tiết) */}
                      <div className="flex-1 p-3 flex flex-col justify-center relative">
                        <p className="font-bold text-gray-800 text-sm">
                          Giảm {v.discountType === 'PERCENT' ? `${v.discountValue}%` : formatCurrency(Number(v.discountValue))}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Đơn tối thiểu {formatCurrency(Number(v.minOrderValue || 0))}</p>
                        {v.maxDiscount && <p className="text-xs text-gray-500">Giảm tối đa {formatCurrency(Number(v.maxDiscount))}</p>}
                        
                        <div className="flex justify-between items-end mt-2">
                          <p className="text-[10px] text-gray-400">HSD: {new Date(v.expiryDate).toLocaleDateString('vi-VN')}</p>
                          <button
                            disabled={!isAvailable}
                            onClick={() => handleApplyVoucher(v.code)}
                            className={`px-4 py-1.5 rounded text-sm font-bold shadow-sm ${
                              isAvailable ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-200 text-gray-500'
                            }`}
                          >
                            {isAvailable ? 'Dùng' : 'Chưa đủ ĐK'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL ĐỊA CHỈ */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
             <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-lg text-gray-800">Thêm Địa Chỉ Mới</h3>
              <button onClick={() => setIsAddressModalOpen(false)} className="text-gray-400 hover:text-red-500"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên người nhận</label>
                  <input type="text" placeholder="Họ và tên" value={newAddress.receiverName} onChange={e => setNewAddress({...newAddress, receiverName: e.target.value})} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 outline-none bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input type="text" placeholder="VD: 0987654321" value={newAddress.receiverPhone} onChange={e => setNewAddress({...newAddress, receiverPhone: e.target.value})} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 outline-none bg-gray-50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh / Thành phố</label>
                  <select onChange={handleProvinceChange} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 outline-none bg-gray-50 text-gray-800 cursor-pointer">
                    <option value="">-- Chọn Tỉnh/Thành --</option>
                    {provinces.map((p: any) => <option key={p.code} value={p.code}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quận / Huyện</label>
                  <select onChange={handleDistrictChange} disabled={districts.length === 0} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 outline-none bg-gray-50 disabled:bg-gray-200 disabled:text-gray-400 cursor-pointer">
                    <option value="">-- Chọn Quận/Huyện --</option>
                    {districts.map((d: any) => <option key={d.code} value={d.code}>{d.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phường / Xã</label>
                  <select onChange={handleWardChange} disabled={wards.length === 0} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 outline-none bg-gray-50 disabled:bg-gray-200 disabled:text-gray-400 cursor-pointer">
                    <option value="">-- Chọn Phường/Xã --</option>
                    {wards.map((w: any) => <option key={w.code} value={w.code}>{w.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ cụ thể</label>
                  <input type="text" placeholder="Số nhà, ngõ..." value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 outline-none bg-gray-50" />
                </div>
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <button type="button" onClick={() => setIsAddressModalOpen(false)} className="px-6 py-2.5 rounded-lg font-semibold text-gray-600 hover:bg-gray-200 transition">Hủy bỏ</button>
              <button type="button" onClick={handleSaveNewAddress} className="px-6 py-2.5 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition shadow-md">Lưu Địa Chỉ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;