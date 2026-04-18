/**
 * Format số thành định dạng tiền tệ VNĐ
 * @param amount - Giá trị số cần format (có thể là string hoặc number)
 * @returns Chuỗi đã format dạng 1.000.000₫
 */
export const formatCurrency = (amount: number | string): string => {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(value)) return '0₫';

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  })
    .format(value)
    .replace('₫', '₫') // Đảm bảo ký tự ₫ hiển thị chuẩn
    .trim();
};

/**
 * Format số lượng (ví dụ: 1000 -> 1.000)
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('vi-VN').format(num);
};