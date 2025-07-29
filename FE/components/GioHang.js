import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useCart } from "../context/CartContext";
import { removeFromCart as removeFromCartAPI } from "../service/api";

const GioHang = ({ token }) => {
  const { cartItems, removeFromCart } = useCart();
  const [loadingId, setLoadingId] = useState(null);

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

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View>
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
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  removeBtnText: { color: "#fff", fontWeight: "bold" },
});

export default GioHang;