import { useState } from 'react';
import { createProduct, updateProduct, uploadImage } from '../services/productService';

const getInitialForm = (product) => ({
  name: product?.name || '',
  description: product?.description || '',
  price: product?.price || '',
  stock: product?.stock || '',
});

export default function ProductForm({ product, onSuccess, onCancel }) {
  const isEdit = !!product;
  const [form, setForm] = useState(() => getInitialForm(product));
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = isEdit
        ? await updateProduct(product.id, form)
        : await createProduct(form);

      if (imageFile) {
        await uploadImage(res.data.id, imageFile);
      }

      onSuccess();
    } catch (err) {
      setError('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="product-form">
      <h3>
        {isEdit ? '✏️ Sửa sản phẩm' : '➕ Thêm sản phẩm mới'}
      </h3>

      {error && (
        <div className="form-error">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="product-form__grid">
          <label className="form-field">
            <span>Tên sản phẩm *</span>
            <input
              name="name"
              required
              placeholder="Nhập tên sản phẩm"
              value={form.name}
              onChange={handleChange}
            />
          </label>

          <label className="form-field">
            <span>Giá (₫) *</span>
            <input
              name="price"
              type="number"
              required
              placeholder="Nhập giá"
              value={form.price}
              onChange={handleChange}
            />
          </label>

          <label className="form-field">
            <span>Số lượng tồn kho</span>
            <input
              name="stock"
              type="number"
              placeholder="Nhập số lượng"
              value={form.stock}
              onChange={handleChange}
            />
          </label>

          <label className="form-field">
            <span>Ảnh sản phẩm</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
          </label>
        </div>

        <label className="form-field form-field--full">
          <span>Mô tả</span>
          <textarea
            name="description"
            placeholder="Nhập mô tả sản phẩm"
            value={form.description}
            onChange={handleChange}
          />
        </label>

        <div className="product-form__actions">
          <button
            className="button button--primary"
            type="submit"
            disabled={saving}
          >
            {saving ? '⏳ Đang lưu...' : isEdit ? '💾 Cập nhật' : '➕ Thêm mới'}
          </button>

          <button
            className="button button--secondary"
            type="button"
            onClick={onCancel}
          >
            Hủy
          </button>
        </div>
      </form>
    </section>
  );
}
