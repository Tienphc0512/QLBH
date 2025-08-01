require("dotenv").config(); // Load biến môi trường từ file .env
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const axios = require("axios");

const app = express();
const port = 3000;
const SECRET_KEY = "jahsjkiojwejkdfnlkjaslkjskda";

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL Pool
const pool = new Pool({
  user: "postgres",
  host: "172.23.46.76",  // hoặc 127.0.0.1
  database: "ttnt",
  password: "051203",
  port: 5432,
});

// Middleware xác thực JWT (để bv cho các api cần đăng nhập thì mới truy cạp đc)
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Phiên đã hết hạn, vui lòng đăng nhập lại" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY); // giải mã token
    req.user = decoded;
    req.userId = decoded.id; 
    next();
  } catch (error) {
    return res.status(401).json({ error: "Phiên đã hết hạn, vui lòng đăng nhập lại" });
  }
};



// Đăng ký
app.post("/api/dangky", async (req, res) => {
  const { hoten, sdt, email, matkhau, diachi } = req.body;

    // Kiểm tra định dạng email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Địa chỉ email không hợp lệ" });
  }

  // // Kiểm tra định dạng số điện thoại
  // const phoneRegex = /^0[1-9]{7,10}$/; // $ để ktr chuỗi chính xác k có ký tự thừa các kiểu
  // if (!phoneRegex.test(phone)) {
  //   return res.status(400).json({ error: "Số điện thoại không hợp lệ" });
  // }
  try {
     // Kiểm tra xem tên đăng nhập đã tồn tại chưa
    const result = await pool.query("SELECT * FROM nguoidung WHERE hoten = $1", [hoten]);
    if (result.rows.length > 0) {
      return res.status(400).json({ error: "Tên này đã tồn tại" });
    }
    //hash mk
    const hashedPassword = await bcrypt.hash(matkhau, 10);
    //thêm ng dùng vào csdl
    await pool.query(
      "INSERT INTO nguoidung (hoten, sdt, email, matkhau, diachi) VALUES ($1, $2, $3, $4, $5)",
      [hoten, sdt, email, hashedPassword, diachi]
    );
    res.status(201).json({ message: "Đăng ký người dùng thành công" });
  } catch (err) {
    res.status(400).json({ error: "Username already exists or invalid" });
  }
});

// Đăng nhập
app.post("/api/dangnhap", async (req, res) => {
  const { hoten, matkhau } = req.body;
  const result = await pool.query(
    "SELECT * FROM nguoidung WHERE TRIM(LOWER(hoten)) = LOWER(TRIM($1))",
    [hoten]
  );

  if (result.rows.length === 0)
    return res.status(401).json({ error: "Không tìm thấy người dùng" });

  const user = result.rows[0];
  const match = await bcrypt.compare(matkhau, user.matkhau);
  if (!match) return res.status(401).json({ error: "Sai mật khẩu" });

  const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: "1h" });
  res.json({ token, userId: user.id  });
});

// xem thông tin acc của mình
app.get('/api/taikhoan', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const result = await pool.query(
      'SELECT id, hoten, email, sdt, diachi FROM nguoidung WHERE id = $1',
      [userId] // Lấy thông tin của người dùng hiện tại
    );
    res.json(result.rows[0]); // Trả về dữ liệu người dùng
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi lấy dữ liệu người dùng' });
  }
});

// cập nhật thông tin acc
app.put('/api/taikhoan', verifyToken, async (req, res) => {
  const { hoten, sdt, email, matkhau, diachi } = req.body;

  try {
    let query = '';
    let values = [];

   if (matkhau) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(matkhau, salt);
  query = `
    UPDATE nguoidung 
    SET hoten = $1, email = $2, sdt = $3, matkhau = $4, diachi = $5
    WHERE id = $6
  `;
  values = [hoten, email, sdt, hashedPassword, diachi, req.userId];
} else {
  query = `
    UPDATE nguoidung 
    SET hoten = $1, email = $2, sdt = $3, diachi = $4
    WHERE id = $5
  `;
  values = [hoten, email, sdt, diachi, req.userId];
}


    await pool.query(query, values);

    res.json({ message: 'Đã cập nhật người dùng thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi cập nhập người dùng' });
  }
});

