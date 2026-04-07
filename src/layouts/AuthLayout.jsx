import { Outlet } from 'react-router-dom';
import './Layout.css';

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-layout__container page-enter">
        <div className="auth-layout__brand">
          <h1 className="auth-layout__title">The Literary Commons</h1>
          <p className="auth-layout__subtitle">
            A place for thinking together
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
