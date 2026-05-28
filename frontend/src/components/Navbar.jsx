import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <span className="navbar__brand">🛒 E-Commerce</span>
      <Link className="navbar__link" to="/">Trang chủ</Link>
      <Link className="navbar__link" to="/admin">Quản lý</Link>
    </nav>
  );
}