// xem tất cả acc với quyền admin
app.get("/api/all_users", verifyToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM nguoidung");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi lấy người dùng" });
  }
});

//xem tất cả sản phẩm ở home
app.get('/api/sanpham', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
SELECT DISTINCT ON (sp.id)
  sp.id,
  sp.ten AS ten_san_pham,
  sp.gia,
  sp.soluong,
  COALESCE(ha.image_path, 'https://example.com/default-image.jpg') AS anh_dai_dien
FROM sanpham sp
LEFT JOIN hinhanh_sanpham ha ON sp.id = ha.sanpham_id
ORDER BY sp.id, ha.id;


    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi lấy dữ liệu sản phẩm' });
  }
});

//chi tiết sản phẩm
app.get('/api/sanpham/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const sanpham = await pool.query(`
      SELECT * FROM sanpham WHERE id = $1
    `, [id]);

    const hinhanh = await pool.query(`
      SELECT image_path FROM hinhanh_sanpham WHERE sanpham_id = $1
    `, [id]);

    if (sanpham.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }

    res.json({
      ...sanpham.rows[0],
      hinhanh: hinhanh.rows.map(h => h.image_path)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});


// //  API trả về danh sách ảnh cho sản phẩm dựa trên id
// app.get('/api/sanpham/:id/hinhanh', async (req, res) => {
//   const { id } = req.params;
//   try {
//     const result = await pool.query(
//       'SELECT image_path FROM hinhanh_sanpham WHERE sanpham_id = $1',
//       [id]
//     );
//     res.json(result.rows); // ví dụ: [ { image_path: 'https://example.com/uploads/sanpham1_1.jpg' }, ... ]
//   } catch (err) {
//     res.status(500).json({ error: 'Lỗi lấy dữ liệu hình ảnh' });
//   }
// });

// xem danh mục để link qua sản phẩm theo danh mục
app.get("/api/danhmuc", verifyToken, async (req, res) => {
  // console.log("API /api/danhmuc được gọi");

  try {
    const result = await pool.query("SELECT * FROM danhmuc");
    // console.log("Số lượng danh mục:", result.rows.length);
    res.json(result.rows);
  } catch (err) {
    console.error("Lỗi SQL:", err);
    res.status(500).json({ error: "Lỗi khi lấy danh mục" });
  }
});


// xem giỏ hàng 
app.get("/api/giohang", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const result = await pool.query(
      "SELECT * FROM giohang WHERE user_id = $1",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi lấy giỏ hàng" });
  }
});

// thêm sản phẩm vào giỏ hàng
app.post("/api/giohang", verifyToken, async (req, res) => { 
    const { sanpham_id, soluong } = req.body;
    const userId = req.userId;
    
    try {
        // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
        const existingItem = await pool.query(
        "SELECT * FROM giohang WHERE  user_id = $1 AND sanpham_id = $2",
        [userId, sanpham_id]
        );
    
        if (existingItem.rows.length > 0) {
        // Nếu đã có, cập nhật số lượng
        await pool.query(
            "UPDATE giohang SET soluong = soluong + $1 WHERE user_id = $2 AND sanpham_id = $3",
            [soluong, userId, sanpham_id]
        );
        } else {
        // Nếu chưa có, thêm mới
        await pool.query(
            "INSERT INTO giohang ( user_id, sanpham_id, soluong) VALUES ($1, $2, $3)",
            [userId, sanpham_id, soluong]
        );
        }
        res.status(201).json({ message: "Sản phẩm đã được thêm vào giỏ hàng" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi khi thêm sản phẩm vào giỏ hàng" });
    }
    });

// xóa sản phẩm khỏi giỏ hàng
app.delete("/api/giohang/:id", verifyToken, async (req, res) => {
  const itemId = req.params.id;
    const userId = req.userId;
    try {
    // Xóa sản phẩm khỏi giỏ hàng
    const result = await pool.query(
        "DELETE FROM giohang WHERE id = $1 AND user_id = $2",
        [itemId, userId]
        );
 
    res.json({ message: "Sản phẩm đã được xóa khỏi giỏ hàng" });
    } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi xóa sản phẩm khỏi giỏ hàng" });
    }   
});

// Tạo hàm dùng lại cho mọi tình huống
async function taoThongBaoTrangThai(dathang_id, user_id, trangthai) {
  let noidung = '';

  switch (trangthai) {
    case 'danggiao':
      noidung = `Đơn hàng #${dathang_id} đang được giao đến bạn.`;
      break;
    case 'hoanthanh':
      noidung = `Đơn hàng #${dathang_id} đã hoàn thành. Cảm ơn bạn!`;
      break;
    case 'dahuy':
      noidung = `Đơn hàng #${dathang_id} đã bị huỷ.`;
      break;
    default:
      return; // không gửi thông báo cho trạng thái khác
  }

  await pool.query(
    "INSERT INTO thongbao (user_id, dathang_id, noidung) VALUES ($1, $2, $3)",
    [user_id, dathang_id, noidung]
  );
}

