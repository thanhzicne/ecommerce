import { useEffect, useState } from 'react';
import { getProducts, deleteProduct } from '../services/productService';
import ProductForm from '../components/ProductForm';

const TABLE_HEADERS = ['ID', 'Ảnh', 'Tên sản phẩm', 'Giá', 'Tồn kho', 'Hành động'];

export default function AdminPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);

    try {
      const res = await getProducts();
      setProducts(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        const res = await getProducts();
        if (!cancelled) {
          setProducts(res.data);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleEdit = (product) => {
    setEditing(product);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa sản phẩm "${name}"?`)) return;
    try {
      await deleteProduct(id);
      fetchProducts();
    } catch (err) {
      alert('Xóa thất bại: ' + err.message);
    }
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditing(null);
    fetchProducts();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditing(null);
  };

  return (
    <main className="admin-page">
      <div className="admin-page__header">
        <h2>🛠️ Quản lý sản phẩm</h2>
        {!showForm && (
          <button
            className="button button--primary"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            + Thêm sản phẩm
          </button>
        )}
      </div>

      {showForm && (
        <ProductForm
          product={editing}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}

      {loading ? (
        <p className="admin-page__loading">⏳ Đang tải...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              {TABLE_HEADERS.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td className="admin-table__id">#{product.id}</td>
                <td>
                  {product.imageUrl ? (
                    <img className="admin-table__image" src={product.imageUrl} alt={product.name} />
                  ) : (
                    <div className="admin-table__image-placeholder">📦</div>
                  )}
                </td>
                <td>
                  <div className="admin-table__name">{product.name}</div>
                  <div className="admin-table__description">{product.description?.slice(0, 40)}</div>
                </td>
                <td className="admin-table__price">
                  {Number(product.price).toLocaleString('vi-VN')}₫
                </td>
                <td>{product.stock}</td>
                <td>
                  <div className="admin-table__actions">
                    <button
                      className="button button--outline-primary"
                      onClick={() => handleEdit(product)}
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      className="button button--outline-danger"
                      onClick={() => handleDelete(product.id, product.name)}
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
