import React, { useState, useEffect } from 'react';
import { fetchDanhMuc, fetchSanPham } from '../service/api'; // Update the path as needed

const TimKiem = ({ token }) => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch categories on mount
    useEffect(() => {
        const getCategories = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await fetchDanhMuc('', token);
                setCategories(data);
            } catch (err) {
                setError(err.message);
            }
            setLoading(false);
        };
        getCategories();
    }, [token]);

    // Fetch products when searchText or selectedCategory changes
    useEffect(() => {
        const getProducts = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await fetchSanPham(searchText, token);
                // Filter by category if selected
                const filtered = selectedCategory
                    ? data.filter((sp) => sp.categoryId === Number(selectedCategory))
                    : data;
                setProducts(filtered);
            } catch (err) {
                setError(err.message);
            }
            setLoading(false);
        };
        getProducts();
    }, [searchText, selectedCategory, token]);

    return (
        <div style={{ maxWidth: 500, margin: '0 auto', padding: 20 }}>
            <h2>Tìm kiếm sản phẩm</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div style={{ marginBottom: 16 }}>
                <label>
                    Danh mục:{' '}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="">Tất cả</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name || cat.ten}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
            <div style={{ marginBottom: 16 }}>
                <label>
                    Tên sản phẩm:{' '}
                    <input
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Nhập tên sản phẩm..."
                    />
                </label>
            </div>
            <div>
                <h3>Kết quả tìm kiếm:</h3>
                {loading ? (
                    <p>Đang tải...</p>
                ) : products.length === 0 ? (
                    <p>Không tìm thấy sản phẩm phù hợp.</p>
                ) : (
                    <ul>
                        {products.map((product) => (
                            <li key={product.id}>
                                {product.name || product.ten} (
                                {
                                    categories.find((cat) => cat.id === product.categoryId)
                                        ?.name || categories.find((cat) => cat.id === product.categoryId)?.ten
                                }
                                )
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default TimKiem;