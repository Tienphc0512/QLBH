import React, { useContext, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { CartContext } from "../context/CartContext";

const Chitietsanpham = ({ route, navigation }) => {
  const { item } = route.params;
  const { addToCart } = useContext(CartContext);
  const [soluong, setSoluong] = useState(1);
  const [error, setError] = useState("");

  if (!item) {
    return (
      <View style={styles.center}>
        <Text>Không tìm thấy thông tin sản phẩm.</Text>
      </View>
    );
  }

  const handleIncrease = () => {
    if (soluong < item.tonkho) {
      setSoluong(soluong + 1);
      setError("");
    } else {
      setError("Số lượng vượt quá tồn kho!");
    }
  };

  const handleDecrease = () => {
    if (soluong > 1) {
      setSoluong(soluong - 1);
      setError("");
    }
  };

  const handleAddToCart = () => {
    if (soluong > item.soluong) {
      setError("Số lượng vượt quá tồn kho!");
      return;
    }
    addToCart({ ...item, soluong });
    Alert.alert("Thành công", "Đã thêm vào giỏ hàng!");
  };

  const handleOrderNow = () => {
    if (soluong > item.soluong) {
      setError("Số lượng vượt quá tồn kho!");
      return;
    }
    navigation.navigate("Đặt hàng", { item: { ...item, soluong } });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: item.image_path }} style={styles.image} />
      <Text style={styles.name}>{item.ten}</Text>
      <Text style={styles.price}>{item.gia.toLocaleString()}₫</Text>
      <Text style={styles.desc}>{item.mota}</Text>
      <Text style={{ marginBottom: 8 }}>Tồn kho: {item.soluong}</Text>

      {/* Chọn số lượng */}
      <View style={styles.qtyRow}>
        <TouchableOpacity style={styles.qtyBtn} onPress={handleDecrease}>
          <Text style={styles.qtyBtnText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.qtyText}>{soluong}</Text>
        <TouchableOpacity style={styles.qtyBtn} onPress={handleIncrease}>
          <Text style={styles.qtyBtnText}>+</Text>
        </TouchableOpacity>
      </View>
      {error ? <Text style={{ color: "red", marginBottom: 8 }}>{error}</Text> : null}

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={handleAddToCart}
        >
          <Text style={styles.buttonText}>🛒 Thêm vào giỏ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.orderButton}
          onPress={handleOrderNow}
        >
          <Text style={styles.buttonText}>Mua ngay</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Chitietsanpham;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 220,
    height: 220,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#eee",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    color: "#d32f2f",
    marginBottom: 8,
  },
  desc: {
    fontSize: 16,
    color: "#444",
    marginBottom: 20,
    textAlign: "center",
  },
  buttonGroup: {
    flexDirection: "row",
    marginTop: 12,
  },
  cartButton: {
    backgroundColor: "#388e3c",
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  orderButton: {
    backgroundColor: "#1976d2",
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});