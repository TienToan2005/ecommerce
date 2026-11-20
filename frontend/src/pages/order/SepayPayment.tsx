import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, Copy, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';
import * as orderApi from '../../services/order';
import type { OrderResponse } from '../../types/order';
import { formatCurrency } from '../../utils/format';

const POLL_INTERVAL_MS = 3000;

const SepayPayment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const notifiedPaid = useRef(false);

  const isPaid = order?.paymentInfo?.status === 'COMPLETED' || order?.status === 'CONFIRMED';
  const isCancelled = order?.status === 'CANCELLED';
  const isFinished = isPaid || isCancelled;

  // Lấy trạng thái đơn ngay khi vào trang, rồi hỏi lại mỗi vài giây cho tới khi có kết quả
  useEffect(() => {
    if (!orderId) return;
    let stopped = false;

    const fetchOrder = async () => {
      try {
        const data = await orderApi.getOrderById(orderId);
        if (!stopped) {
          setOrder(data);
          setLoadFailed(false);
        }
      } catch {
        if (!stopped) setLoadFailed(true);
      }
    };

    fetchOrder();
    if (isFinished) {
      return () => { stopped = true; };
    }
    const timer = window.setInterval(fetchOrder, POLL_INTERVAL_MS);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [orderId, isFinished]);

  useEffect(() => {
    if (isPaid && !notifiedPaid.current) {
      notifiedPaid.current = true;
      toast.success('Thanh toán thành công!');
    }
  }, [isPaid]);

  const copyCode = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Đã sao chép nội dung chuyển khoản');
    } catch {
      toast.error('Không sao chép được, hãy chọn và copy thủ công');
    }
  };

  if (!orderId || (loadFailed && !order)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center mt-10">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-gray-100">
          <XCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold text-gray-800">Không tải được đơn hàng</h2>
          <Link to="/order-history" className="inline-block mt-6 px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition">
            Về lịch sử đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center mt-10">
        <Loader className="animate-spin text-red-600" size={48} />
      </div>
    );
  }

  const payment = order.paymentInfo;

  if (isPaid) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center mt-10">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-gray-100">
          <CheckCircle className="text-emerald-500 mx-auto mb-4" size={56} />
          <h2 className="text-2xl font-bold text-gray-800">Thanh toán thành công</h2>
          <p className="text-gray-500 mt-2">Đơn {order.orderNumber} đã được xác nhận.</p>
          <p className="text-lg font-bold text-red-600 mt-2">{formatCurrency(payment?.amount ?? 0)}</p>
          <Link to={`/order-history/${order.id}`} className="inline-block mt-6 px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition">
            Xem đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  if (isCancelled) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center mt-10">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-gray-100">
          <XCircle className="text-red-500 mx-auto mb-4" size={56} />
          <h2 className="text-2xl font-bold text-gray-800">Đơn hàng đã bị hủy</h2>
          <p className="text-gray-500 mt-2">Đơn chưa được thanh toán kịp thời hạn. Nếu bạn đã chuyển tiền, hãy liên hệ cửa hàng để được hỗ trợ.</p>
          <Link to="/order-history" className="inline-block mt-6 px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition">
            Về lịch sử đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6 bg-white p-4 rounded-xl shadow-sm">
          <h1 className="text-2xl font-bold text-red-600 border-l-4 border-red-600 pl-3">Thanh toán chuyển khoản</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col items-center">
            {payment?.qrUrl ? (
              <img
                src={payment.qrUrl}
                alt="Mã QR thanh toán"
                className="w-64 h-64 object-contain border border-gray-100 rounded-xl"
              />
            ) : (
              <div className="w-64 h-64 flex flex-col items-center justify-center text-center text-sm text-gray-500 border border-dashed rounded-xl p-4">
                <QrCode size={40} className="mb-2 text-gray-400" />
                Chưa cấu hình tài khoản nhận tiền cho mã QR (SEPAY_QR_ACCOUNT, SEPAY_QR_BANK).
              </div>
            )}
            <p className="text-sm text-gray-500 mt-4 text-center">Mở app ngân hàng và quét mã để chuyển khoản</p>
            <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
              <Loader className="animate-spin text-red-600" size={16} />
              Đang chờ thanh toán...
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <p className="text-gray-500">Mã đơn hàng</p>
              <p className="font-bold text-gray-800">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-gray-500">Số tiền cần chuyển</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(payment?.amount ?? 0)}</p>
            </div>
            <div>
              <p className="text-gray-500">Nội dung chuyển khoản (bắt buộc)</p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded">{payment?.paymentCode ?? '---'}</span>
                {payment?.paymentCode && (
                  <button type="button" onClick={() => copyCode(payment.paymentCode as string)} className="p-2 rounded hover:bg-gray-100 text-gray-500" aria-label="Sao chép nội dung">
                    <Copy size={18} />
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Chuyển đúng số tiền và đúng nội dung để đơn được xác nhận tự động.</p>
            </div>
            <p className="text-xs text-gray-500 border-t pt-4">
              Đơn hàng sẽ tự hủy nếu chưa thanh toán sau 15 phút. Bạn có thể đóng trang này, đơn vẫn được xác nhận khi tiền về.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SepayPayment;
