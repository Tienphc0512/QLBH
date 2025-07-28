import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { removeFromCart as removeFromCartAPI } from "../services/api"; 
import { Button } from "@/components/ui/button"; 
import { toast } from "react-toastify"; 

const GioHang = ({ token }) => {
  const { cartItems, removeFromCart } = useCart();
  const [loading, setLoading] = useState(false);

  const handleRemove = async (itemId) => {
    try {
      setLoading(true);
      await removeFromCartAPI(itemId, token); // gọi API xoá khỏi server
      removeFromCart(itemId); // xoá khỏi local state
      toast.success("Đã xoá sản phẩm khỏi giỏ hàng");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">🛒 Giỏ hàng của bạn</h2>
      {cartItems.length === 0 ? (
        <p>Chưa có sản phẩm nào trong giỏ hàng.</p>
      ) : (
        <ul className="space-y-4">
          {cartItems.map((item) => (
            <li key={item.id} className="border p-3 rounded flex justify-between items-center">
              <div>
                <p className="font-medium">{item.ten}</p>
                <p>Số lượng: {item.soluong}</p>
                <p>Giá: {item.gia.toLocaleString()} VNĐ</p>
              </div>
              <Button variant="destructive" disabled={loading} onClick={() => handleRemove(item.id)}>
                Xoá
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GioHang;
