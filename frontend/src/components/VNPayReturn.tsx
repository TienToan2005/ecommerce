import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VNPayReturn = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.search) {
      axios.get(`http://localhost:8080/api/vnpay/return${location.search}`)
        .then((response: any) => {
           alert("Thanh toán thành công!");
           navigate('/orders/success'); 
        })
        .catch((error: any) => {
           alert("Thanh toán thất bại hoặc giao dịch bị hủy!");
           navigate('/orders/failed');
        });
    }
  }, [location]);

  return <div>Đang xác thực giao dịch... Vui lòng đợi!</div>;
};

export default VNPayReturn;