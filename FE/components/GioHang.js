import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useCart } from "../context/CartContext";
import { removeFromCart as removeFromCartAPI, placeOrder } from "../service/api";
import { useAuth } from "../context/Auth";
import { useNavigation } from "@react-navigation/native";
import Checkbox from "expo-checkbox"; // Dùng checkbox từ expo, hoặc thay bằng bất kỳ lib nào bạn dùng

const GioHang = () => {
  const { cartItems, removeFromCart } = useCart();
  const [loadingId, setLoadingId] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const { token } = useAuth();
  const navigation = useNavigation();

  const toggleSelect = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleRemove = async (itemId) => {
    try {
      setLoadingId(itemId);
      await removeFromCartAPI(itemId, token);
      removeFromCart(itemId);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoadingId(null);
    }
  };

 const handlePlaceOrder = async () => {
  if (selectedItems.length === 0) {
    Alert.alert("Chưa chọn sản phẩm nào", "Vui lòng chọn ít nhất 1 sản phẩm để đặt hàng.");
    return;
  }

  const selectedProducts = cartItems.filter((item) =>
    selectedItems.includes(item.id)
  );

  try {
    const response = await placeOrder(selectedProducts); // Gọi API đặt hàng
    if (response.success) {
      // Optionally gọi xóa khỏi giỏ hàng
      for (const item of selectedProducts) {
        await removeFromCartAPI(item.id); // Gọi API xóa từng sản phẩm khỏi giỏ
      }

      Alert.alert("Đặt hàng thành công", "Đơn hàng của bạn đã được xử lý.");
      navigation.navigate("Đặt hàng", { products: selectedProducts });
    } else {
      Alert.alert("Lỗi đặt hàng", response.message || "Đã có lỗi xảy ra.");
    }
  } catch (error) {
    Alert.alert("Lỗi hệ thống", "Không thể kết nối đến máy chủ.");
    console.error("Order error:", error);
  }
};


  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Checkbox
        value={selectedItems.includes(item.id)}
        onValueChange={() => toggleSelect(item.id)}
        style={styles.checkbox}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.itemName}>{item.ten}</Text>
        <Text>Số lượng: {item.soluong}</Text>
        <Text>Giá: {item.gia.toLocaleString()} VNĐ</Text>
      </View>
      <TouchableOpacity
        style={styles.removeBtn}
        disabled={loadingId === item.id}
        onPress={() => handleRemove(item.id)}
      >
        {loadingId === item.id ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.removeBtnText}>Xoá</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Giỏ hàng của bạn</Text>
      {cartItems.length === 0 ? (
        <Text>Chưa có sản phẩm nào trong giỏ hàng.</Text>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
          <TouchableOpacity
            style={styles.orderBtn}
            onPress={handlePlaceOrder}
            disabled={placingOrder}
          >
            {placingOrder ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.orderBtnText}>Đặt hàng</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fafafa",
  },
  itemName: { fontWeight: "bold", fontSize: 16, marginBottom: 4 },
  removeBtn: {
    backgroundColor: "#e53935",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  removeBtnText: { color: "#fff", fontWeight: "bold" },
  checkbox: {
    marginRight: 12,
  },
  orderBtn: {
    backgroundColor: "#2196F3",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  orderBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default GioHang;
