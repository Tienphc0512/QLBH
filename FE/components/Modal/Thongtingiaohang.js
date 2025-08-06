import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function Thongtingiaohang({ visible, onClose, orderInfo }) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Thông tin giao hàng</Text>
          {orderInfo ? (
            <>
              <Text style={styles.modalText}>Người nhận: {orderInfo.username}</Text>
              <Text style={styles.modalText}>SĐT: {orderInfo.sdt}</Text>
              <Text style={styles.modalText}>Địa chỉ: {orderInfo.diachi}</Text>
            </>
          ) : (
            <Text style={styles.modalText}>Không có thông tin người nhận.</Text>
          )}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#2c3e50',
  },
  modalText: {
    fontSize: 15,
    marginBottom: 6,
    color: '#34495e',
  },
  closeButton: {
    marginTop: 16,
    alignSelf: 'center',
    backgroundColor: '#2980b9',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
