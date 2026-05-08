import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Plus, Trash2, Loader2, Save, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import {  getProductById } from '../../services/product';
import { 
  updateProductById, 
  addVariantToProduct, 
  updateVariant, 
  deleteVariant 
} from '../../services/admin/product'; 

interface EditProductModalProps {
  productId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ productId, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // --- States Thông tin chung ---
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<number>(1);
  const [description, setDescription] = useState('');
  
  // --- States Hình ảnh ---
  const [existingPoster, setExistingPoster] = useState('');
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newPosterFile, setNewPosterFile] = useState<File | null>(null);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);

  // --- States Cấu hình & Biến thể ---
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);
  const [variants, setVariants] = useState<any[]>([]);

  const posterInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);

  // 1. Tải dữ liệu cũ của sản phẩm khi mở Modal
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await getProductById(productId);
        
        setName(data.name);
        setCategoryId(data.category?.id || 1);
        setDescription(data.description || '');
        setExistingPoster(data.poster || '');
        setExistingImages(data.images || []);
        
        if (data.specifications) {
          setSpecs(Object.entries(data.specifications).map(([key, value]) => ({ key, value: String(value) })));
        }

        // Load Variants
        if (data.variants) {
          setVariants(data.variants.map((v: any) => ({
            id: v.id,
            sku: v.sku,
            price: v.price,
            stock: v.stock,
            color: v.attributes?.color || '',
            storage: v.attributes?.storage || ''
          })));
        }
      } catch (error) {
        console.error(error);
        toast.error('Không thể lấy thông tin sản phẩm!');
        onClose();
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [productId, onClose]);

  // 2. Handlers cho mảng động
  const addSpec = () => setSpecs([...specs, { key: '', value: '' }]);
  const removeSpec = (index: number) => setSpecs(specs.filter((_, i) => i !== index));

  const addVariantToUI = () => setVariants([...variants, { sku: '', price: '', stock: 0, color: '', storage: '' }]);
  const removeVariantFromUI = (index: number) => setVariants(variants.filter((_, i) => i !== index));

  // 3. Hàm Submit: Chỉ lưu thông tin chung (Sản phẩm cha)
  const handleSubmitMainProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error('Vui lòng nhập tên sản phẩm!');
      return;
    }

    try {
      setIsSaving(true);
      
      const specificationsRecord: Record<string, string> = {};
      specs.forEach(s => { if (s.key) specificationsRecord[s.key] = s.value; });

      const requestData = {
        name,
        description,
        categoryId,
        specifications: specificationsRecord,
        variants: variants.map(v => ({
          id: v.id,
          sku: v.sku,
          price: v.price,
          stock: Number(v.stock),
          attributes: { color: v.color, storage: v.storage }
        }))
      };

      const formData = new FormData();
      formData.append('data', JSON.stringify(requestData));
      
      if (newPosterFile) {
        formData.append('poster', newPosterFile);
      }
      if (newImageFiles.length > 0) {
        newImageFiles.forEach(file => formData.append('images', file));
      }

      await updateProductById(productId, formData);
      toast.success('Cập nhật thông tin sản phẩm thành công!');
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi cập nhật sản phẩm!');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white p-10 rounded-2xl flex flex-col items-center gap-4 shadow-2xl">
          <Loader2 className="animate-spin text-red-600" size={40} />
          <p className="font-bold text-gray-700">Đang tải dữ liệu sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col scale-100">
        
        {/* HEADER MODAL */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            Chỉnh sửa Sản Phẩm <span className="text-red-600">#{productId}</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-600 bg-white p-2 rounded-full shadow-sm">
            <X size={20} />
          </button>
        </div>

        {/* BODY (SCROLLABLE) */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50 custom-scrollbar">
          <form id="editProductForm" onSubmit={handleSubmitMainProduct} className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* THÔNG TIN CHUNG */}
              <div className="lg:col-span-2 space-y-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 border-b pb-2">Thông tin chung</h3>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tên sản phẩm *</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Danh mục *</label>
                  <select value={categoryId} onChange={e => setCategoryId(Number(e.target.value))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white">
                    <option value={1}>Điện thoại</option>
                    <option value={2}>Laptop</option>
                    <option value={3}>Phụ kiện</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả chi tiết</label>
                  <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                </div>
              </div>

              {/* HÌNH ẢNH */}
              {/* HÌNH ẢNH */}
              <div className="space-y-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 border-b pb-2">Hình ảnh đại diện</h3>
                <div 
                  onClick={() => posterInputRef.current?.click()} 
                  className="border-2 border-dashed border-gray-300 rounded-xl h-48 flex items-center justify-center cursor-pointer overflow-hidden relative group bg-gray-50 hover:bg-gray-100 hover:border-red-300 transition-all"
                >
                  {/* Nếu ĐÃ CÓ ẢNH (file mới hoặc link cũ) */}
                  {newPosterFile || (existingPoster && existingPoster.trim().length > 0) ? (
                    <>
                      <img 
                        src={newPosterFile ? URL.createObjectURL(newPosterFile) : existingPoster?.replace('http://', 'https://')} 
                        className="w-full h-full object-contain p-2" 
                        alt="Poster preview" 
                        onError={(e) => {
                          e.currentTarget.src = 'https://cdn2.cellphones.com.vn/insecure/rs:fill:50:0/q:70/plain/https://cellphones.com.vn/media/logo/logo-cps-vo-dich.png';
                          e.currentTarget.className = 'w-full h-full object-contain p-2 opacity-30 grayscale';
                        }}
                      />
                      {/* Lớp overlay CHỈ HIỆN khi đã có ảnh */}
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="text-white mb-2" size={32} />
                        <span className="text-white font-medium text-sm">Đổi ảnh khác</span>
                      </div>
                    </>
                  ) : (
                    // Nếu CHƯA CÓ ẢNH: Trạng thái trống gọn gàng, không bị đè chữ
                    <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-red-500 transition-colors">
                      <Upload size={36} className="mb-2 text-gray-300 group-hover:text-red-400 transition-colors" />
                      <span className="text-sm font-medium">Click để tải ảnh lên</span>
                    </div>
                  )}
                </div>
                <input type="file" ref={posterInputRef} hidden onChange={e => e.target.files && setNewPosterFile(e.target.files[0])} accept="image/*" />
                {/* Khu vực upload nhiều ảnh chi tiết (Tùy chọn thêm) */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ảnh chi tiết (Chọn lại toàn bộ nếu muốn đổi)</label>
                  <input type="file" multiple onChange={e => e.target.files && setNewImageFiles(Array.from(e.target.files))} accept="image/*" className="text-sm w-full" />
                </div>
              </div>
            </div>

            {/* BIẾN THỂ (VARIANTS) CÓ NÚT LƯU RIÊNG TỪNG DÒNG */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h3 className="font-bold text-gray-800">Quản lý Biến thể (Variants)</h3>
                <button type="button" onClick={addVariantToUI} className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-blue-100">
                  <Plus size={16} /> Thêm dòng mới
                </button>
              </div>
              <div className="space-y-3">
                {variants.map((v, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <input placeholder="SKU" value={v.sku} onChange={e => { const n = [...variants]; n[i].sku = e.target.value; setVariants(n); }} className="flex-1 min-w-[100px] px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-red-500 text-sm" />
                    <input type="number" placeholder="Giá" value={v.price} onChange={e => { const n = [...variants]; n[i].price = e.target.value; setVariants(n); }} className="flex-1 min-w-[100px] px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-red-500 text-sm font-bold text-red-600" />
                    <input type="number" placeholder="Tồn" value={v.stock} onChange={e => { const n = [...variants]; n[i].stock = e.target.value; setVariants(n); }} className="w-20 px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-red-500 text-sm" />
                    <input placeholder="Màu sắc" value={v.color} onChange={e => { const n = [...variants]; n[i].color = e.target.value; setVariants(n); }} className="w-24 px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-red-500 text-sm" />
                    <input placeholder="Dung lượng" value={v.storage} onChange={e => { const n = [...variants]; n[i].storage = e.target.value; setVariants(n); }} className="w-24 px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-red-500 text-sm" />
                    
                    {/* KHU VỰC NÚT ACTION CHO TỪNG VARIANT */}
                    <div className="flex gap-1 border-l border-gray-300 pl-2">
                      <button 
                        type="button" 
                        title="Lưu biến thể này"
                        onClick={async () => {
                          try {
                            const payload = { 
                                productId: productId,
                                sku: v.sku, 
                                price: String(v.price),
                                stock: Number(v.stock), 
                                attributes: { 
                                    color: v.color, 
                                    storage: v.storage 
                                } 
                            };
                            if (v.id) {
                              await updateVariant(v.id, payload);
                              toast.success('Đã cập nhật biến thể!');
                            } else {
                              const newVar = await addVariantToProduct(productId, payload);
                              const n = [...variants];
                              n[i].id = newVar.id; // Gán ID thật từ DB vào UI
                              setVariants(n);
                              toast.success('Đã thêm biến thể mới!');
                            }
                          } catch (err) {
                            toast.error('Lỗi khi lưu biến thể!');
                          }
                        }} 
                        className="text-emerald-600 hover:bg-emerald-100 p-2 rounded bg-white border border-emerald-200 transition-colors flex items-center justify-center"
                      >
                        <Save size={18} />
                      </button>

                      <button 
                        type="button" 
                        title="Xóa biến thể"
                        onClick={async () => {
                          if (window.confirm('Bạn có chắc muốn xóa biến thể này?')) {
                            if (v.id) {
                              try {
                                await deleteVariant(v.id);
                                toast.success('Đã xóa khỏi hệ thống!');
                              } catch (e) {
                                toast.error('Không thể xóa biến thể này!');
                                return;
                              }
                            }
                            removeVariantFromUI(i);
                          }
                        }} 
                        className="text-red-500 hover:bg-red-100 p-2 rounded bg-white border border-red-200 transition-colors flex items-center justify-center"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* THÔNG SỐ KỸ THUẬT (SPECS) */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h3 className="font-bold text-gray-800">Thông số kỹ thuật</h3>
                <button type="button" onClick={addSpec} className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-blue-100">
                  <Plus size={16} /> Thêm thông số
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {specs.map((spec, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input type="text" placeholder="Tên (VD: RAM)" value={spec.key} onChange={e => { const newS = [...specs]; newS[index].key = e.target.value; setSpecs(newS); }} className="w-1/3 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500" />
                    <input type="text" placeholder="Giá trị (VD: 8GB)" value={spec.value} onChange={e => { const newS = [...specs]; newS[index].value = e.target.value; setSpecs(newS); }} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500" />
                    <button type="button" onClick={() => removeSpec(index)} className="text-gray-400 hover:text-red-500 p-2">
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </form>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t flex justify-end gap-3 bg-white rounded-b-2xl">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
            Hủy bỏ
          </button>
          <button 
            type="submit" 
            form="editProductForm" 
            disabled={isSaving} 
            className={`px-8 py-2.5 rounded-lg font-bold text-white shadow-lg shadow-red-200 transition-colors ${isSaving ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {isSaving ? 'Đang lưu...' : 'Lưu Thông Tin Chung'}
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default EditProductModal;