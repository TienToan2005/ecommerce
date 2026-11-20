import React, { useEffect, useRef, useState } from 'react';

interface PaymentCountdownProps {
  /** Hạn thanh toán do backend trả (ISO-8601 có múi giờ). */
  expiresAt: string;
  /** Độ lệch đồng hồ: giờ máy chủ trừ giờ máy khách, tính bằng ms. */
  clockOffsetMs: number;
  onExpire: () => void;
}

const URGENT_MS = 3 * 60 * 1000;

const toneClass = {
  normal: 'bg-amber-50 text-amber-800',
  urgent: 'bg-red-50 text-red-700',
  expired: 'bg-gray-100 text-gray-600',
} as const;

const format = (ms: number) => {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const remainingUntil = (deadline: number, clockOffsetMs: number) =>
  Math.max(0, deadline - (Date.now() + clockOffsetMs));

/** Đồng hồ đếm ngược tự quản lý timer, để trang cha không phải render lại mỗi giây. */
const PaymentCountdown: React.FC<PaymentCountdownProps> = ({ expiresAt, clockOffsetMs, onExpire }) => {
  const deadline = Date.parse(expiresAt);
  const [remainingMs, setRemainingMs] = useState(() => remainingUntil(deadline, clockOffsetMs));

  // Luôn gọi bản onExpire mới nhất mà không phải khởi động lại timer
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (Number.isNaN(deadline)) return;
    let timer: number | undefined;

    const update = () => {
      const left = remainingUntil(deadline, clockOffsetMs);
      setRemainingMs(left);
      if (left === 0) {
        if (timer !== undefined) window.clearInterval(timer);
        timer = undefined;
        onExpireRef.current();
      }
      return left;
    };

    if (update() > 0) {
      timer = window.setInterval(update, 1000);
    }
    return () => {
      if (timer !== undefined) window.clearInterval(timer);
    };
  }, [deadline, clockOffsetMs]);

  if (Number.isNaN(deadline)) return null;

  const tone = remainingMs === 0 ? 'expired' : remainingMs < URGENT_MS ? 'urgent' : 'normal';

  return (
    <div className={`rounded-lg px-4 py-3 ${toneClass[tone]}`}>
      {tone === 'expired' ? (
        <p className="font-medium">Đã hết thời gian thanh toán. Đơn sẽ được hủy trong giây lát, vui lòng không chuyển tiền nữa.</p>
      ) : (
        <p>
          Thời gian còn lại để thanh toán:{' '}
          <span className="font-mono text-xl font-bold tabular-nums">{format(remainingMs)}</span>
        </p>
      )}
    </div>
  );
};

export default PaymentCountdown;
