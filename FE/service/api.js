import axios from 'axios'; 

// const BASE_URL = "http://192.168.100.7:3000"; // IP của máy Windows trong mạng Wi-Fi
const BASE_URL = "http://192.168.1.13:3000";

//api đăng nhập
export async function loginUser(username, password) {
  try {
    const response = await axios.post(`${BASE_URL}/api/dangnhap`, {
      hoten: username,
      matkhau: password
    }, 
  {
    headers: {
      'Content-Type': 'application/json'
    }
  });
      return response.data; 
  } catch (error) {
    // Kiểm tra có phản hồi từ server không
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || 'Đăng nhập thất bại');
    } else {
      throw new Error('Không thể kết nối đến máy chủ');
    }
  }
}

// api đăng ký
export async function registerUser(username, password, email, phone, addr) {
  try {
    const response = await axios.post(`${BASE_URL}/api/dangky`, {
      hoten: username,
      matkhau: password,
      email: email,
      sdt: phone,
      diachi: addr
    }, 
  {
    headers: {
      'Content-Type': 'application/json'
    }
  });
    return response.data; 
  } catch (error) {
    // Kiểm tra có phản hồi từ server không
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || 'Đăng ký thất bại');
    } else {
      throw new Error('Không thể kết nối đến máy chủ');
    }
  }
}

//api xem tài khoản 
export async function fetchTaiKhoan(token) {
  try {
    const response = await axios.get(`${BASE_URL}/api/taikhoan`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || 'Lấy tài khoản thất bại');
    } else {
      throw new Error('Không thể kết nối đến máy chủ');
    }
  }
}

// Cập nhật thông tin tài khoản (yêu cầu token)
export async function updateTaiKhoan({ hoten, sdt, email, matkhau, diachi }, token) {
  try {
    const response = await axios.put(`${BASE_URL}/api/taikhoan`, {
      hoten,
      email,
      sdt,
      matkhau,
      diachi
    }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || 'Cập nhật tài khoản thất bại');
    } else {
      throw new Error('Không thể kết nối đến máy chủ');
    }
  }
}

//api xem danh mục (yêu cầu token)
export async function fetchDanhMuc(name, token) {
  try {
    const response = await axios.get(`${BASE_URL}/api/danhmuc`, {
      params: {
        ten: name
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || 'Lấy danh mục thất bại');
    } else {
      throw new Error('Không thể kết nối đến máy chủ');
    }
  }
}

// api xem sản phẩm (yêu cầu token)
export async function fetchSanPham(name, token) {
  try {
    const response = await axios.get(`${BASE_URL}/api/sanpham`, {
      params: {
        ten: name
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || 'Lấy sản phẩm thất bại');
    } else {
      throw new Error('Không thể kết nối đến máy chủ');
    }
  }
}

// api xem chi tiết sản phẩm
export async function fetchChiTietSanPham(sanphamId, token) {
  try {
    const response = await axios.get(`${BASE_URL}/api/sanpham/${sanphamId}`, {
      headers: {  
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || 'Lấy chi tiết sản phẩm thất bại');
    } else {
      throw new Error('Không thể kết nối đến máy chủ');
    }
  }
}
// api thêm sản phẩm vào giỏ hàng
export async function addToCart(item, token) {  
  try {
    const response = await axios.post(`${BASE_URL}/api/giohang`, {
      sanpham_id: item.id,
      soluong: item.soluong
    }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || 'Thêm sản phẩm vào giỏ hàng thất bại');
    } else {
      throw new Error('Không thể kết nối đến máy chủ');
    }
  }
}

//api xóa sản phẩm khỏi giỏ hàng
export async function removeFromCart(itemId, token) {
  try {
    const response = await axios.delete(`${BASE_URL}/api/giohang/${itemId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || 'Xóa sản phẩm khỏi giỏ hàng thất bại');
    } else {
      throw new Error('Không thể kết nối đến máy chủ');
    }
  }
}

//xem lịch sử đặt hàng
export async function fetchOrderHistory(token) {
  try {
    const response = await axios.get(`${BASE_URL}/api//api/lich_su_dat_hang`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || 'Lấy lịch sử đặt hàng thất bại');
    } else {
      throw new Error('Không thể kết nối đến máy chủ');
    }
  }
}

//api dặt hàng
export async function placeOrder(orderDetails, token) { 
  try {
    const response = await axios.post(`${BASE_URL}/api/dat_hang`, orderDetails, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ products }), // cấu trúc gửi về server
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || 'Đặt hàng thất bại');
    } else {
      throw new Error('Không thể kết nối đến máy chủ');
    }
  }
}

// api xem chitiet đặt hàng
export async function fetchOrderDetails(orderId, token) {
  try {
    const response = await axios.get(`${BASE_URL}/api/chi_tiet_don_hang/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || 'Lấy chi tiết đặt hàng thất bại');
    } else {
      throw new Error('Không thể kết nối đến máy chủ');
    }
  }
}

// api xem thông báo
export async function fetchNotifications(token) {
  try {
    const response = await axios.get(`${BASE_URL}/api/thong_bao`, {
      headers: {
        Authorization: `Bearer ${token}`
      } 
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || 'Lấy thông báo thất bại');
    }
    else {
      throw new Error('Không thể kết nối đến máy chủ');
    }
  }
} 

// api đánh dấu là đã đọc thông báo 
export async function markNotificationAsRead(notificationId, token) {
  try {
    const response = await axios.put(`${BASE_URL}/api/thong_bao/${notificationId}/read`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || 'Đánh dấu thông báo thất bại');
    } else {
      throw new Error('Không thể kết nối đến máy chủ');
    }
  }
}

//api huỷ đơn hàng
export async function cancelOrder(orderId, token) {
  try {
    const response = await axios.delete(`${BASE_URL}/api/huy_don_hang/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || 'Huỷ đơn hàng thất bại');
    } else {
      throw new Error('Không thể kết nối đến máy chủ');
    }
  }
}
// aoi xem lịch sử tìm kiếm = ai
export async function fetchChatHistoryAI(token) {
  try {
    const response = await axios.get(`${BASE_URL}/api/lich_su_tim_kiem`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || 'Lấy lịch sử chat thất bại');
    } else {
      throw new Error('Không thể kết nối đến máy chủ');
    }
  }
}