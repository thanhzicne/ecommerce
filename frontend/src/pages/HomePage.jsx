import { useEffect, useState } from 'react';
import { getProducts } from '../services/productService';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getProducts()
      .then((res) => setProducts(res.data))
      .catch((err) => setError('Không kết nối được API: ' + err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="page-message">⏳ Đang tải sản phẩm...</p>;
  }

  if (error) {
    return (
      <div className="page-message page-message--error">
        ❌ {error}
        <p>Kiểm tra: EC2 đang chạy? Đúng IP? Backend port 8080 mở chưa?</p>
      </div>
    );
  }

  if (products.length === 0) {
    return <p className="page-message">Chưa có sản phẩm nào.</p>;
  }

  return (
    <main className="page">
      <h2>Danh sách sản phẩm ({products.length})</h2>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
