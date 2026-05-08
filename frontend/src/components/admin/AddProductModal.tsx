import React, { useState, useRef } from 'react';
import { X, Upload, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { createProduct } from '../../services/admin/product';

interface AddProductModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  // 1. Basic Info State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<number>(1); // Mặc định 1: Điện thoại
  const [description, setDescription] = useState('');

  // 2. Images State
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // 3. Dynamic Specifications State (Mảng key-value)
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([
    { key: 'Màn hình', value: '' },
    { key: 'Chipset', value: '' }
  ]);

  // 4. Dynamic Variants State
  const [variants, setVariants] = useState([
    { sku: '', price: '', stock: 0, color: '', storage: '' }
  ]);

  const posterInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers cho Dynamic Forms ---
  const addSpec = () => setSpecs([...specs, { key: '', value: '' }]);
  const removeSpec = (index: number) => setSpecs(specs.filter((_, i) => i !== index));

  const addVariant = () => setVariants([...variants, { sku: '', price: '', stock: 0, color: '', storage: '' }]);
  const removeVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index));

  // --- Submit Form ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !posterFile || variants.length === 0) {
      toast.error('Vui lòng nhập tên, chọn ảnh Poster và ít nhất 1 biến thể!');
      return;
    }

    try {
      setIsLoading(true);

      // 1. Format Specifications thành dạng Record<string, string>
      const specificationsRecord: Record<string, string> = {};
      specs.forEach(s => {
        if (s.key && s.value) specificationsRecord[s.key] = s.value;
      });

      // 2. Format Variants
      const formattedVariants = variants.map(v => ({
        sku: v.sku,
        price: v.price,
        stock: Number(v.stock),
        attributes: { color: v.color, storage: v.storage }
      }));

      // 3. Tạo cục JSON data
      const requestData = {
        name,
        description,
        categoryId,
        specifications: specificationsRecord,
        variants: formattedVariants
      };

      // 4. Đóng gói vào FormData
      const formData = new FormData();
      // Chú ý: Spring Boot nhận data là String JSON
      formData.append('data', JSON.stringify(requestData)); 
      
      formData.append('poster', posterFile);
      imageFiles.forEach(file => {
        formData.append('images', file);
      });

      // 5. Gọi API
      await createProduct(formData);
      toast.success('Thêm sản phẩm thành công!');
      onSuccess(); // Load lại danh sách và đóng modal
      
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi thêm sản phẩm. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col scale-100 animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Plus size={24} className="text-red-600" /> Thêm Sản Phẩm Mới
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* BODY TỪ ĐÂY */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30 custom-scrollbar">
          <form id="addProductForm" onSubmit={handleSubmit} className="space-y-8">
            
            {/* GRID CHIA 2 CỘT CHO THÔNG TIN CƠ BẢN VÀ ẢNH */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* CỘT TRÁI: THÔNG TIN CƠ BẢN */}
              <div className="lg:col-span-2 space-y-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-lg text-gray-800 border-b pb-2 mb-4">Thông tin cơ bản</h3>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tên sản phẩm *</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="VD: iPhone 15 Pro Max 256GB" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Danh mục *</label>
                    <select value={categoryId} onChange={e => setCategoryId(Number(e.target.value))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white">
                      <option value={1}>Điện thoại</option>
                      <option value={2}>Laptop</option>
                      <option value={3}>Phụ kiện</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả chi tiết (HTML hỗ trợ)</label>
                  <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="<p>Mô tả sản phẩm...</p>" />
                </div>
              </div>

              {/* CỘT PHẢI: UPLOAD ẢNH */}
              <div className="space-y-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-lg text-gray-800 border-b pb-2 mb-4">Hình ảnh</h3>
                
                {/* Poster */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ảnh đại diện (Poster) *</label>
                  <div 
                    onClick={() => posterInputRef.current?.click()}
                    className="border-2 border-dashed border-red-300 bg-red-50 hover:bg-red-100 rounded-xl h-40 flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden relative"
                  >
                    {posterFile ? (
                      <img src={URL.createObjectURL(posterFile)} alt="Poster preview" className="w-full h-full object-contain" />
                    ) : (
                      <>
                        <Upload size={32} className="text-red-400 mb-2" />
                        <span className="text-sm font-medium text-red-600">Click để chọn ảnh</span>
                      </>
                    )}
                  </div>
                  <input type="file" ref={posterInputRef} hidden accept="image/*" onChange={(e) => {
                    if (e.target.files && e.target.files[0]) setPosterFile(e.target.files[0]);
                  }} />
                </div>

                {/* Images chi tiết */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 mt-4">Ảnh chi tiết (Nhiều ảnh)</label>
                  <div 
                    onClick={() => imagesInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 rounded-xl py-4 flex flex-col items-center justify-center cursor-pointer transition-colors"
                  >
                    <ImageIcon size={24} className="text-gray-400 mb-1" />
                    <span className="text-xs font-medium text-gray-500">Chọn thêm ảnh ({imageFiles.length} ảnh đã chọn)</span>
                  </div>
                  <input type="file" ref={imagesInputRef} hidden multiple accept="image/*" onChange={(e) => {
                    if (e.target.files) setImageFiles(Array.from(e.target.files));
                  }} />
                  
                  {/* Previews ảnh chi tiết */}
                  {imageFiles.length > 0 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-2 custom-scrollbar">
                      {imageFiles.map((f, i) => (
                        <div key={i} className="w-16 h-16 shrink-0 rounded-md border border-gray-200 overflow-hidden">
                          <img src={URL.createObjectURL(f)} alt="preview" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* PHẦN BIẾN THỂ (VARIANTS) */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h3 className="font-bold text-lg text-gray-800">Biến thể & Giá (Variants) *</h3>
                <button type="button" onClick={addVariant} className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-blue-100">
                  <Plus size={16} /> Thêm biến thể
                </button>
              </div>

              <div className="space-y-3">
                {variants.map((v, index) => (
                  <div key={index} className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg relative">
                    <input type="text" placeholder="SKU (VD: IP15-256)" value={v.sku} onChange={e => { const newV = [...variants]; newV[index].sku = e.target.value; setVariants(newV); }} className="flex-1 min-w-[120px] px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-red-500 text-sm" required />
                    
                    <input type="number" placeholder="Giá (VD: 29000000)" value={v.price} onChange={e => { const newV = [...variants]; newV[index].price = e.target.value; setVariants(newV); }} className="flex-1 min-w-[120px] px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-red-500 text-sm" required />
                    
                    <input type="number" placeholder="Tồn kho" value={v.stock} onChange={e => { const newV = [...variants]; newV[index].stock = Number(e.target.value); setVariants(newV); }} className="w-24 px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-red-500 text-sm" required />
                    
                    <input type="text" placeholder="Màu sắc (Titan Đen)" value={v.color} onChange={e => { const newV = [...variants]; newV[index].color = e.target.value; setVariants(newV); }} className="flex-1 min-w-[100px] px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-red-500 text-sm" />
                    
                    <input type="text" placeholder="Dung lượng (256GB)" value={v.storage} onChange={e => { const newV = [...variants]; newV[index].storage = e.target.value; setVariants(newV); }} className="flex-1 min-w-[100px] px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-red-500 text-sm" />
                    
                    {variants.length > 1 && (
                      <button type="button" onClick={() => removeVariant(index)} className="text-red-500 hover:bg-red-100 p-1.5 rounded bg-white border border-red-200">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* PHẦN THÔNG SỐ KỸ THUẬT (SPECIFICATIONS) */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h3 className="font-bold text-lg text-gray-800">Thông số kỹ thuật</h3>
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
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white rounded-b-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
            Hủy bỏ
          </button>
          <button 
            type="submit" 
            form="addProductForm" 
            disabled={isLoading}
            className={`px-8 py-2.5 rounded-lg font-bold text-white transition-all shadow-lg shadow-red-600/30 ${isLoading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {isLoading ? 'Đang lưu...' : 'Lưu Sản Phẩm'}
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default AddProductModal;