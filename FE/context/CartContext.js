import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { useAuth } from "./Auth";
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
 const { userId } = useAuth();

 // Hàm lưu giỏ hàng vào AsyncStorage theo userId
  const saveCartToStorage = async (userId, cart) => {
    try {
      await AsyncStorage.setItem(`cart_${userId}`, JSON.stringify(cart));
    } catch (error) {
      console.error("Lỗi lưu giỏ hàng:", error);
    }
  };

  // Hàm load giỏ hàng từ AsyncStorage khi đăng nhập
  const loadCartFromStorage = async () => {
    try {
      const savedCart = await AsyncStorage.getItem(`cart_${userId}`);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Lỗi load giỏ hàng:", error);
    }
  };

  // Tự động load khi userId thay đổi
  useEffect(() => {
    if (userId) {
      loadCartFromStorage();
    }
  }, [userId]);

   // Thêm sản phẩm vào giỏ (nếu trùng thì chỉ tăng số lượng)
  const addToCart = (newItem) => {
    setCartItems((prevItems) => {
      const index = prevItems.findIndex((item) => item.id === newItem.id);
      let updatedCart;

      if (index !== -1) {
        updatedCart = [...prevItems];
        updatedCart[index].soluong += newItem.soluong;
      } else {
        updatedCart = [...prevItems, newItem];
      }

      saveCartToStorage(userId, updatedCart);
      return updatedCart;
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook để sử dụng dễ hơn
export const useCart = () => useContext(CartContext);
