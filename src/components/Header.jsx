import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Avatar from './Avatar';
import './Header.css';

export default function Header({ onMenuToggle, className = '' }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const roleBadge = user?.role === 'professor' ? 'Prof.'
    : user?.role === 'admin' ? 'Admin'
    : null;

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
          <div className="header__user">
            {roleBadge && (
              <span className="header__role">{roleBadge}</span>
            )}
            <Avatar name={user.name} size="sm" />
          </div>
        )}
      </div>
    </header>
  );
}
