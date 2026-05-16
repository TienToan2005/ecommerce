import React, { useState, useRef } from 'react';
import { Camera, Save, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateProfile } from '../../services/auth';
import type { UserResponse } from '../../types/user';

interface EditProfileModalProps {
  user: UserResponse;
  onClose: () => void;
  onUpdateSuccess: (updatedUser: UserResponse) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, onClose, onUpdateSuccess }) => {
  const [fullName, setFullName] = useState(user.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [birthday, setBirthday] = useState(user.birthday || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State xử lý Ảnh
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(user.avatar || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('phoneNumber', phoneNumber);
    if (birthday) formData.append('birthday', birthday);
    
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    try {
      const updatedData = await updateProfile(formData);
      toast.success('Cập nhật hồ sơ thành công!');
      onUpdateSuccess(updatedData); 
      onClose();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật!');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={24} />
        </button>
        
        <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Chỉnh sửa hồ sơ</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* KHU VỰC AVATAR */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div 
              className="relative w-24 h-24 rounded-full group cursor-pointer shadow-md"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Avatar" className="w-full h-full rounded-full object-cover border-4 border-white" />
              ) : (
                <div className="w-full h-full rounded-full bg-red-600 text-white flex items-center justify-center text-3xl font-bold border-4 border-white">
                  {fullName.charAt(0) || 'A'}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={24} />
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageChange} 
            />
            <p className="text-xs text-gray-500 mt-2">Bấm vào ảnh để thay đổi</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và Tên</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all" required />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
            <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
            <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all" />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors flex justify-center items-center gap-2 mt-6 disabled:opacity-70"
          >
            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;