import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import UserDropdown from './UserDropdown';
import './Header.css';

export default function Header({ onMenuToggle, className = '' }) {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  return (
    <header className={`header ${className}`}>
      <div className="header__left">
        <button
          className="header__menu-btn"
          onClick={onMenuToggle}
          aria-label="Toggle navigation"
        >
          <span className="header__menu-icon" />
        </button>

        <Link to="/" className="header__brand">
          <span className="header__title">The Literary Commons</span>
        </Link>
      </div>

      <div className="header__right">
        {user && (
          <UserDropdown user={user} logout={logout} />
        )}
      </div>
    </header>
  );
}
