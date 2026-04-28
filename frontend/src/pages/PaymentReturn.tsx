import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import * as orderApi from '../services/order';

const PaymentReturn: React.FC = () => {
  const location = useLocation(); // Lấy cục URL params
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        if (!location.search) {
          setStatus('error');
          return;
        }

        await orderApi.verifyVnPayPayment(location.search);
        setStatus('success');

      } catch (error) {
        console.error("Lỗi xác thực thanh toán:", error);
        setStatus('error');
      }
    };

    verifyPayment();
  }, [location]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader className="animate-spin text-red-600 mb-4" size={48} />
            <h2 className="text-xl font-bold text-gray-800">Đang xác thực thanh toán...</h2>
            <p className="text-gray-500 mt-2">Vui lòng không đóng trình duyệt lúc này.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center animate-fade-in">
            <CheckCircle className="text-green-500 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thành công!</h2>
            <p className="text-gray-600 mb-6">Cảm ơn bạn đã mua sắm. Đơn hàng đang được xử lý.</p>
            <div className="flex gap-4 w-full">
              <Link to="/" className="flex-1 border border-gray-300 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition">Về Trang chủ</Link>
              <Link to="/order-history" className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 transition">Xem Đơn hàng</Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center animate-fade-in">
            <XCircle className="text-red-500 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thất bại!</h2>
            <p className="text-gray-600 mb-6">Giao dịch đã bị hủy hoặc có lỗi xảy ra. Vui lòng thử lại.</p>
            <Link to="/cart" className="w-full block bg-red-600 text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 transition">Quay lại Giỏ hàng</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentReturn;