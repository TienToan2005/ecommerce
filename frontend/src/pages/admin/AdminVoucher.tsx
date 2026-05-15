import React, { useState, useEffect } from 'react';
import { Ticket, Plus, Edit, Trash2, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import * as voucherApi from '../../services/admin/voucher'; 
import { formatCurrency } from '../../utils/format';

const AdminVoucher = () => {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // State cho Modal (Thêm/Sửa)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<any | null>(null);

  // State Form nhập liệu
  const initialFormState = {
    code: '',
    discountType: 'PERCENT',
    discountValue: '',
    minOrderValue: '',
    maxDiscount: '',
    expiryDate: '',
    usageLimit: 0,
  };
  const [formData, setFormData] = useState(initialFormState);

  // Gọi API lấy danh sách Voucher
  const fetchVouchers = async () => {
    try {
      setIsLoading(true);
      const res = await voucherApi.getAllVouchers(0, 100); 
      setVouchers(res.content || res.data?.content || res || []);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách Voucher');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  useEffect(() => {
    if (editingVoucher && isModalOpen) {
      const formattedDate = editingVoucher.expiryDate ? editingVoucher.expiryDate.substring(0, 16) : '';
      setFormData({
        code: editingVoucher.code,
        discountType: editingVoucher.discountType,
        discountValue: editingVoucher.discountValue.toString(),
        minOrderValue: editingVoucher.minOrderValue ? editingVoucher.minOrderValue.toString() : '',
        maxDiscount: editingVoucher.maxDiscount ? editingVoucher.maxDiscount.toString() : '',
        expiryDate: formattedDate,
        usageLimit: editingVoucher.usageLimit,
      });
    } else {
      setFormData(initialFormState);
    }
  }, [editingVoucher, isModalOpen]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Sếp có chắc chắn muốn xóa mã này không?')) return;
    try {
      await voucherApi.deleteVoucher(id);
      toast.success('Đã xóa mã giảm giá!');
      fetchVouchers();
    } catch (error) {
      toast.error('Xóa thất bại!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue || !formData.expiryDate || formData.usageLimit <= 0) {
      return toast.error("Vui lòng điền đủ các trường bắt buộc!");
    }

    try {
      setIsSaving(true);
      
      const payload: any = {
        code: formData.code.toUpperCase().trim(),
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        minOrderValue: formData.minOrderValue || "0",
        maxDiscount: formData.maxDiscount || null,
        expiryDate: formData.expiryDate,
        usageLimit: Number(formData.usageLimit)
      };

      if (editingVoucher) {
        await voucherApi.updateVoucher(editingVoucher.id, payload);
        toast.success('Cập nhật mã giảm giá thành công!');
      } else {
        await voucherApi.createVoucher(payload);
        toast.success('Thêm mã giảm giá thành công!');
      }
      
      setIsModalOpen(false);
      fetchVouchers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu mã!');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Ticket className="text-red-600" /> Quản lý Mã Giảm Giá
        </h1>
        <button 
          onClick={() => { setEditingVoucher(null); setIsModalOpen(true); }}
          className="bg-red-600 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-red-700 transition shadow-md shadow-red-500/20"
        >
          <Plus size={20} /> Thêm Voucher
        </button>
      </div>

      {/* BẢNG DỮ LIỆU */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-600 text-sm">
                <th className="p-4 font-semibold">Mã Code</th>
                <th className="p-4 font-semibold">Loại giảm</th>
                <th className="p-4 font-semibold">Giá trị</th>
                <th className="p-4 font-semibold">Đơn tối thiểu</th>
                <th className="p-4 font-semibold text-center">Đã dùng / Tổng</th>
                <th className="p-4 font-semibold">Hạn dùng</th>
                <th className="p-4 font-semibold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {isLoading ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
              ) : vouchers.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">Chưa có mã giảm giá nào.</td></tr>
              ) : (
                vouchers.map((v) => (
                  <tr key={v.id} className="border-b border-gray-50 hover:bg-red-50/30 transition">
                    <td className="p-4 font-bold text-red-600 uppercase">
                      <span className="bg-red-100 px-2 py-1 rounded text-xs">{v.code}</span>
                    </td>
                    <td className="p-4 font-medium">{v.discountType === 'PERCENT' ? 'Phần trăm (%)' : 'Tiền mặt'}</td>
                    <td className="p-4 font-bold text-emerald-600">
                      {v.discountType === 'PERCENT' ? `${v.discountValue}%` : formatCurrency(Number(v.discountValue))}
                    </td>
                    <td className="p-4 font-medium">{v.minOrderValue ? formatCurrency(Number(v.minOrderValue)) : '0đ'}</td>
                    <td className="p-4 text-center">
                      <span className={`font-bold ${v.usedCount >= v.usageLimit ? 'text-red-500' : 'text-blue-600'}`}>
                        {v.usedCount}
                      </span> / {v.usageLimit}
                    </td>
                    <td className="p-4 font-medium">{new Date(v.expiryDate).toLocaleDateString('vi-VN')}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => { setEditingVoucher(v); setIsModalOpen(true); }}
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                          title="Sửa"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(v.id)}
                          className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🚨 MODAL THÊM / SỬA VOUCHER 🚨 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center p-5 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Ticket className="text-red-600" size={24} /> 
                  {editingVoucher ? 'Cập Nhật Mã Giảm Giá' : 'Thêm Mã Giảm Giá Mới'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-600 transition bg-gray-100 hover:bg-red-50 p-1.5 rounded-full">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-2 gap-5 mb-5">
                  {/* Mã Code */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Mã Code <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      placeholder="VD: SUMMERSALE" 
                      value={formData.code} 
                      onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none uppercase font-semibold"
                      required
                    />
                  </div>
                  {/* Loại Giảm */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Loại giảm giá <span className="text-red-500">*</span></label>
                    <select 
                      value={formData.discountType} 
                      onChange={e => setFormData({...formData, discountType: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-medium cursor-pointer"
                    >
                      <option value="PERCENT">Giảm theo %</option>
                      <option value="FIXED">Giảm tiền cố định (VNĐ)</option>
                    </select>
                  </div>

                  {/* Giá trị giảm */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Giá trị giảm <span className="text-red-500">*</span></label>
                    <input 
                      type="number" 
                      placeholder={formData.discountType === 'PERCENT' ? "VD: 10 (%)" : "VD: 50000 (VNĐ)"} 
                      value={formData.discountValue} 
                      onChange={e => setFormData({...formData, discountValue: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-medium"
                      required min="1"
                    />
                  </div>
                  {/* Đơn tối thiểu */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Đơn tối thiểu để áp dụng</label>
                    <input 
                      type="number" 
                      placeholder="VD: 1000000 (Để trống = 0đ)" 
                      value={formData.minOrderValue} 
                      onChange={e => setFormData({...formData, minOrderValue: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-medium"
                      min="0"
                    />
                  </div>

                  {/* Giảm tối đa */}
                  <div className={`${formData.discountType === 'FIXED' ? 'opacity-50 pointer-events-none' : ''}`}>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Giảm tối đa (Chỉ dành cho %)</label>
                    <input 
                      type="number" 
                      placeholder="VD: 500000" 
                      value={formData.maxDiscount} 
                      onChange={e => setFormData({...formData, maxDiscount: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-medium"
                      min="0"
                    />
                  </div>
                  {/* Tổng lượt dùng */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Tổng số lượt dùng <span className="text-red-500">*</span></label>
                    <input 
                      type="number" 
                      placeholder="VD: 100" 
                      value={formData.usageLimit} 
                      onChange={e => setFormData({...formData, usageLimit: Number(e.target.value)})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-medium"
                      required min="1"
                    />
                  </div>

                  {/* Ngày hết hạn */}
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Ngày hết hạn <span className="text-red-500">*</span></label>
                    <input 
                      type="datetime-local"
                      value={formData.expiryDate} 
                      onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-medium cursor-pointer"
                      required
                    />
                  </div>
                </div>

                {/* Các nút hành động */}
                <div className="flex justify-end gap-3 pt-5 border-t border-gray-100">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="px-6 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition flex items-center gap-2 shadow-md shadow-red-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <Save size={18} /> {isSaving ? 'Đang lưu...' : 'Lưu Mã Giảm Giá'}
                  </button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminVoucher;