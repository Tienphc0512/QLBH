import axios from 'axios'; 

const BASE_URL = "http://192.168.100.7:3000"; // IP của máy Windows trong mạng Wi-Fi


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

