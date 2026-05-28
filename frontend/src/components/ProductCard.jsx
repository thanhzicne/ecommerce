export default function ProductCard({ product }) {
  return (
    <article className="product-card">
      {product.imageUrl ? (
        <img
          className="product-card__image"
          src={product.imageUrl}
          alt={product.name}
        />
      ) : (
        <div className="product-card__placeholder">
          Chưa có ảnh
        </div>
      )}
      <h3 className="product-card__name">{product.name}</h3>
      <p className="product-card__description">{product.description}</p>
      <strong className="product-card__price">
        {Number(product.price).toLocaleString('vi-VN')}₫
      </strong>
    </article>
  );
}
