import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ToastAndroid
} from "react-native";
import { useCart } from "../context/CartContext";
import { removeFromCart as removeFromCartAPI} from "../service/api";
import { useAuth } from "../context/Auth";
import { useNavigation } from "@react-navigation/native";
import Checkbox from "expo-checkbox";

const GioHang = () => {
  const { cartItems, removeFromCart } = useCart();
  const [loadingId, setLoadingId] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const { token } = useAuth();
  const navigation = useNavigation();

  const toggleSelect = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };
const handlePlaceOrder = async () => {
  if (selectedItems.length === 0) {
    ToastAndroid.show("Vui lòng chọn ít nhất 1 sản phẩm để đặt hàng.", ToastAndroid.SHORT);
    return;
  }

  const selectedProducts = cartItems
    .filter((item) => selectedItems.includes(item.id))
    .map((item) => ({
      ...item,
      // tonKho: parseInt(item.soluong), // thêm trường `tonKho` từ tồn kho thật
      //  quantity: item.quantity || 1, 
    }));

  navigation.navigate("Đặt hàng", { selectedProducts });
};



  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Checkbox
        value={selectedItems.includes(item.id)}
        onValueChange={() => toggleSelect(item.id)}
        style={styles.checkbox}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.itemName}>{item.ten} {item.ten_san_pham}</Text>
        <Text>Số lượng: {item.soluong}</Text>
        <Text>Giá: {item.gia.toLocaleString()} VNĐ</Text>
      </View>
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
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListHeaderComponent={
          <View style={styles.selectAllContainer}>
            <Checkbox
              value={selectedItems.length === cartItems.length}
              onValueChange={() => {
                if (selectedItems.length === cartItems.length) {
                  setSelectedItems([]);
                } else {
                  setSelectedItems(cartItems.map((item) => item.id));
                }
              }}
            />
            <Text style={{ marginLeft: 8 }}>Chọn tất cả</Text>
          </View>
        }
      />

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.deleteBtn, { flex: 1, marginRight: 8 }]}
          onPress={async () => {
            if (selectedItems.length === 0) {
              Alert.alert("Chưa chọn sản phẩm nào", "Vui lòng chọn ít nhất 1 sản phẩm để xoá.");
              return;
            }

            Alert.alert(
              "Xác nhận xoá",
              `Bạn có chắc muốn xoá ${selectedItems.length} sản phẩm?`,
              [
                { text: "Huỷ" },
                {
                  text: "Xoá",
                  style: "destructive",
                  onPress: async () => {
                    for (const itemId of selectedItems) {
                      await removeFromCartAPI(itemId, token);
                      removeFromCart(itemId);
                    }
                    setSelectedItems([]);
                  },
                },
              ]
            );
          }}
        >
          <Text style={styles.orderBtnText}>Xoá đã chọn</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.orderBtn, { flex: 1 }]}
          onPress={handlePlaceOrder}
          disabled={isPlacingOrder}
        >
          {isPlacingOrder ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.orderBtnText}>Đặt hàng</Text>
          )}
        </TouchableOpacity>
      </View>
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
  selectAllContainer: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 10,
},

actionButtons: {
  flexDirection: "row",
  marginTop: 10,
},

deleteBtn: {
  backgroundColor: "#f44336",
  padding: 16,
  borderRadius: 8,
  alignItems: "center",
},

});

export default GioHang;
