import React, { useEffect, useState, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import api from '../services/api';

const PaymentReturn: React.FC = () => {
  const location = useLocation();
  const hasCalledAPI = useRef(false);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!location.search) {
        setStatus('error');
        setErrorMessage('Không tìm thấy thông tin giao dịch.');
        return;
      }

      if (hasCalledAPI.current) return;
      hasCalledAPI.current = true;

      try {
        const response = await api.get(`/payment/payment-return${location.search}`);
        
        const resData = response.data?.data || response.data;
        const msg = typeof resData === 'string' ? resData : (resData?.message || "Lỗi không xác định");
        
        const isSuccess = msg === "Thanh toán thành công" || msg === "Confirm Success" || resData?.RspCode === "00";

        if (isSuccess) {
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMessage(msg);
        }
      } catch (error) {
        console.error("Lỗi xác thực thanh toán:", error);
        setStatus('error');
        setErrorMessage('Không thể kết nối đến máy chủ.');
      }
    };

    verifyPayment();
  }, [location]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center mt-10">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-gray-100">
        
        {/* TRẠNG THÁI 1: ĐANG TẢI */}
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader className="animate-spin text-red-600 mb-4" size={48} />
            <h2 className="text-xl font-bold text-gray-800">Đang xác thực thanh toán...</h2>
            <p className="text-gray-500 mt-2">Vui lòng không đóng trình duyệt lúc này.</p>
          </div>
        )}

        {/* TRẠNG THÁI 2: THÀNH CÔNG */}
        {status === 'success' && (
          <div className="flex flex-col items-center animate-fade-in">
            <CheckCircle className="text-green-500 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thành công!</h2>
            <p className="text-gray-600 mb-6">Cảm ơn bạn đã mua sắm tại TPHONE. Đơn hàng của bạn đã được xác nhận thanh toán.</p>
            <div className="flex gap-4 w-full">
              <Link to="/" className="flex-1 border border-gray-300 py-2.5 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition">
                Về Trang chủ
              </Link>
              <Link to="/order-history" className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 transition">
                Xem Lịch sử Đơn
              </Link>
            </div>
          </div>
        )}

        {/* TRẠNG THÁI 3: THẤT BẠI */}
        {status === 'error' && (
          <div className="flex flex-col items-center animate-fade-in">
            <XCircle className="text-red-500 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thất bại!</h2>
            <p className="text-gray-600 mb-2">Giao dịch đã bị hủy hoặc có lỗi xảy ra.</p>
            <p className="text-sm text-red-500 mb-6 font-mono bg-red-50 px-3 py-1 rounded">
              {errorMessage}
            </p>
            <Link to="/cart" className="w-full block bg-red-600 text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 transition">
              Quay lại Giỏ hàng
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default PaymentReturn;