// đặt hàng
app.post("/api/dat_hang", verifyToken, async (req, res) => {
  const { items, tongtien } = req.body;
  const user_id = req.userId;

  try {
   // Tạo đơn hàng
const orderResult = await pool.query(
  "INSERT INTO dathang (user_id, tongtien) VALUES ($1, $2) RETURNING id",
  [user_id, tongtien]
);

const dathang_id = orderResult.rows[0].id;

// Thêm chi tiết đơn hàng
for (const item of items) {
  await pool.query(
    "INSERT INTO chitietdathang (dathang_id, sanpham_id, soluong, dongia) VALUES ($1, $2, $3, $4)",
    [dathang_id, item.sanpham_id, item.soluong, item.dongia]
  );
}

// Gửi thông báo đặt hàng
await pool.query(
  "INSERT INTO thongbao (user_id, dathang_id, noidung) VALUES ($1, $2, $3)",
  [user_id, dathang_id, `Bạn đã đặt hàng thành công. Mã đơn hàng: #${dathang_id}`]
);

    res.status(201).json({ message: "Đặt hàng thành công", dathang_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi đặt hàng" });
  }
});

// api cập nhật trạng thái đơn hàng
app.put("/api/donhang/:id/trangthai", verifyToken, async (req, res) => {
  const dathang_id = req.params.id;
  const { trangthai } = req.body;

  try {
    // Cập nhật trạng thái đơn hàng
    const result = await pool.query(
      "UPDATE dathang SET trangthai = $1 WHERE id = $2 RETURNING user_id",
      [trangthai, dathang_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
    }

    const user_id = result.rows[0].user_id;

    // Tạo thông báo tương ứng
    await taoThongBaoTrangThai(dathang_id, user_id, trangthai);

    res.json({ message: "Cập nhật trạng thái thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi cập nhật trạng thái đơn hàng" });
  }
});

// api huỷ đơn hàng
app.delete("/api/huy_don_hang/:id", verifyToken, async (req, res) => {
  const dathang_id = req.params.id;
  const user_id = req.userId;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Xóa chi tiết đơn hàng trước
    await client.query("DELETE FROM chitietdathang WHERE dathang_id = $1", [dathang_id]);

    // Xóa đơn hàng
    const result = await client.query(
      "DELETE FROM dathang WHERE id = $1 AND user_id = $2",
      [dathang_id, user_id]
    );

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
    }

    // Tạo thông báo sau khi xoá thành công
    await client.query(
      "INSERT INTO thongbao (user_id, dathang_id, noidung) VALUES ($1, $2, $3)",
      [user_id, dathang_id, `Bạn đã huỷ đơn hàng #${dathang_id}`]
    );

    await client.query("COMMIT");
    res.json({ message: "Đơn hàng đã được huỷ và thông báo đã được gửi" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Lỗi khi huỷ đơn hàng" });
  } finally {
    client.release();
  }
});


// xem thông báo
app.get("/api/thongbao", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM thongbao WHERE user_id = $1 ORDER BY created_at DESC",
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi lấy thông báo" });
  }
});

// Đánh dấu thông báo là đã đọc
app.put("/api/thongbao/:id/read", verifyToken, async (req, res) => {
  try {
    await pool.query(
      "UPDATE thongbao SET is_read = TRUE WHERE id = $1 AND user_id = $2",
      [req.params.id, req.userId]
    );
    res.json({ message: "Đã đánh dấu là đã đọc" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi cập nhật thông báo" });
  }
});


// xem chi tiết đặt hàng
app.get("/api/chi_tiet_don_hang/:id", verifyToken, async (req, res) => {
  const dathang_id = req.params.id;
  try {
    const result = await pool.query(
      "SELECT * FROM chitietdathang WHERE dathang_id = $1",
      [dathang_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy chi tiết đơn hàng" });
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi lấy chi tiết đơn hàng" });
  }
});
 
// xem lịch sử đặt hàng
app.get("/api/lich_su_dat_hang", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const result = await pool.query( 
      "SELECT * FROM lichsudathang WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi lấy lịch sử đặt hàng" });
  } 
});

// xem lịch sử hủy đơn hàng 
app.get("/api/chi_tiet_huy_don_hang/:id", verifyToken, async (req, res) => {
  const dathang_id = req.params.id;
  try {
    const result = await pool.query(
      "SELECT * FROM lichsuhuy WHERE dathang_id = $1 AND user_id = $2",
      [dathang_id, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy lịch sử hủy đơn hàng" });
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi lấy lịch sử hủy đơn hàng" });
  }
});

// xem lịch sử tìm kiếm trên chatbot
// app.get("/api/lich_su_tim_kiem", verifyToken, async (req, res) => {
//   try {
//     const user_id = req.userId;
//     const result = await pool.query(
//       "SELECT * FROM lichsutimkiemai WHERE user_id = $1 ORDER BY created_at DESC",
//       [user_id]
//     );
//     res.json(result.rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Lỗi khi lấy lịch sử tìm kiếm" });
//   }
// });

app.get("/api/lich_su_tim_kiem", verifyToken, async (req, res) => {
  try {
    const userId = req.userId; // Lấy từ middleware verifyToken
    const result = await pool.query(
      "SELECT * FROM lichsutimkiemai WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Lỗi lấy lịch sử:", err);
    res.status(500).json({ error: "Lỗi khi lấy lịch sử tìm kiếm" });
  }
});

// Gọi Flask API để lấy embedding
// app.post("/api/embed", verifyToken, async (req, res) => {
//   try {
//     const response = await axios.post("http://localhost:5000/embed", {
//       text: req.body.text,
//     });
//     res.json(response.data);
//   } catch (error) {
//     console.error("Embed error:", error.message);
//     res.status(500).json({ error: "Embedding failed" });
//   }
// });

app.post("/api/embed", verifyToken, async (req, res) => {
  try {
    const { text } = req.body;
    const response = await axios.post("http://localhost:5000/embed", { text });
    res.json(response.data);
  } catch (error) {
    console.error("Embed error:", error.message);
    res.status(500).json({ error: "Embedding failed" });
  }
});

// Gọi Flask API để lấy phản hồi chatbot
// app.post("/api/chat", verifyToken, async (req, res) => {
//   try {
//     const response = await axios.post("http://localhost:5000/chat", {
//       prompt: req.body.prompt,
//     });
//     res.json(response.data);
//   } catch (error) {
//     console.error("Chat error:", error.message);
//     res.status(500).json({ error: "Chat failed" });
//   }
// });

app.post("/api/chat", verifyToken, async (req, res) => {
  try {
    const userId = req.userId; 
    const { prompt } = req.body;

    const response = await axios.post("http://localhost:5000/chat", {
      prompt,
      user_id: userId, 
    });

    res.json(response.data); // { response: "..." }
  } catch (error) {
    console.error("Chat error:", error.message);
    res.status(500).json({ error: "Chat failed" });
  }
});

app.post("/api/faq", verifyToken, async (req, res) => {
  const { question, answer } = req.body;
  try {
    // Gọi Flask để lấy embedding
    const embedRes = await axios.post("http://localhost:5000/embed", { text: question });
    const embedding = embedRes.data.embedding;

    // Lưu vào PostgreSQL
    await pool.query(`
      INSERT INTO faq (question, answer, embedding)
      VALUES ($1, $2, $3)
    `, [question, answer, embedding]);

    res.status(201).json({ message: "FAQ added successfully" });
  } catch (error) {
    console.error("Add FAQ error:", error.message);
    res.status(500).json({ error: "Failed to add FAQ" });
  }
});


app.listen(3000, '0.0.0.0', () => {
  console.log('Server is running');
});
