import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ToastAndroid } from 'react-native';
import { fetchDiaChi, updateDiaChi, deleteDiaChi, addDiaChi } from '../../service/api';
import { useAuth } from '../../context/Auth';

export default function DiaChiModal({ visible, onClose }) {
  const { token } = useAuth();
  const [list, setList] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newDiaChi, setNewDiaChi] = useState('');


  const loadDiaChi = async () => {
    setLoading(true);
    try {
      const data = await fetchDiaChi(token);
          // console.log('Dữ liệu địa chỉ:', data); 

      setList(data);
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (visible) loadDiaChi();
  }, [visible]);

  const handleUpdate = async (index) => {
    try {
      await updateDiaChi(list[index].id, {
        diachi: list[index].diachi,
        macdinh: list[index].macdinh
      }, token);
      ToastAndroid.show('Cập nhật địa chỉ thành công', ToastAndroid.SHORT);
      setEditIndex(null);
      loadDiaChi();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDiaChi(id, token);
      loadDiaChi();
      ToastAndroid.show('Xóa địa chỉ thành công', ToastAndroid.SHORT);
    } catch (err) {
      alert(err.message);
    }
  };

const handleAdd = async () => {
  if (!newDiaChi.trim()) return alert('Vui lòng nhập địa chỉ');

  try {
    await addDiaChi({ diachi: newDiaChi, macdinh: false }, token);
    setNewDiaChi('');
    loadDiaChi();
    ToastAndroid.show('Thêm địa chỉ thành công', ToastAndroid.SHORT);
  } catch (err) {
    alert(err.message);
  }
};


  const handleInputChange = (index, key, value) => {
    const updatedList = [...list];
    updatedList[index][key] = value;
    setList(updatedList);
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.title}>Danh sách địa chỉ</Text>
        <View style={{ marginVertical: 10 }}>
  <Text style={{ fontWeight: 'bold' }}>Thêm địa chỉ mới</Text>
  <TextInput
    value={newDiaChi}
    onChangeText={setNewDiaChi}
    placeholder="Nhập địa chỉ mới"
    style={styles.input}
  />
  <TouchableOpacity
    onPress={handleAdd}
    style={{ ...styles.saveBtn, marginTop: 5 }}
  >
    <Text style={styles.btnText}>Thêm địa chỉ</Text>
  </TouchableOpacity>
</View>


        <ScrollView>
          {loading ? <Text>Đang tải...</Text> :
            list.map((item, index) => (
              <View key={item._id || index.toString()} style={styles.item}>
                {editIndex === index ? (
                  <>
                    <TextInput
                      value={item.diachi}
                      onChangeText={(text) => handleInputChange(index, 'diachi', text)}
                      style={styles.input}
                    />
                   <View style={{ flexDirection: 'row', marginBottom: 5 }}>
  <TouchableOpacity
    style={[styles.radioOption, item.macdinh && styles.radioSelected]}
    onPress={() => handleInputChange(index, 'macdinh', true)}
  >
    <Text style={styles.radioText}>Địa chỉ chính</Text>
  </TouchableOpacity>
  <TouchableOpacity
    style={[styles.radioOption, !item.macdinh && styles.radioSelected]}
    onPress={() => handleInputChange(index, 'macdinh', false)}
  >
    <Text style={styles.radioText}>Địa chỉ phụ</Text>
  </TouchableOpacity>
</View>

                    <TouchableOpacity onPress={() => handleUpdate(index)} style={styles.saveBtn}>
                      <Text style={styles.btnText}>Lưu</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={styles.text}>Địa chỉ: {item.diachi}</Text>
                    <Text style={styles.text}>
  Loại địa chỉ: {item.macdinh ? 'Chính' : 'Phụ'}
</Text>


                    <View style={styles.buttonRow}>
                      <TouchableOpacity onPress={() => setEditIndex(index)} style={styles.editBtn}>
                        <Text style={styles.btnText}>Sửa</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                        <Text style={styles.btnText}>Xóa</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            ))}
        </ScrollView>

        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.btnText}>Đóng</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  item: { marginBottom: 12, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8 },
  text: { fontSize: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, marginTop: 5, marginBottom: 5, borderRadius: 5 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  editBtn: { backgroundColor: '#007bff', padding: 8, borderRadius: 5, marginRight: 10 },
  deleteBtn: { backgroundColor: '#dc3545', padding: 8, borderRadius: 5 },
  saveBtn: { backgroundColor: '#28a745', padding: 8, borderRadius: 5, marginTop: 5 },
  closeBtn: { backgroundColor: '#6c757d', padding: 12, borderRadius: 5, marginTop: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  //địa chỉ thêm 
  radioOption: {
  flex: 1,
  padding: 10,
  marginHorizontal: 5,
  backgroundColor: '#eee',
  borderRadius: 5,
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#ccc',
},
radioSelected: {
  backgroundColor: '#007bff',
  borderColor: '#007bff',
},
radioText: {
  color: '#000',
  fontWeight: 'bold',
},

});
