import React, { useState, useRef, useEffect } from 'react';
import { Loader2, AlertCircle, X } from 'lucide-react';
import { verifyOtp, resendOtp } from '../services/auth';
import toast from 'react-hot-toast';

interface OtpModalProps {
  email: string; 
  onClose: () => void;
  onSuccess: () => void;
}

const OtpModal: React.FC<OtpModalProps> = ({ email, onClose, onSuccess }) => {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    setErrorMsg(null);

    if (value !== '' && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    if (pastedData.some(char => isNaN(Number(char)))) return;

    const newOtp = [...otp];
    pastedData.forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);
    
    const focusIndex = pastedData.length < 6 ? pastedData.length : 5;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async () => {
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setErrorMsg('Vui lòng nhập đủ 6 số OTP');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await verifyOtp({ email, otp: otpCode });
      
      toast.success('Xác thực tài khoản thành công!');
      onSuccess();
      
    } catch (error: any) {
      const backendMessage = error.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn!';
      setErrorMsg(backendMessage);
      
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };
  const handleResendOtp = async () => {
    if (countdown > 0 || isResending) return; 
    
    setIsResending(true);
    try {
      await resendOtp(email); 
      toast.success('Đã gửi lại mã OTP! Sếp check mail nhé.');
      setCountdown(60); 
      
      setOtp(['', '', '', '', '', '']);
      setErrorMsg(null);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể gửi lại mã lúc này!');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white rounded-2xl w-full max-w-md p-8 relative shadow-2xl animate-in zoom-in-95 duration-200">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 transition-colors">
          <X size={20} />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-gray-900 mb-2">Xác thực tài khoản</h2>
          <p className="text-gray-500 text-sm">
            Mã xác thực (OTP) 6 số đã được gửi đến email <br />
            <span className="font-bold text-red-600">{email}</span>
          </p>
        </div>

        <div className="flex justify-center gap-2 sm:gap-3 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold bg-gray-50 border-2 rounded-xl outline-none transition-all duration-200 
                ${errorMsg ? 'border-red-500 text-red-600 bg-red-50' : 'border-gray-200 text-gray-900 focus:border-red-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(220,38,38,0.1)]'}`}
            />
          ))}
        </div>

        <div className="h-6 mb-4">
          {errorMsg && (
            <p className="text-red-500 text-sm font-medium flex items-center justify-center gap-1.5 animate-in slide-in-from-top-1">
              <AlertCircle size={16} />
              {errorMsg}
            </p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-red-600 text-white font-bold text-lg py-3.5 rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 size={24} className="animate-spin" /> : 'XÁC NHẬN NGAY'}
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
            Chưa nhận được mã?{' '}
            <button 
              onClick={handleResendOtp}
              disabled={countdown > 0 || isResending}
              className={`font-bold transition-colors flex items-center gap-1 ${
                countdown > 0 || isResending 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-red-600 hover:text-red-700 hover:underline'
              }`}
            >
              {isResending && <Loader2 size={14} className="animate-spin" />}
              {countdown > 0 ? `Gửi lại sau (${countdown}s)` : 'Gửi lại mã'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default OtpModal;